const { test, expect, openApp, goTab, tab, TABS, openGame, progress, PROGRESS_KEY, seedAndReload } = require('../support/fixtures');
const { expectNoHorizontalOverflow, expectTapTargets } = require('../support/checks');
const { ALL_GAMES } = require('../support/games');

test.describe('5-tab navigation', () => {
  test('exactly 5 plain-button tabs (no ARIA tab roles), >= 44px, none cut off', async ({ page }) => {
    await openApp(page);
    await expect(page.locator('#tabbar .tab')).toHaveCount(5);
    await expect(page.locator('#tabbar [role="tab"], #tabbar [role="tablist"]')).toHaveCount(0);
    expect(await page.locator('#tabbar .tab').allInnerTexts().then((a) => a.map((t) => t.replace(/\W+/g, '')))).toEqual(
      expect.arrayContaining(['Hoje', 'Mente', 'Corpo', 'Cuidado', 'Mais'].map((l) => expect.stringContaining(l)))
    );
    await expectTapTargets(page, 'tabbar');
    await expectNoHorizontalOverflow(page, 'tabbar');
  });
});

test.describe('Settings', () => {
  test('sound and vibration switches toggle and persist', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Ajustes');
    for (const name of [/Som/, /Vibração/]) {
      const sw = page.getByRole('switch', { name });
      const before = await sw.getAttribute('aria-checked');
      await sw.click();
      await expect(page.getByRole('switch', { name })).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true');
    }
    const states = await page.getByRole('switch').evaluateAll((els) => els.map((e) => e.getAttribute('aria-checked')));
    await page.reload();
    await goTab(page, 'Ajustes');
    expect(await page.getByRole('switch').evaluateAll((els) => els.map((e) => e.getAttribute('aria-checked')))).toEqual(states);
  });

  test('text size Normal/Grande/Maior sets html font-size 100/115/130% and persists', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Ajustes');
    const fs = () => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    const base = await fs();
    await page.getByRole('button', { name: /^Grande, texto grande/ }).click();
    expect(await fs()).toBeCloseTo(base * 1.15, 0);
    await page.getByRole('button', { name: /^Maior, texto maior/ }).click();
    expect(await fs()).toBeCloseTo(base * 1.3, 0);
    await page.reload();
    expect(await fs()).toBeCloseTo(base * 1.3, 0);
    await goTab(page, 'Ajustes');
    await page.getByRole('button', { name: /^Normal, texto normal/ }).click();
    expect(await fs()).toBeCloseTo(base, 0);
  });

  test('text size 130%: no horizontal overflow and tap targets OK on every screen and game', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Ajustes');
    await page.getByRole('button', { name: /^Maior, texto maior/ }).click();
    for (const label of [...TABS.map((t) => t.label), 'Mais', 'Ajustes']) {
      await goTab(page, label);
      await page.locator('#screen h1, #screen h2').first().waitFor();
      await expectNoHorizontalOverflow(page, `${label} @130%`);
      await expectTapTargets(page, `${label} @130%`);
    }
    for (const id of ALL_GAMES) {
      await openGame(page, id);
      await expectNoHorizontalOverflow(page, `${id} @130%`);
      await expectTapTargets(page, `${id} @130%`);
    }
  });

  test('"Apagar meus dados" is two-step: cancel keeps data, confirm resets to zero', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /SIM, COMI/ }).click();
    await goTab(page, 'Ajustes');
    await page.getByRole('button', { name: 'Apagar meus dados' }).click();
    await expect(page.getByText('Quer mesmo começar do zero?')).toBeVisible();
    await page.getByRole('button', { name: 'Manter meus dados' }).click();
    expect((await progress(page)).totalCompletedChallenges).toBe(1);

    await page.getByRole('button', { name: 'Apagar meus dados' }).click();
    await page.getByRole('button', { name: /Sim, apagar tudo/ }).click();
    await page.waitForTimeout(300);
    await page.reload();
    await page.locator('#tabbar .tab').first().waitFor();
    // after erasing everything the app starts again from zero (onboarding may reappear)
    const p = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), PROGRESS_KEY);
    expect(p === null || p.totalCompletedChallenges === 0).toBe(true);
  });
});

test.describe('storage corruption', () => {
  test('unreadable progress is backed up (<key>_backup) with a gentle toast, not silently reseeded', async ({ page }) => {
    await openApp(page);
    await page.evaluate(() => localStorage.setItem('evermind:evermind_user_progress_v1', '{broken'));
    await page.reload();
    await page.locator('#screen h1').first().waitFor();
    await expect(page.locator('#toast-layer .toast').first()).toContainText(/cópia de segurança/);
    const bak = await page.evaluate(() => localStorage.getItem('evermind:evermind_user_progress_v1_backup'));
    expect(bak).toContain('broken');
    expect((await progress(page)).totalCompletedChallenges).toBe(0);
  });
});

test.describe('discovery history', () => {
  test('completing a discovery is stored in history and the same item cannot be completed twice a day', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Descobrir');
    await page.getByRole('button', { name: /CONCLUÍ ESTA DESCOBERTA/ }).click();
    const hist = await page.evaluate(() => localStorage.getItem('evermind:evermind_discovery_history_v1'));
    expect(hist).toBeTruthy();
    expect((await progress(page)).totalCompletedChallenges).toBe(1);
    await expect(page.getByRole('button', { name: /Descoberta de hoje feita/ })).toBeDisabled();
  });

  test('catalog: >= 34 items, >= 4 per category, rolls differ from the previous item', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const e = EM.domain.discoveryEngine;
      const cats = e.getCategories().map((c) => c.category);
      const items = e.DISCOVERY_CATALOG || e.CATALOG || e.ITEMS || null;
      let repeats = 0, prev = e.rollSurprise([], 'ALL');
      for (let i = 0; i < 60; i++) { const n = e.rollSurprise([prev.id], 'ALL'); if (n.id === prev.id) repeats++; prev = n; }
      return { cats: cats.length, total: items ? items.length : null, perCat: items ? cats.map((c) => items.filter((x) => x.category === c).length) : null, repeats };
    });
    expect(r.cats).toBe(7);
    expect(r.repeats).toBe(0);
    if (r.total !== null) {
      expect(r.total).toBeGreaterThanOrEqual(34);
      for (const n of r.perCat) expect(n).toBeGreaterThanOrEqual(4);
    }
  });
});

test.describe('streak persistence', () => {
  test('streak survives reload and grows on consecutive days, restarts gently after a gap', async ({ page }) => {
    await openApp(page, { time: '2026-08-19T12:00:00-03:00' });
    await goTab(page, 'Corpo');
    await page.getByRole('button', { name: /MARCAR COMO CONCLUÍDO/ }).click();
    await page.reload();
    expect((await progress(page)).currentStreak).toBe(1);
    await page.clock.setSystemTime(new Date('2026-08-20T10:00:00-03:00'));
    await page.reload();
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /SIM, COMI/ }).click();
    expect((await progress(page)).currentStreak).toBe(2);
    await page.clock.setSystemTime(new Date('2026-08-30T10:00:00-03:00'));
    await page.reload();
    await expect(page.locator('#screen')).toContainText('Tudo bem!');
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /VOU ME PREPARAR PARA DORMIR/ }).click();
    const p = await progress(page);
    expect(p.currentStreak).toBe(1);
    expect(p.totalActiveDays).toBe(3);
    expect(p.totalCompletedChallenges).toBe(3);
  });
});
