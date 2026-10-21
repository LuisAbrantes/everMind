const { test, expect, openApp, goTab, TABS } = require('../support/fixtures');
const { expectNoHorizontalOverflow, expectTapTargets } = require('../support/checks');

const { openGame } = require('../support/fixtures');
const GAMES = ['MEMORY', 'SEQUENCE', 'WORDS', 'ATTENTION', 'MUSIC'];

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

  test('all 5 games (every phase): no overflow, tap targets >= 44px', async ({ page }) => {
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
