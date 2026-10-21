// Domain unit layer: runs the real EM.domain.* code in the browser via page.evaluate.
const { test, expect, openApp } = require('../support/fixtures');

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test.describe('brain evolution', () => {
  test('thresholds 5/6/21/51', async ({ page }) => {
    const r = await page.evaluate(() => {
      const e = EM.domain.brainEvolutionEngine;
      const f = (t) => e.evaluateStage(t, 'BABY').stage;
      return [0, 1, 5, 6, 20, 21, 50, 51, 500].map((t) => [t, f(t)]);
    });
    expect(r).toEqual([
      [0, 'BABY'], [1, 'BABY'], [5, 'BABY'], [6, 'KID'], [20, 'KID'],
      [21, 'TEEN'], [50, 'TEEN'], [51, 'MEGA'], [500, 'MEGA'],
    ]);
  });

  test('never regresses: for every previous stage and every total 0..120', async ({ page }) => {
    const bad = await page.evaluate(() => {
      const e = EM.domain.brainEvolutionEngine;
      const order = e.STAGE_ORDER;
      const out = [];
      for (const prev of order)
        for (let t = 0; t <= 120; t++) {
          const got = e.evaluateStage(t, prev).stage;
          if (order.indexOf(got) < order.indexOf(prev)) out.push(`${prev}@${t}->${got}`);
        }
      // total decreasing (e.g. un-toggling a challenge) must keep the highest stage
      let highest = 'BABY';
      for (const t of [3, 8, 25, 60, 10, 2, 0]) {
        const s = e.evaluateStage(t, highest).stage;
        if (order.indexOf(s) < order.indexOf(highest)) out.push(`seq ${t}`);
        highest = s;
      }
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('progress is global-total based and growth points = n x 10', async ({ page }) => {
    const r = await page.evaluate(() => {
      const e = EM.domain.brainEvolutionEngine;
      return { kid6: e.calculateProgress(6, 'KID'), baby9: e.calculateProgress(9, 'BABY'), mega: e.calculateProgress(70, 'MEGA'), pts: e.calculateGrowthPoints(14) };
    });
    expect(r.kid6).toEqual({ current: 6, target: 20, percentage: 30 });
    expect(r.baby9).toEqual({ current: 5, target: 5, percentage: 100 });
    expect(r.mega.percentage).toBe(100);
    expect(r.pts).toBe(140);
  });
});

test.describe('gentle streak', () => {
  const run = (page, last, streak, total, today) =>
    page.evaluate(([l, s, t, d]) => {
      const m = EM.domain.gentleStreakManager;
      return m.evaluateDailyStreak(l, s, t, new Date(d));
    }, [last, streak, total, today]);

  test('first use, same day, next day', async ({ page }) => {
    expect(await run(page, null, 0, 0, '2026-08-19T12:00:00')).toMatchObject({ currentStreak: 1, totalActiveDays: 1, isNewDay: true });
    expect(await run(page, '2026-08-19', 4, 12, '2026-08-19T12:00:00')).toMatchObject({ currentStreak: 4, totalActiveDays: 12, isNewDay: false });
    expect(await run(page, '2026-08-18', 4, 12, '2026-08-19T12:00:00')).toMatchObject({ currentStreak: 5, totalActiveDays: 13, isNewDay: true });
  });

  test('gaps (2, 3, 9, 400 days): streak restarts at 1, total never decreases, message is gentle', async ({ page }) => {
    for (const [last, today] of [
      ['2026-08-17', '2026-08-19T12:00:00'],
      ['2026-08-16', '2026-08-19T12:00:00'],
      ['2026-08-10', '2026-08-19T12:00:00'],
      ['2025-07-15', '2026-08-19T12:00:00'],
    ]) {
      const r = await run(page, last, 6, 31, today);
      expect(r.currentStreak, last).toBe(1);
      expect(r.totalActiveDays, last).toBeGreaterThanOrEqual(31);
      expect(r.encouragementMessage).toContain('Tudo bem');
      expect(r.encouragementMessage).not.toMatch(/perdeu|falhou|zerou|perda|falta|atrasad/i);
    }
  });

  test('timezone-safe: date-only string equal to today is diff 0 (README 5.1 fix)', async ({ page }) => {
    const d = await page.evaluate(() => {
      const m = EM.domain.gentleStreakManager;
      const now = new Date('2026-09-30T20:00:00-03:00');
      return m.getCalendarDayDifference(m.parseLocalDate('2026-09-30'), now);
    });
    expect(d).toBe(0);
  });

  test('streak never decreases across random walks', async ({ page }) => {
    const bad = await page.evaluate(() => {
      const m = EM.domain.gentleStreakManager;
      const out = [];
      for (let gap = 0; gap < 40; gap++) {
        const today = new Date(2026, 7, 19, 12);
        const last = new Date(2026, 7, 19 - gap);
        const lastStr = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
        const r = m.evaluateDailyStreak(lastStr, 6, 30, today);
        // only an explicit gap may reset to 1; total never falls
        if (r.totalActiveDays < 30) out.push(`gap ${gap} total ${r.totalActiveDays}`);
        if (gap <= 1 && r.currentStreak < 6) out.push(`gap ${gap} streak ${r.currentStreak}`);
      }
      return out;
    });
    expect(bad).toEqual([]);
  });
});

test.describe('badge evaluator', () => {
  const evalB = (page, input) => page.evaluate((i) => EM.domain.badgeEvaluator.evaluateBadges(i), input);
  const base = { totalCompletedChallenges: 0, activeDaysInWeek: 0, mindCount: 0, movementCount: 0, connectionCount: 0, currentDate: '2026-08-19' };

  test('catalog has 5 badges, none unlocked at zero', async ({ page }) => {
    const r = await evalB(page, { ...base, currentBadges: [] });
    expect(r.updatedBadges.map((b) => b.id)).toEqual(['BADGE_FIRST_STEPS', 'BADGE_ACTIVE_WEEK', 'BADGE_MIND_IN_MOTION', 'BADGE_PRESENT_FRIEND', 'BADGE_WALKER']);
    expect(r.newlyUnlocked).toEqual([]);
  });

  test('each unlocks exactly at its threshold (5 / 5-of-7 days / 30 / 10 / 20)', async ({ page }) => {
    const cases = [
      ['BADGE_FIRST_STEPS', 'totalCompletedChallenges', 5],
      ['BADGE_ACTIVE_WEEK', 'activeDaysInWeek', 5], // ADR-0009: >= 5 active days in a rolling 7-day window
      ['BADGE_MIND_IN_MOTION', 'mindCount', 30],
      ['BADGE_PRESENT_FRIEND', 'connectionCount', 10],
      ['BADGE_WALKER', 'movementCount', 20],
    ];
    for (const [id, field, n] of cases) {
      const below = await evalB(page, { ...base, [field]: n - 1, currentBadges: [] });
      expect(below.newlyUnlocked.map((b) => b.id), `${id}@${n - 1}`).not.toContain(id);
      const at = await evalB(page, { ...base, [field]: n, currentBadges: [] });
      expect(at.newlyUnlocked.map((b) => b.id), `${id}@${n}`).toContain(id);
      expect(at.updatedBadges.find((b) => b.id === id).unlockedAt).toBe('2026-08-19');
    }
  });

  test('never re-unlocks and preserves the original unlockedAt; never relocks', async ({ page }) => {
    const first = await evalB(page, { ...base, totalCompletedChallenges: 5, currentDate: '2026-08-01', currentBadges: [] });
    const again = await evalB(page, { ...base, totalCompletedChallenges: 9, currentDate: '2026-08-19', currentBadges: first.updatedBadges });
    expect(again.newlyUnlocked).toEqual([]);
    expect(again.updatedBadges.find((b) => b.id === 'BADGE_FIRST_STEPS').unlockedAt).toBe('2026-08-01');
    // counts dropping back to 0 must not relock
    const lower = await evalB(page, { ...base, currentBadges: first.updatedBadges });
    expect(lower.updatedBadges.find((b) => b.id === 'BADGE_FIRST_STEPS').unlockedAt).toBe('2026-08-01');
  });
});

test.describe('weekly summary', () => {
  const report = (page, input, iso = '2026-08-19T12:00:00Z') =>
    page.evaluate(([i, d]) => EM.domain.weeklySummaryCalculator.calculateReport(i, new Date(d)), [input, iso]);
  const input = (m, mv, s, c, days = 0) => ({ mindPillarTotal: m, movementPillarTotal: mv, selfCarePillarTotal: s, connectionPillarTotal: c, consecutiveDays: days });

  test('window is the 7 days [today-6, today]', async ({ page }) => {
    const r = await report(page, input(1, 1, 1, 1));
    expect(r.weekEndDate).toBe('2026-08-19');
    expect(r.weekStartDate).toBe('2026-08-13');
    const r2 = await report(page, input(0, 0, 0, 0), '2026-03-02T10:00:00Z'); // crosses a month boundary
    expect([r2.weekStartDate, r2.weekEndDate]).toEqual(['2026-02-24', '2026-03-02']);
    const days = (new Date(r.weekEndDate) - new Date(r.weekStartDate)) / 86400000;
    expect(days).toBe(6);
  });

  test('totals and affirmative message bands (0, 1-4, 5-14, 15+); perfect-week flag', async ({ page }) => {
    const r0 = await report(page, input(0, 0, 0, 0));
    expect(r0.totalActivitiesCompleted).toBe(0);
    expect(r0.affirmativeMessage).toContain('Que alegria ter você aqui');
    expect(r0.isPerfectActiveWeek).toBe(false);
    const r3 = await report(page, input(1, 1, 1, 0));
    expect(r3.affirmativeMessage).toContain('Que ótimo');
    const r14 = await report(page, input(4, 3, 5, 2));
    expect(r14.totalActivitiesCompleted).toBe(14);
    expect(r14.affirmativeMessage).toContain('Muito bem');
    const r15 = await report(page, input(5, 3, 5, 2));
    expect(r15.affirmativeMessage).toContain('Sensacional');
    const rDays = await report(page, { ...input(0, 0, 0, 1), activeDaysInWeek: 5 });
    expect(rDays.isPerfectActiveWeek).toBe(true);
    expect((await report(page, { ...input(0, 0, 0, 1), activeDaysInWeek: 4 })).isPerfectActiveWeek).toBe(false);
    for (const r of [r0, r3, r14, r15]) expect(r.affirmativeMessage).not.toMatch(/perdeu|falhou|falta|zerou/i);
  });

  test('report includes the 5 badges and unlocks Primeiros Passos at 5+ activities', async ({ page }) => {
    const r = await report(page, input(2, 1, 1, 1));
    expect(r.badges).toHaveLength(5);
    expect(r.badges.find((b) => b.id === 'BADGE_FIRST_STEPS').unlockedAt).toBeTruthy();
    const r0 = await report(page, input(0, 0, 0, 0));
    expect(r0.badges.find((b) => b.id === 'BADGE_FIRST_STEPS').unlockedAt).toBeFalsy();
  });
});

test.describe('progress tracker (recordActivity, ADR-0009)', () => {
  const run = (page, fn, arg) => page.evaluate(`(${fn.toString()})(${JSON.stringify(arg === undefined ? null : arg)})`);

  test('streak: consecutive days grow, a gap restarts at 1, totals never decrease', async ({ page }) => {
    const r = await run(page, () => {
      const t = EM.domain.progressTracker;
      const gw = new EM.storage.InMemoryStorageGateway();
      const snap = (d) => { const p = gw.get(EM.domain.types.STORAGE_KEY_USER_PROGRESS); return { d, s: p.currentStreak, days: p.totalActiveDays, n: p.totalCompletedChallenges, pts: p.growthPoints, stage: p.highestBrainStageAchieved }; };
      const out = [];
      for (const d of ['2026-08-10', '2026-08-11', '2026-08-12']) { t.recordActivity(gw, { date: d, pillar: 'MIND', kind: 'x' }); out.push(snap(d)); }
      t.recordActivity(gw, { date: '2026-08-12', pillar: 'MIND', kind: 'x' }); out.push(snap('same day again'));
      t.recordActivity(gw, { date: '2026-08-20', pillar: 'MIND', kind: 'x' }); out.push(snap('after gap'));
      return out;
    });
    expect(r.map((x) => x.s)).toEqual([1, 2, 3, 3, 1]);
    expect(r.map((x) => x.days)).toEqual([1, 2, 3, 3, 4]);
    expect(r.map((x) => x.n)).toEqual([1, 2, 3, 4, 5]); // every activity counts
    expect(r.map((x) => x.pts)).toEqual([10, 20, 30, 40, 50]);
    for (let i = 1; i < r.length; i++) {
      expect(r[i].n).toBeGreaterThanOrEqual(r[i - 1].n);
      expect(r[i].pts).toBeGreaterThanOrEqual(r[i - 1].pts);
      expect(r[i].days).toBeGreaterThanOrEqual(r[i - 1].days);
    }
  });

  test('weekly window: only the last 7 local days count; active-week badge needs 5 distinct days', async ({ page }) => {
    const r = await run(page, () => {
      const t = EM.domain.progressTracker;
      const gw = new EM.storage.InMemoryStorageGateway();
      const days = ['2026-08-05', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16']; // 08-05 is outside [08-13..08-19]
      for (const d of days) t.recordActivity(gw, { date: d, pillar: 'MIND', kind: 'g' });
      const p1 = gw.get(EM.domain.types.STORAGE_KEY_USER_PROGRESS);
      const w1 = t.weeklyTotals(p1, '2026-08-19');
      const badge1 = p1.badges.some((b) => b.id === 'BADGE_ACTIVE_WEEK');
      t.recordActivity(gw, { date: '2026-08-19', pillar: 'MOVEMENT', kind: 'walk' });
      const p2 = gw.get(EM.domain.types.STORAGE_KEY_USER_PROGRESS);
      const w2 = t.weeklyTotals(p2, '2026-08-19');
      return { w1: { mind: w1.MIND, total: w1.total, active: w1.activeDays, start: w1.weekStartDate, end: w1.weekEndDate }, badge1, w2: { total: w2.total, active: w2.activeDays }, badge2: p2.badges.some((b) => b.id === 'BADGE_ACTIVE_WEEK') };
    });
    expect(r.w1).toEqual({ mind: 4, total: 4, active: 4, start: '2026-08-13', end: '2026-08-19' });
    expect(r.badge1, '4 active days in window: not yet').toBe(false);
    expect(r.w2).toEqual({ total: 5, active: 5 });
    expect(r.badge2, '5 active days in window: unlocked').toBe(true);
  });

  test('brain stage is monotonic through recordActivity and badges keep unlockedAt', async ({ page }) => {
    const r = await run(page, () => {
      const t = EM.domain.progressTracker;
      const gw = new EM.storage.InMemoryStorageGateway();
      const stages = [];
      let firstUnlock = null;
      for (let i = 1; i <= 55; i++) {
        t.recordActivity(gw, { date: '2026-08-19', pillar: 'MIND', kind: 'g' });
        const p = gw.get(EM.domain.types.STORAGE_KEY_USER_PROGRESS);
        stages.push([i, p.highestBrainStageAchieved]);
        const fs = p.badges.find((b) => b.id === 'BADGE_FIRST_STEPS');
        if (fs && !firstUnlock) firstUnlock = fs.unlockedAt;
        if (fs) if (fs.unlockedAt !== firstUnlock) return { err: 'unlockedAt changed' };
      }
      return { at: Object.fromEntries([5, 6, 20, 21, 50, 51].map((n) => [n, stages[n - 1][1]])), firstUnlock: !!firstUnlock };
    });
    expect(r.at).toEqual({ 5: 'BABY', 6: 'KID', 20: 'KID', 21: 'TEEN', 50: 'TEEN', 51: 'MEGA' });
    expect(r.firstUnlock).toBe(true);
  });

  test('triad completions are stored per date and never carried to another day', async ({ page }) => {
    const r = await run(page, () => {
      const t = EM.domain.progressTracker;
      const gw = new EM.storage.InMemoryStorageGateway();
      const triad = EM.domain.dailyTriadCoordinator.generateTriadForDate('2026-08-19', []);
      t.recordActivity(gw, { date: '2026-08-19', pillar: triad[0].pillar, kind: triad[0].activityKey, activityKey: triad[0].activityKey });
      const p = gw.get(EM.domain.types.STORAGE_KEY_USER_PROGRESS);
      const other = EM.domain.dailyTriadCoordinator.generateTriadForDate('2026-08-20', p.triadCompletions['2026-08-20'] || []);
      return { today: p.triadCompletions['2026-08-19'], firstId: triad[0].id, tomorrowDone: other.filter((c) => c.isCompleted).length };
    });
    expect(r.today).toContain(r.firstId);
    expect(r.tomorrowDone).toBe(0);
  });
});
