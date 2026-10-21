const { test, expect, openApp, goTab, TABS } = require('../support/fixtures');
const { expectNoHorizontalOverflow, expectTapTargets } = require('../support/checks');

const { openGame, gymState, gameTiles } = require('../support/fixtures');
const { ALL_GAMES: GAMES } = require('../support/games');

test.describe('layout & touch targets', () => {
  test('every screen (7 + Mais + Ajustes): no horizontal overflow, all buttons/tabs >= 44px', async ({ page }) => {
    await openApp(page);
    const all = [...TABS.map((t) => t.label), 'Mais', 'Ajustes'];
    for (const label of all) {
      await goTab(page, label);
      await page.locator('#screen h1, #screen h2').first().waitFor();
      await expectNoHorizontalOverflow(page, label);
      await expectTapTargets(page, label);
    }
  });

  test('all 9 games (every phase): no overflow, tap targets >= 44px', async ({ page }) => {
    await openApp(page);
    for (const id of GAMES) {
      await openGame(page, id);
      await expectNoHorizontalOverflow(page, id);
      await expectTapTargets(page, id);
      if (id === 'MEMORY') {
        await page.getByRole('button', { name: /ESTOU PRONTO/ }).click();
        await expectNoHorizontalOverflow(page, id + ' selection');
        await expectTapTargets(page, id + ' selection');
      }
    }
  });

  test('games: hint + solved states have no overflow either', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'SEQUENCE');
    const { correct, wrong } = await page.evaluate(() => {
      const p = EM.screens.brainGym._getState().sequenceRound.puzzle;
      return { correct: p.options.indexOf(p.correctAnswer), wrong: p.options.findIndex((o) => o !== p.correctAnswer) };
    });
    await page.locator('#screen button.tile').nth(wrong).click();
    await expectNoHorizontalOverflow(page, 'sequence hint');
    await page.locator('#screen button.tile').nth(correct).click();
    await expectNoHorizontalOverflow(page, 'sequence solved');
    await expectTapTargets(page, 'sequence solved');
  });

  test('Palavras (after a wrong tap and when solved) and the 4 new games (wrong + solved states): no overflow, tap targets >= 44px', async ({ page }) => {
    await openApp(page);
    const check = async (label) => { await expectNoHorizontalOverflow(page, label); await expectTapTargets(page, label); };

    await openGame(page, 'WORDS');
    const w = await gymState(page, '({ pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })');
    await gameTiles(page).nth(w.pool.findIndex((x) => !w.valid.includes(x))).click();
    await check('words wrong');
    for (const [i, word] of w.pool.entries()) if (w.valid.includes(word) && !(await page.getByText('Vocabulário Brilhante').count())) await gameTiles(page).nth(i).click();
    await check('words solved');

    await openGame(page, 'PAIRS');
    const ids = await gymState(page, 's.pairsRound.cards.map((c) => c.pairId)');
    const b = ids.findIndex((p, i) => i > 0 && p !== ids[0]);
    await page.locator('#screen button.pair-card').nth(0).click();
    await page.locator('#screen button.pair-card').nth(b).click();
    await check('pairs mismatch');
    await expect(page.locator('#screen button.pair-card').nth(0)).toHaveAttribute('aria-label', 'Carta 1: escondida'); // the pause is over
    const by = {};
    ids.forEach((id, i) => { (by[id] = by[id] || []).push(i); });
    for (const [i, j] of Object.values(by)) { await page.locator('#screen button.pair-card').nth(i).click(); await page.locator('#screen button.pair-card').nth(j).click(); }
    await expect(page.locator('#screen').getByText('Todos os Pares')).toBeVisible();
    await check('pairs solved');

    await openGame(page, 'PROVERBS');
    let q = await gymState(page, '({ a: s.proverbsRound.proverb.answer, o: s.proverbsRound.options })');
    await gameTiles(page).nth(q.o.findIndex((x) => x !== q.a)).click();
    await check('proverbs wrong');
    await gameTiles(page).nth(q.o.indexOf(q.a)).click();
    await check('proverbs solved');

    await openGame(page, 'MARKET');
    q = await gymState(page, '({ a: s.marketRound.problem.correctCents, o: s.marketRound.options })');
    await gameTiles(page).nth(q.o.findIndex((x) => x !== q.a)).click();
    await check('market wrong');
    await gameTiles(page).nth(q.o.indexOf(q.a)).click();
    await check('market solved');

    await openGame(page, 'ORDER');
    const shown = await gymState(page, 's.orderRound.steps.map((x) => x.id)');
    for (let i = 0; i < 4; i++) await gameTiles(page).nth(i).click();
    await check('order wrong');
    await page.getByRole('button', { name: 'RECOMEÇAR' }).click();
    for (const id of [0, 1, 2, 3]) await gameTiles(page).nth(shown.indexOf(id)).click();
    await check('order solved');
  });

  test('home with all triad challenges completed: no overflow', async ({ page }) => {
    await openApp(page, { time: '2026-08-19T12:00:00-03:00' });
    // triad = SELFCARE fruit, CONNECTION call, MIND (game) -> complete the first two for real
    await goTab(page, 'Cuidado');
    await page.getByRole('button', { name: /SIM, COMI/ }).click();
    await goTab(page, 'Afeto');
    await page.getByRole('button', { name: /JÁ LIGUEI/ }).click();
    await goTab(page, 'Hoje');
    await expectNoHorizontalOverflow(page, 'home 2/3');
    await expectTapTargets(page, 'home 2/3');
  });

  test('tab bar stays fully inside the viewport and tabs do not overlap', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('#tabbar .tab')].map((t) => t.getBoundingClientRect());
      const vw = window.innerWidth;
      const overlaps = tabs.some((t, i) => i && t.left < tabs[i - 1].right - 0.5);
      return { inside: tabs.every((t) => t.left >= -0.5 && t.right <= vw + 0.5), overlaps };
    });
    expect(r).toEqual({ inside: true, overlaps: false });
  });
});
