const { test, expect, openApp, openGame, gameTiles, gymState } = require('../support/fixtures');
const { snapshot, expectAwarded, lastLogEntry } = require('../support/games');
const { expectAntiGuilt, expectLabelInName, PUNITIVE } = require('../support/checks');

/* Formação de Palavras (redesign 2026-10): the user complained that every option
   looked correct. Each challenge now has validSuggestions AND distractors, the
   pool mixes both, and a wrong tap is a soft hint + retry. */

test.describe('Formação de Palavras — data integrity', () => {
  test('>= 8 varied challenges; valid words and distractors are unambiguous, with no duplicates', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.words;
      const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
      const problems = [];
      const ids = new Set();
      const letters = new Set();
      const themes = new Set();
      g.PRESET_WORD_CHALLENGES.forEach((c) => {
        const tag = c.id;
        if (ids.has(c.id)) problems.push(`${tag}: duplicate id`);
        ids.add(c.id);
        letters.add(c.letter);
        themes.add(c.theme);
        if (c.targetCount !== 3) problems.push(`${tag}: targetCount ${c.targetCount}`);
        if (!/^[A-Z]$/.test(c.letter)) problems.push(`${tag}: letter ${c.letter}`);
        // the instruction says precisely what to tap
        const expected = `Toque em 3 ${c.categoryPlural.toUpperCase()} que começam com ${c.letter}`;
        if (c.instruction !== expected) problems.push(`${tag}: instruction "${c.instruction}"`);
        if (!c.itemLabel || !/^(um|uma) /.test(c.itemLabel)) problems.push(`${tag}: itemLabel "${c.itemLabel}"`);
        if (!c.themeDescription) problems.push(`${tag}: no themeDescription`);

        if (c.validSuggestions.length < 6) problems.push(`${tag}: only ${c.validSuggestions.length} valid words`);
        if (!Array.isArray(c.distractors) || c.distractors.length < 4) problems.push(`${tag}: too few distractors`);

        const validFold = c.validSuggestions.map(fold);
        const distFold = c.distractors.map(fold);
        if (new Set(validFold).size !== validFold.length) problems.push(`${tag}: duplicate valid word`);
        if (new Set(distFold).size !== distFold.length) problems.push(`${tag}: duplicate distractor`);
        distFold.forEach((d, i) => {
          if (validFold.includes(d)) problems.push(`${tag}: distractor "${c.distractors[i]}" is also valid`);
        });
        c.validSuggestions.forEach((w) => {
          if (fold(w)[0] !== fold(c.letter)) problems.push(`${tag}: valid word "${w}" does not start with ${c.letter}`);
          if (w !== w.trim() || !w) problems.push(`${tag}: untrimmed/empty valid word`);
        });
        let wrongLetter = 0;
        let wrongTheme = 0;
        c.distractors.forEach((w) => {
          const startsWithLetter = fold(w)[0] === fold(c.letter);
          const kind = g.distractorKind(c, w);
          if (kind !== (startsWithLetter ? 'theme' : 'letter')) problems.push(`${tag}: kind of "${w}" is ${kind}`);
          if (kind === 'letter') wrongLetter++; else wrongTheme++;
        });
        if (wrongLetter < 2) problems.push(`${tag}: only ${wrongLetter} wrong-letter distractors`);
        if (wrongTheme < 2) problems.push(`${tag}: only ${wrongTheme} wrong-theme distractors`);
      });
      return { count: g.PRESET_WORD_CHALLENGES.length, problems, letters: letters.size, themes: themes.size };
    });
    expect(r.problems).toEqual([]);
    expect(r.count).toBeGreaterThanOrEqual(8);
    expect(r.letters, 'different letters').toBeGreaterThanOrEqual(5);
    expect(r.themes, 'different themes').toBe(r.count);
  });

  test('challenge 0 is still "frutas com M" and keeps the already-fixed trimmed-word behaviour', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.words;
      const round = g.createRound(0);
      const ok = g.selectWord(round, '   Maçã  ');
      return { id: round.challenge.id, letter: round.challenge.letter, found: ok.nextState.foundWords, accepted: ok.isAccepted };
    });
    expect(r).toEqual({ id: 'words_letter_m', letter: 'M', found: ['Maçã'], accepted: true });
  });

  test('no punitive wording anywhere in the data, and every composed hint is gentle', async ({ page }) => {
    await openApp(page);
    const strings = await page.evaluate(() => {
      const g = EM.games.words;
      const out = [];
      g.PRESET_WORD_CHALLENGES.forEach((c) => {
        out.push(c.theme, c.themeDescription, c.instruction, c.itemLabel, ...c.validSuggestions, ...c.distractors);
        c.distractors.forEach((d) => out.push(g.hintFor(c, d)));
      });
      return out;
    });
    for (const s of strings) expect(s, s).not.toMatch(PUNITIVE);
    for (const s of strings) expect(s.toLowerCase(), s).not.toMatch(/errad|errou|erro\b|incorret/);
  });
});

test.describe('Formação de Palavras — engine', () => {
  test('the pool shows 4 valid + 4 distractors (2 of each kind), shuffled, with no repeats — for every challenge', async ({ page }) => {
    await openApp(page);
    const bad = await page.evaluate(() => {
      const g = EM.games.words;
      const out = [];
      const orders = new Set();
      g.PRESET_WORD_CHALLENGES.forEach((c, index) => {
        for (let n = 0; n < 40; n++) {
          const round = g.createRound(index);
          const pool = round.optionsPool;
          if (pool.length !== 8) out.push(`${c.id}: pool of ${pool.length}`);
          if (new Set(pool).size !== pool.length) out.push(`${c.id}: repeated option`);
          const valid = pool.filter((w) => c.validSuggestions.includes(w));
          const dist = pool.filter((w) => c.distractors.includes(w));
          if (valid.length !== 4) out.push(`${c.id}: ${valid.length} valid in pool`);
          if (dist.length !== 4) out.push(`${c.id}: ${dist.length} distractors in pool`);
          if (dist.filter((w) => g.distractorKind(c, w) === 'letter').length !== 2) out.push(`${c.id}: wrong-letter count`);
          if (dist.filter((w) => g.distractorKind(c, w) === 'theme').length !== 2) out.push(`${c.id}: wrong-theme count`);
          if (round.foundWords.length || round.wrongWords.length || round.isComplete || round.lastWrongWord) out.push(`${c.id}: dirty new round`);
          if (round.challengeIndex !== index) out.push(`${c.id}: challengeIndex ${round.challengeIndex}`);
          if (index === 0) orders.add(pool.join('|'));
        }
      });
      if (orders.size < 5) out.push(`pool order barely changes (${orders.size} distinct orders in 40 rounds)`);
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('every valid word is accepted; the round completes exactly at targetCount (3) and stays completed', async ({ page }) => {
    await openApp(page);
    const bad = await page.evaluate(() => {
      const g = EM.games.words;
      const out = [];
      g.PRESET_WORD_CHALLENGES.forEach((c, index) => {
        c.validSuggestions.forEach((w) => {
          const r = g.selectWord(g.createRound(index), w);
          if (!r.isAccepted || r.isWrong || r.nextState.foundWords.length !== 1) out.push(`${c.id}: "${w}" not accepted`);
          if (r.nextState.wrongWords.length) out.push(`${c.id}: "${w}" polluted wrongWords`);
        });
        let st = g.createRound(index);
        c.validSuggestions.slice(0, 3).forEach((w, i) => {
          const r = g.selectWord(st, w);
          st = r.nextState;
          if (st.isComplete !== (i === 2)) out.push(`${c.id}: isComplete=${st.isComplete} after ${i + 1} words`);
        });
        const extra = g.selectWord(st, c.validSuggestions[3]);
        if (extra.nextState !== st) out.push(`${c.id}: completed state not returned as the same object`);
        if (st.foundWords.length !== 3) out.push(`${c.id}: ${st.foundWords.length} found`);
      });
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('every distractor is rejected with a gentle hint, recorded in wrongWords and never counted', async ({ page }) => {
    await openApp(page);
    const bad = await page.evaluate(() => {
      const g = EM.games.words;
      const out = [];
      g.PRESET_WORD_CHALLENGES.forEach((c, index) => {
        c.distractors.forEach((w) => {
          const round = g.createRound(index);
          const r = g.selectWord(round, w);
          if (r.isAccepted || !r.isWrong) out.push(`${c.id}: "${w}" was not rejected`);
          if (r.nextState.foundWords.length !== 0) out.push(`${c.id}: "${w}" was counted`);
          if (r.nextState.isComplete) out.push(`${c.id}: "${w}" completed the round`);
          if (r.nextState.wrongWords.join() !== w) out.push(`${c.id}: wrongWords ${r.nextState.wrongWords}`);
          if (r.nextState.lastWrongWord !== w) out.push(`${c.id}: lastWrongWord`);
          if (!r.hint || !r.hint.includes(`"${w}"`) || !/^Quase! /.test(r.hint) || !/Tente outra\.$/.test(r.hint)) out.push(`${c.id}: hint "${r.hint}"`);
          const kind = g.distractorKind(c, w);
          if (kind === 'letter' && !r.hint.includes(`é ${c.itemLabel}, mas não começa com ${c.letter}`)) out.push(`${c.id}: letter hint "${r.hint}"`);
          if (kind === 'theme' && !r.hint.includes(`começa com ${c.letter}, mas não é ${c.itemLabel}`)) out.push(`${c.id}: theme hint "${r.hint}"`);
          // tapping it again, in any casing: same object (nothing changes)
          const again = g.selectWord(r.nextState, ` ${w.toUpperCase()} `);
          if (again.nextState !== r.nextState || again.isAccepted || again.isWrong) out.push(`${c.id}: "${w}" repeated tap is not a no-op`);
          // the round is still alive and completable afterwards
          let st = r.nextState;
          c.validSuggestions.slice(0, 3).forEach((v) => { st = g.selectWord(st, v).nextState; });
          if (!st.isComplete || st.foundWords.length !== 3) out.push(`${c.id}: round not completable after a wrong tap`);
        });
        // a word that is in neither list is a pure no-op
        const round = g.createRound(index);
        if (g.selectWord(round, 'Zebra').nextState !== round) out.push(`${c.id}: unknown word changed the state`);
      });
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('rotation: nextChallengeIndex visits every challenge before repeating and never repeats the current one', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.words;
      const n = g.PRESET_WORD_CHALLENGES.length;
      const seen = [];
      let i = 3;
      for (let k = 0; k < n; k++) { seen.push(i); i = g.nextChallengeIndex(i); }
      return { n, distinct: new Set(seen).size, back: i, repeats: seen.some((v, k) => k && v === seen[k - 1]) };
    });
    expect(r.distinct).toBe(r.n);
    expect(r.back).toBe(3);
    expect(r.repeats).toBe(false);
  });
});

/** Renders every word of every challenge (8 at a time) and reports tiles whose text spills past the tile's own border. */
async function wordsSpillingOutOfTiles(page) {
  await openGame(page, 'WORDS');
  return page.evaluate(() => {
    const s = EM.screens.brainGym._getState();
    const bad = new Set();
    EM.games.words.PRESET_WORD_CHALLENGES.forEach((c, i) => {
      const words = c.validSuggestions.concat(c.distractors);
      for (let k = 0; k < words.length; k += 8) {
        const round = EM.games.words.createRound(i);
        round.optionsPool = words.slice(k, k + 8);
        s.wordsRound = round;
        EM.app.render();
        document.querySelectorAll('#screen button.tile').forEach((t) => {
          if (t.scrollWidth > t.clientWidth + 1) bad.add(`${c.id}: ${t.textContent}`);
        });
        const grid = document.querySelector('#screen .words-grid').getBoundingClientRect();
        const app = document.getElementById('app').getBoundingClientRect();
        if (grid.right > app.right + 1 || grid.left < app.left - 1) bad.add(`${c.id}: grid outside the app`);
      }
    });
    return [...bad];
  });
}

test.describe('Formação de Palavras — long words fit inside their tiles', () => {
  test('every word of every challenge fits its tile at this viewport (normal text)', async ({ page }) => {
    await openApp(page);
    expect(await wordsSpillingOutOfTiles(page)).toEqual([]);
  });

  test('every word of every challenge fits its tile with the text size set to 130% ("Maior")', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('evermind:settings_text_size', '130'));
    await openApp(page);
    expect(await wordsSpillingOutOfTiles(page)).toEqual([]);
  });

  test('the word tiles are 1 column when 2 would not fit and never narrower than 44px tall/wide', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('evermind:settings_text_size', '130'));
    await openApp(page);
    await openGame(page, 'WORDS');
    const r = await page.evaluate(() => {
      const tiles = [...document.querySelectorAll('#screen .words-grid > .tile')].map((t) => t.getBoundingClientRect());
      return { cols: new Set(tiles.map((t) => Math.round(t.left))).size, minW: Math.min(...tiles.map((t) => t.width)), minH: Math.min(...tiles.map((t) => t.height)) };
    });
    expect(r.cols).toBeGreaterThanOrEqual(1);
    expect(r.cols).toBeLessThanOrEqual(2);
    expect(r.minW).toBeGreaterThanOrEqual(100);
    expect(r.minH).toBeGreaterThanOrEqual(54);
  });
});

test.describe('Formação de Palavras — screen', () => {
  test('instruction says exactly what to tap; tiles are named by their visible word', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'WORDS');
    const { instruction, pool } = await gymState(page, '({ instruction: s.wordsRound.challenge.instruction, pool: s.wordsRound.optionsPool })');
    await expect(page.locator('#screen').getByText(`${instruction}.`)).toBeVisible();
    expect(instruction).toMatch(/^Toque em 3 [A-ZÀ-Ý ]+ que começam com [A-Z]$/);
    for (const word of pool) {
      await expect(page.getByRole('button', { name: word, exact: true })).toHaveCount(1);
    }
    await expectLabelInName(page, 'words');
  });

  test('every distractor of the round: soft hint, dashed disabled tile, counter and awards untouched, no red', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'WORDS');
    const before = await snapshot(page);
    const { pool, valid } = await gymState(page, '({ pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })');
    const wrongIdx = pool.map((w, i) => (valid.includes(w) ? -1 : i)).filter((i) => i >= 0);
    expect(wrongIdx).toHaveLength(4);
    const tiles = gameTiles(page);
    for (const [n, i] of wrongIdx.entries()) {
      await tiles.nth(i).click();
      await expect(page.locator('#screen').getByText(`Quase! "${pool[i]}"`, { exact: false })).toBeVisible();
      await expect(tiles.nth(i)).toBeDisabled();
      await expect(tiles.nth(i)).toHaveClass(/op-40/);
      expect(await tiles.nth(i).evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe('dashed');
      await expect(page.locator('#screen').getByText('0 / 3').first()).toBeVisible();
      await expectAntiGuilt(page, `words wrong #${n + 1}`);
    }
    expect(await snapshot(page)).toEqual(before);
    expect(await gymState(page, 's.wordsRound.wrongWords.length')).toBe(4);
    // the round is still alive: 3 valid words complete it, awarding once
    const validIdx = pool.map((w, i) => (valid.includes(w) ? i : -1)).filter((i) => i >= 0);
    for (const i of validIdx.slice(0, 3)) await tiles.nth(i).click();
    await expect(page.locator('#screen').getByText('Vocabulário Brilhante')).toBeVisible();
    await expectAwarded(page, before);
    expect((await lastLogEntry(page)).k).toBe('game:words');
  });

  test('keyboard: a tapped tile keeps focus after the screen redraws (disabled tiles stay focusable)', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'WORDS');
    const { pool, valid } = await gymState(page, '({ pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })');
    const i = pool.findIndex((w) => !valid.includes(w));
    const tile = gameTiles(page).nth(i);
    await tile.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#screen').getByText('Tente outra.', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-focus-key'))).toBe(`word-${pool[i]}`);
  });

  test('rotation in the UI: each new round is a different challenge (+10 points once per round)', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'WORDS');
    const total = await gymState(page, 's.wordsRound.challenge && EM.games.words.PRESET_WORD_CHALLENGES.length');
    const seen = [];
    const before = await snapshot(page);
    for (let round = 0; round < 4; round++) {
      const { idx, pool, valid } = await gymState(page, '({ idx: s.wordsRound.challengeIndex, pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })');
      seen.push(idx);
      const validIdx = pool.map((w, i) => (valid.includes(w) ? i : -1)).filter((i) => i >= 0);
      for (const i of validIdx.slice(0, 3)) await gameTiles(page).nth(i).click();
      await expect(page.locator('#screen').getByText('Vocabulário Brilhante')).toBeVisible();
      await page.getByRole('button', { name: 'PRÓXIMO TEMA' }).click();
      await expect(page.locator('#screen').getByText('0 / 3').first()).toBeVisible();
    }
    expect(seen.slice(1).every((v, k) => v === (seen[k] + 1) % total)).toBe(true);
    expect(new Set(seen).size).toBe(4);
    await expectAwarded(page, before, 4);
  });

  test('a new session starts on a challenge that depends on chance (not always index 0)', async ({ page }) => {
    await page.addInitScript(() => { Math.random = () => 0.95; });
    await openApp(page);
    await openGame(page, 'WORDS');
    const r = await gymState(page, '({ idx: s.wordsRound.challengeIndex, n: EM.games.words.PRESET_WORD_CHALLENGES.length })');
    expect(r.idx).toBe(Math.floor(0.95 * r.n));
    expect(r.idx).not.toBe(0);
  });

  test('the Tríade route (openGame) after a finished round starts the NEXT challenge, so the user really plays', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'WORDS');
    const { idx, pool, valid } = await gymState(page, '({ idx: s.wordsRound.challengeIndex, pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })');
    const validIdx = pool.map((w, i) => (valid.includes(w) ? i : -1)).filter((i) => i >= 0);
    for (const i of validIdx.slice(0, 3)) await gameTiles(page).nth(i).click();
    await expect(page.locator('#screen').getByText('Vocabulário Brilhante')).toBeVisible();
    await page.evaluate(() => EM.app.navigate('BRAIN_GYM', { game: 'WORDS' }));
    const n = await gymState(page, 'EM.games.words.PRESET_WORD_CHALLENGES.length');
    expect(await gymState(page, 's.wordsRound.challengeIndex')).toBe((idx + 1) % n);
    await expect(page.locator('#screen').getByText('0 / 3').first()).toBeVisible();
  });
});
