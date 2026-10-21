const { test, expect, openApp, goTab, progress, readJson, KEY, openGame, gameTiles, gymState } = require('../support/fixtures');
const { expectNoHorizontalOverflow } = require('../support/checks');

const MIND_KEY = KEY('evermind_mind_activities_count');

async function snapshot(page) {
  const p = await progress(page);
  return { total: p.totalCompletedChallenges, points: p.growthPoints, mind: (await readJson(page, MIND_KEY)) || 0, mindPillar: p.pillarTotals.MIND };
}
async function expectAwarded(page, before, n = 1) {
  const after = await snapshot(page);
  expect(after.total, 'totalCompletedChallenges').toBe(before.total + n);
  expect(after.points, 'growthPoints').toBe(before.points + 10 * n);
  expect(after.mind, 'mind activities counter').toBe(before.mind + n);
  expect(after.mindPillar, 'MIND pillar total').toBe(before.mindPillar + n);
}

test.describe('minigames: wrong answer then correct answer awards +1 challenge / +10 points', () => {
  test('1. Memória Visual', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'MEMORY');
    await expect(page.getByText('Olhe com calma para as 5 figuras')).toBeVisible();
    const before = await snapshot(page);
    await page.getByRole('button', { name: /ESTOU PRONTO/ }).click();

    const { targets, decoys } = await gymState(page, `({
      targets: s.memoryRound.displayGrid.map((i, idx) => s.memoryRound.targetItems.some((t) => t.id === i.id) ? idx : -1).filter((i) => i >= 0),
      decoys: s.memoryRound.displayGrid.map((i, idx) => s.memoryRound.targetItems.some((t) => t.id === i.id) ? -1 : idx).filter((i) => i >= 0),
    })`);
    expect(targets).toHaveLength(5);
    const tiles = gameTiles(page);
    await expect(tiles).toHaveCount(8);

    // wrong pick: gentle, no award
    await tiles.nth(decoys[0]).click();
    await expect(page.getByText('0 / 5 CORRETAS')).toBeVisible();
    expect(await snapshot(page)).toEqual(before);

    for (const i of targets) await tiles.nth(i).click();
    await expect(page.getByText('5 / 5 CORRETAS')).toBeVisible();
    await expect(page.getByText('Excelente Memória!')).toBeVisible();
    await expectAwarded(page, before);

    // further clicks never award again
    await tiles.nth(decoys[1]).click({ force: true });
    await expectAwarded(page, before);
  });

  test('2. Sequência Lógica', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'SEQUENCE');
    const before = await snapshot(page);
    const { correct, wrong } = await gymState(page, `({
      correct: s.sequenceRound.puzzle.options.indexOf(s.sequenceRound.puzzle.correctAnswer),
      wrong: s.sequenceRound.puzzle.options.findIndex((o) => o !== s.sequenceRound.puzzle.correctAnswer),
    })`);
    const tiles = gameTiles(page);

    await tiles.nth(wrong).click();
    await expect(page.getByText('DICA CARINHOSA')).toBeVisible();
    await expect(tiles.nth(wrong)).toBeDisabled();
    expect(await snapshot(page)).toEqual(before);

    await tiles.nth(correct).click();
    await expect(page.getByText('Raciocínio Perfeito')).toBeVisible();
    await expectAwarded(page, before);
    await expect(page.getByRole('button', { name: 'PRÓXIMO DESAFIO' })).toBeVisible();
  });

  test('3. Formação de Palavras (UI only offers valid words: no wrong path; completes at 3)', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'WORDS');
    const before = await snapshot(page);
    const tiles = gameTiles(page);

    await tiles.nth(0).click();
    await expect(page.getByText('1 / 3').first()).toBeVisible();
    await tiles.nth(1).click();
    expect(await snapshot(page)).toEqual(before); // nothing awarded before completion
    await tiles.nth(2).click();
    await expect(page.getByText('Vocabulário Brilhante')).toBeVisible();
    await expectAwarded(page, before);
    await expect(page.getByRole('button', { name: 'PRÓXIMO TEMA' })).toBeVisible();
  });

  test('3b. Words engine: invalid word rejected, duplicates never accepted twice', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.words;
      const round = g.createRound(0);
      const bad = g.selectWord(round, 'Zebra');
      const ok = g.selectWord(round, ' maçã ');
      const dupCase = g.selectWord(ok.nextState, 'MAÇÃ');
      const dupUntrimmed = g.selectWord(ok.nextState, ' maçã ');
      return { bad: bad.isAccepted, ok: ok.isAccepted, found: ok.nextState.foundWords.length,
        dupCase: dupCase.isAccepted, dupCaseCount: dupCase.nextState.foundWords.length, dupUntrimmedCount: dupUntrimmed.nextState.foundWords.length };
    });
    expect({ bad: r.bad, ok: r.ok, found: r.found }).toEqual({ bad: false, ok: true, found: 1 });
    expect(r.dupCase, 'duplicate (different case) must be rejected').toBe(false);
    expect(r.dupCaseCount, 'duplicate (different case) must not be counted').toBe(1);
    expect(r.dupUntrimmedCount, 'duplicate (untrimmed) must not be counted').toBe(1);
  });

  test('4. Atenção & Diferenças', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'ATTENTION');
    const before = await snapshot(page);
    const { right, wrong } = await gymState(page, `({
      right: s.attentionRound.puzzle.items.findIndex((i) => i.isDivergent),
      wrong: s.attentionRound.puzzle.items.findIndex((i) => !i.isDivergent),
    })`);
    const tiles = gameTiles(page);
    await tiles.nth(wrong).click();
    await expect(tiles.nth(wrong)).toBeDisabled();
    expect(await snapshot(page)).toEqual(before);

    await tiles.nth(right).click();
    await expect(page.getByText('Olhar Atento')).toBeVisible();
    await expectAwarded(page, before);
  });

  test('5. Memória Musical', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'MUSIC');
    const before = await snapshot(page);
    const { correct, wrong } = await gymState(page, `({
      correct: s.musicRound.track.options.indexOf(s.musicRound.track.correctTitle),
      wrong: s.musicRound.track.options.findIndex((o) => o !== s.musicRound.track.correctTitle),
    })`);
    const tiles = gameTiles(page);

    // a wrong answer does not award and is disabled gently
    await tiles.nth(wrong).click();
    await expect(tiles.nth(wrong)).toBeDisabled();
    expect(await snapshot(page)).toEqual(before);

    await tiles.nth(correct).click();
    await expect(page.getByText('Memória Musical Afetuosa')).toBeVisible();
    await expectAwarded(page, before);
  });

  test('5a. Music with sound off shows the gentle hint to enable it in Ajustes', async ({ page }) => {
    await openApp(page); // fixtures keep sound off
    await openGame(page, 'MUSIC');
    await expect(page.getByText(/ative-o em Ajustes/i)).toBeVisible();
  });

  test('5b. Music playback toggle works (play <-> pause)', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('evermind:settings_sound', 'true'));
    await openApp(page);
    // UI-only check: replace real audio with a silent fake so no sound plays on the dev machine.
    await page.evaluate(() => {
      EM.audio.playNotes = (notes, opts) => ({ stop() { if (opts && opts.onEnd) opts.onEnd(); } });
    });
    await openGame(page, 'MUSIC');
    await page.getByRole('button', { name: /OUVIR/ }).click();
    await expect(page.getByRole('button', { name: /PARAR|PAUSAR/ })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /PARAR|PAUSAR/ }).click();
    await expect(page.getByRole('button', { name: /OUVIR/ })).toHaveAttribute('aria-pressed', 'false');
  });

  test('awards persist after reload and the Mente counter reflects them', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'SEQUENCE');
    const before = await snapshot(page);
    const correct = await gymState(page, 's.sequenceRound.puzzle.options.indexOf(s.sequenceRound.puzzle.correctAnswer)');
    await gameTiles(page).nth(correct).click();
    await expectAwarded(page, before);
    await page.reload();
    await page.locator('#screen h1').waitFor();
    await expectAwarded(page, before);
    await goTab(page, 'Mente');
    await expect(page.getByText(`${before.mind + 1} sessões de ginástica mental`)).toBeVisible();
  });
});

test.describe('game card header', () => {
  for (const id of ['MEMORY', 'SEQUENCE', 'WORDS', 'ATTENTION', 'MUSIC']) {
    test(`badge never overlaps title: ${id}`, async ({ page }) => {
      await openApp(page);
      await openGame(page, id);
      await expect(page.locator('.game-card-header')).toBeVisible();
      const r = await page.evaluate(() => {
        const rect = (e) => e.getBoundingClientRect();
        const hit = (a, b) => !(a.right <= b.left + 0.5 || b.right <= a.left + 0.5 || a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5);
        const title = document.querySelector('.game-card-title');
        const badge = document.querySelector('.game-card-header .badge');
        const header = rect(document.querySelector('.game-card-header'));
        const range = document.createRange();
        range.selectNodeContents(title);
        const b = rect(badge);
        return {
          boxOverlap: hit(rect(title), b),
          textOverlap: hit(range.getBoundingClientRect(), b),
          badgeInside: b.right <= header.right + 1 && b.left >= header.left - 1,
        };
      });
      expect(r.boxOverlap, 'badge box overlaps title box').toBe(false);
      expect(r.textOverlap, 'badge overlaps title text').toBe(false);
      expect(r.badgeInside, 'badge inside header').toBe(true);
      await expectNoHorizontalOverflow(page, id);
    });
  }
});
