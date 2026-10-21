const { test, expect, openApp, goTab, seedAndReload, progress, PROGRESS_KEY, TABS, openGame, gameTiles, gymState } = require('../support/fixtures');
const { expectAntiGuilt } = require('../support/checks');

/** A user who disappeared for 9 days with a 6-day streak and some history. */
async function openAfterMissedDays(page) {
  await openApp(page); // creates the seed
  const p = await progress(page);
  await seedAndReload(page, {
    [PROGRESS_KEY]: {
      ...p, totalCompletedChallenges: 20, highestBrainStageAchieved: 'KID', currentStreak: 6, totalActiveDays: 20,
      lastActiveDate: '2026-08-10', activeDates: ['2026-08-08', '2026-08-09', '2026-08-10'], growthPoints: 200,
    },
  });
}

test.describe('anti-guilt policy', () => {
  test('after a missed streak: gentle message, nothing is taken away', async ({ page }) => {
    await openAfterMissedDays(page);
    await expect(page.locator('#screen')).toContainText('Tudo bem!');
    await expect(page.locator('#screen')).toContainText('1 DIA');
    const p = await progress(page);
    expect(p.growthPoints).toBe(200);
    expect(p.totalCompletedChallenges).toBe(20);
    expect(p.highestBrainStageAchieved).toBe('KID');
  });

  test('no punitive words / red colors on any of the 7 screens (+ Mais, Ajustes)', async ({ page }) => {
    await openAfterMissedDays(page);
    for (const label of [...TABS.map((t) => t.label), 'Mais', 'Ajustes']) {
      await goTab(page, label);
      await page.locator('#screen h1, #screen h2').first().waitFor();
      await expectAntiGuilt(page, label);
    }
  });

  test('no punitive words / red colors in games, including wrong-answer states', async ({ page }) => {
    await openAfterMissedDays(page);
    await goTab(page, 'Mente');
    await expectAntiGuilt(page, 'brain menu');

    // Sequence: wrong, then right
    await openGame(page, 'SEQUENCE');
    let idx = await gymState(page, `({ c: s.sequenceRound.puzzle.options.indexOf(s.sequenceRound.puzzle.correctAnswer), w: s.sequenceRound.puzzle.options.findIndex((o) => o !== s.sequenceRound.puzzle.correctAnswer) })`);
    await gameTiles(page).nth(idx.w).click();
    await expectAntiGuilt(page, 'sequence wrong');
    await gameTiles(page).nth(idx.c).click();
    await expectAntiGuilt(page, 'sequence solved');

    // Memory: memorize phase + wrong pick
    await openGame(page, 'MEMORY');
    await expectAntiGuilt(page, 'memory memorize');
    await page.getByRole('button', { name: /ESTOU PRONTO/ }).click();
    const decoy = await gymState(page, `s.memoryRound.displayGrid.findIndex((i) => !s.memoryRound.targetItems.some((t) => t.id === i.id))`);
    await gameTiles(page).nth(decoy).click();
    await expectAntiGuilt(page, 'memory wrong pick');

    // Attention: wrong
    await openGame(page, 'ATTENTION');
    const aw = await gymState(page, `s.attentionRound.puzzle.items.findIndex((i) => !i.isDivergent)`);
    await gameTiles(page).nth(aw).click();
    await expectAntiGuilt(page, 'attention wrong');

    // Music: wrong
    await openGame(page, 'MUSIC');
    const mw = await gymState(page, `s.musicRound.track.options.findIndex((o) => o !== s.musicRound.track.correctTitle)`);
    await gameTiles(page).nth(mw).click();
    await expectAntiGuilt(page, 'music wrong');

    // Words: initial, a wrong tap (soft hint), then solved
    await openGame(page, 'WORDS');
    await expectAntiGuilt(page, 'words');
    const w = await gymState(page, `({ pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })`);
    await gameTiles(page).nth(w.pool.findIndex((x) => !w.valid.includes(x))).click();
    await expectAntiGuilt(page, 'words wrong');
    for (const [i, word] of w.pool.entries()) if (w.valid.includes(word) && !(await page.getByText('Vocabulário Brilhante').count())) await gameTiles(page).nth(i).click();
    await expectAntiGuilt(page, 'words solved');

    // Pares: initial, mismatch, solved
    await openGame(page, 'PAIRS');
    await expectAntiGuilt(page, 'pairs');
    const ids = await gymState(page, 's.pairsRound.cards.map((c) => c.pairId)');
    const cards = page.locator('#screen button.pair-card');
    await cards.nth(0).click();
    await cards.nth(ids.findIndex((p, i) => i > 0 && p !== ids[0])).click();
    await expectAntiGuilt(page, 'pairs mismatch');
    await expect(cards.nth(0)).toHaveAttribute('aria-label', 'Carta 1: escondida'); // the pause is over
    const by = {};
    ids.forEach((id, i) => { (by[id] = by[id] || []).push(i); });
    for (const [i, j] of Object.values(by)) { await cards.nth(i).click(); await cards.nth(j).click(); }
    await expect(page.getByText('Todos os Pares')).toBeVisible();
    await expectAntiGuilt(page, 'pairs solved');

    // Ditado: wrong, solved
    await openGame(page, 'PROVERBS');
    const pv = await gymState(page, `({ a: s.proverbsRound.proverb.answer, o: s.proverbsRound.options })`);
    await gameTiles(page).nth(pv.o.findIndex((x) => x !== pv.a)).click();
    await expectAntiGuilt(page, 'proverbs wrong');
    await gameTiles(page).nth(pv.o.indexOf(pv.a)).click();
    await expectAntiGuilt(page, 'proverbs solved');

    // Mercado: wrong, solved
    await openGame(page, 'MARKET');
    const mk = await gymState(page, `({ a: s.marketRound.problem.correctCents, o: s.marketRound.options })`);
    await gameTiles(page).nth(mk.o.findIndex((x) => x !== mk.a)).click();
    await expectAntiGuilt(page, 'market wrong');
    await gameTiles(page).nth(mk.o.indexOf(mk.a)).click();
    await expectAntiGuilt(page, 'market solved');

    // Ordem Certa: a wrong complete order, then solved
    await openGame(page, 'ORDER');
    const od = await gymState(page, `s.orderRound.steps.map((x) => x.id)`);
    for (let i = 0; i < 4; i++) await gameTiles(page).nth(i).click();
    await expectAntiGuilt(page, 'order wrong');
    await page.getByRole('button', { name: 'RECOMEÇAR' }).click();
    for (const id of [0, 1, 2, 3]) await gameTiles(page).nth(od.indexOf(id)).click();
    await expectAntiGuilt(page, 'order solved');
  });

  test('missed days on a brand-new user and long gaps (400 days) are still gentle', async ({ page }) => {
    await openApp(page);
    const p = await progress(page);
    await seedAndReload(page, { [PROGRESS_KEY]: { ...p, totalCompletedChallenges: 3, currentStreak: 9, totalActiveDays: 9, lastActiveDate: '2025-07-01', growthPoints: 30 } });
    await expectAntiGuilt(page, 'home after 400 days');
    await expect(page.locator('#screen')).toContainText('Tudo bem!');
  });

  test('sanitizeMessage strips every prohibited term', async ({ page }) => {
    await openApp(page);
    const out = await page.evaluate(() => {
      const m = EM.domain.gentleStreakManager;
      return m.PROHIBITED_WORDS.map((w) => m.sanitizeMessage(`Você ${w} tudo`));
    });
    for (const s of out) expect(s).toContain('recomeço gentil');
  });
});
