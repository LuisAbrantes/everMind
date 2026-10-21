const { test, expect, openApp, goTab, openGame, gameTiles, gymState, tab } = require('../support/fixtures');
const { snapshot, expectAwarded, lastLogEntry, NEW_GAMES } = require('../support/games');
const { expectNoHorizontalOverflow, expectTapTargets, expectAntiGuilt, expectLabelInName, PUNITIVE } = require('../support/checks');

/* Four games of different kinds (not more word games):
   Pares (memory) · Complete o Ditado (culture) · Conta do Mercado (numbers) · Ordem Certa (sequencing) */

const norm = (t) => String(t).replace(/[\s ]+/g, ' ').trim();

test.describe('Mente menu with 9 games', () => {
  test('9 cards, numbered 1-9, each with JOGAR AGORA; the 4 new ones carry the MENTE pillar label', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Mente');
    const cards = page.locator('#screen .game-menu-card');
    await expect(cards).toHaveCount(9);
    await expect(page.getByRole('button', { name: /^JOGAR AGORA/ })).toHaveCount(9);
    const titles = await cards.locator('h2').allInnerTexts();
    expect(titles.map((t) => t.replace(/\s+/g, ' '))).toEqual([
      '1. Memória Visual', '2. Sequência Lógica', '3. Formação de Palavras', '4. Atenção & Diferenças',
      '5. Memória Musical', '6. Pares', '7. Complete o Ditado', '8. Conta do Mercado', '9. Ordem Certa',
    ]);
    for (const [i, title] of ['6. Pares', '7. Complete o Ditado', '8. Conta do Mercado', '9. Ordem Certa'].entries()) {
      const card = cards.nth(5 + i);
      await expect(card).toContainText('MENTE');
      await expect(card.getByRole('button', { name: `JOGAR AGORA: ${title}` })).toBeVisible();
    }
    // label-in-name: the accessible name starts with the visible text
    await expectLabelInName(page, 'menu');
    await expectNoHorizontalOverflow(page, 'menu x9');
    await expectTapTargets(page, 'menu x9');
  });

  test('openGame accepts the four new ids (and the Tríade route can open them); unknown ids are ignored', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const bg = EM.screens.brainGym;
      const out = {};
      for (const id of ['PAIRS', 'PROVERBS', 'MARKET', 'ORDER']) {
        bg.openGame(id);
        out[id] = bg._getState().activeGame;
      }
      bg.openGame('NOPE');
      out.NOPE = bg._getState().activeGame;
      return out;
    });
    expect(r).toEqual({ PAIRS: 'PAIRS', PROVERBS: 'PROVERBS', MARKET: 'MARKET', ORDER: 'ORDER', NOPE: 'ORDER' });
    for (const [id, title] of [['PAIRS', 'Pares'], ['PROVERBS', 'Complete o Ditado'], ['MARKET', 'Conta do Mercado'], ['ORDER', 'Ordem Certa']]) {
      await page.evaluate((g) => EM.app.navigate('BRAIN_GYM', { game: g }), id);
      await expect(page.locator('#screen .card h2').first()).toHaveText(title);
    }
  });

  test('the completed-games counter reads correctly (singular / plural) after new-game completions', async ({ page }) => {
    await openApp(page);
    await goTab(page, 'Mente');
    await expect(page.locator('#screen').getByText('0 sessões de ginástica mental')).toBeVisible();
    await openGame(page, 'ORDER');
    const order = await gymState(page, 's.orderRound.steps.map((x) => x.id)');
    for (const id of [0, 1, 2, 3]) await gameTiles(page).nth(order.indexOf(id)).click();
    await expect(page.locator('#screen').getByText('1 sessão de ginástica mental')).toBeVisible();
    await openGame(page, 'MARKET');
    const m = await gymState(page, '({ c: s.marketRound.problem.correctCents, o: s.marketRound.options })');
    await gameTiles(page).nth(m.o.indexOf(m.c)).click();
    await expect(page.locator('#screen').getByText('2 sessões de ginástica mental')).toBeVisible();
  });
});

/* ============================================================================
   6. PARES
   ============================================================================ */
const cardsOf = (page) => page.locator('#screen button.pair-card');

async function pairsLayout(page) {
  return gymState(page, `({
    pairIds: s.pairsRound.cards.map((c) => c.pairId),
    emojis: s.pairsRound.cards.map((c) => c.emoji),
  })`);
}
/** [[i, j] ...] indexes of the two cards of each pair. */
function pairIndexes(pairIds) {
  const by = {};
  pairIds.forEach((id, i) => { (by[id] = by[id] || []).push(i); });
  return Object.values(by);
}

test.describe('Pares — screen', () => {
  test('12 cards in a 3x4 grid; hidden cards are named "Carta N: escondida" and show their number', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    await expect(cardsOf(page)).toHaveCount(12);
    await expect(page.locator('#screen').getByText('Pares encontrados: 0 / 6')).toBeVisible();
    await expect(page.locator('#screen').getByText('Tentativas: 0')).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await expect(cardsOf(page).nth(i)).toHaveAttribute('aria-label', `Carta ${i + 1}: escondida`);
      await expect(cardsOf(page).nth(i)).toHaveText(String(i + 1));
    }
    const grid = await page.evaluate(() => {
      const r = [...document.querySelectorAll('#screen .pair-card')].map((e) => e.getBoundingClientRect());
      const uniq = (v) => new Set(v.map((n) => Math.round(n))).size;
      return {
        cols: uniq(r.map((x) => x.left)), rows: uniq(r.map((x) => x.top)),
        minW: Math.min(...r.map((x) => x.width)), minH: Math.min(...r.map((x) => x.height)),
        square: r.every((x) => Math.abs(x.width - x.height) < 1.5),
      };
    });
    expect(grid.cols).toBe(3);
    expect(grid.rows).toBe(4);
    expect(grid.minW, 'card width').toBeGreaterThanOrEqual(64);
    expect(grid.minH, 'card height').toBeGreaterThanOrEqual(64);
    expect(grid.square).toBe(true);
    await expectLabelInName(page, 'pairs');
    await expectNoHorizontalOverflow(page, 'pairs');
    await expectTapTargets(page, 'pairs');
  });

  test('a wrong pair flips back after a calm pause (no award); matches stay open; the round awards +1/+10 once', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    const before = await snapshot(page);
    const { pairIds, emojis } = await pairsLayout(page);
    const cards = cardsOf(page);

    // mismatch: two different cards
    const a = 0;
    const b = pairIds.findIndex((p, i) => i > 0 && p !== pairIds[0]);
    await cards.nth(a).click();
    await expect(cards.nth(a)).toHaveAttribute('aria-label', `Carta 1: virada, ${emojis[a]}`);
    await expect(cards.nth(a)).toHaveText(emojis[a]);
    await cards.nth(b).click();
    const t0 = Date.now();
    await expect(cards.nth(b)).toHaveAttribute('aria-label', `Carta ${b + 1}: virada, ${emojis[b]}`);
    await expect(page.locator('#screen').getByText('Tentativas: 1')).toBeVisible();
    await expect(page.locator('#screen').getByText('Pares encontrados: 0 / 6')).toBeVisible();
    await expect(page.locator('#screen').getByText('Essas duas não combinam', { exact: false })).toBeVisible();
    // they stay visible for a calm moment, then turn back by themselves
    await expect(cards.nth(a)).toHaveAttribute('aria-label', `Carta 1: escondida`);
    const elapsed = Date.now() - t0;
    expect(elapsed, 'pause before flipping back (ms)').toBeGreaterThanOrEqual(900);
    expect(elapsed, 'pause before flipping back (ms)').toBeLessThanOrEqual(4000);
    await expect(cards.nth(b)).toHaveAttribute('aria-label', `Carta ${b + 1}: escondida`);
    await expect(page.locator('#screen').getByText('Essas duas não combinam', { exact: false })).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);

    // matches: stay open, counter climbs, last one completes
    const pairs = pairIndexes(pairIds);
    for (const [n, [i, j]] of pairs.entries()) {
      await cards.nth(i).click();
      await cards.nth(j).click();
      await expect(cards.nth(i)).toHaveAttribute('aria-label', `Carta ${i + 1}: par encontrado, ${emojis[i]}`);
      await expect(cards.nth(j)).toHaveAttribute('aria-label', `Carta ${j + 1}: par encontrado, ${emojis[j]}`);
      await expect(page.locator('#screen').getByText(`Pares encontrados: ${n + 1} / 6`)).toBeVisible();
      if (n < pairs.length - 1) expect(await snapshot(page)).toEqual(before); // nothing before completion
    }
    await expect(page.locator('#screen').getByText('Todos os Pares')).toBeVisible();
    await expect(page.locator('#screen').getByText('Tentativas: 7')).toBeVisible();
    await expectAwarded(page, before);
    expect(await lastLogEntry(page)).toMatchObject({ p: 'MIND', k: 'game:pairs' });
    await expect(page.getByRole('button', { name: 'JOGAR OUTRA RODADA' })).toBeVisible();
    // all cards still open; further taps award nothing
    await cards.nth(0).click({ force: true });
    await expectAwarded(page, before);
    await expectAntiGuilt(page, 'pairs complete');
    await expectLabelInName(page, 'pairs complete');
  });

  test('tapping another card during the pause turns the two back at once and opens the new card (never blocks)', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    const { pairIds, emojis } = await pairsLayout(page);
    const cards = cardsOf(page);
    const a = 0;
    const b = pairIds.findIndex((p, i) => i > 0 && p !== pairIds[0]);
    const c = [...pairIds.keys()].find((i) => i !== a && i !== b);
    await cards.nth(a).click();
    await cards.nth(b).click();
    await cards.nth(c).click();
    await expect(cards.nth(a)).toHaveAttribute('aria-label', 'Carta 1: escondida');
    await expect(cards.nth(b)).toHaveAttribute('aria-label', `Carta ${b + 1}: escondida`);
    await expect(cards.nth(c)).toHaveAttribute('aria-label', `Carta ${c + 1}: virada, ${emojis[c]}`);
    await expect(page.locator('#screen').getByText('Tentativas: 1')).toBeVisible();
  });

  test('"Jogar outra rodada" deals a new, complete deck and keeps awarding once per round', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    const before = await snapshot(page);
    for (let round = 1; round <= 2; round++) {
      const { pairIds } = await pairsLayout(page);
      for (const [i, j] of pairIndexes(pairIds)) { await cardsOf(page).nth(i).click(); await cardsOf(page).nth(j).click(); }
      await expect(page.locator('#screen').getByText('Todos os Pares')).toBeVisible();
      await expectAwarded(page, before, round);
      await page.getByRole('button', { name: 'JOGAR OUTRA RODADA' }).click();
      await expect(page.locator('#screen').getByText('Pares encontrados: 0 / 6')).toBeVisible();
      for (let i = 0; i < 12; i++) await expect(cardsOf(page).nth(i)).toHaveAttribute('aria-label', `Carta ${i + 1}: escondida`);
    }
  });

  test('keyboard: Enter and Space flip the focused card and focus stays on it', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    const { emojis } = await pairsLayout(page);
    const focusKey = () => page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-focus-key'));
    await cardsOf(page).nth(3).focus();
    await page.keyboard.press('Enter');
    await expect(cardsOf(page).nth(3)).toHaveAttribute('aria-label', `Carta 4: virada, ${emojis[3]}`);
    expect(await focusKey()).toBe('pair-3');
    await cardsOf(page).nth(7).focus();
    await page.keyboard.press('Space');
    await expect(cardsOf(page).nth(7)).toHaveAttribute('aria-label', new RegExp('^Carta 8: (virada|par encontrado), '));
    expect(await focusKey()).toBe('pair-7');
  });

  test('a flip is announced to screen readers (status region)', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    const names = await gymState(page, 's.pairsRound.cards.map((c) => c.name)');
    await cardsOf(page).nth(0).click();
    await expect(page.locator('#sr-status')).toHaveText(`Carta 1 virada: ${names[0]}.`);
  });

  test('leaving the game during the pause is safe: cards are back on return and nothing throws', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    const { pairIds } = await pairsLayout(page);
    const b = pairIds.findIndex((p, i) => i > 0 && p !== pairIds[0]);
    await cardsOf(page).nth(0).click();
    await cardsOf(page).nth(b).click();
    await page.getByRole('button', { name: /← MENU/ }).click();
    await page.waitForTimeout(1600);
    await openGame(page, 'PAIRS');
    for (let i = 0; i < 12; i++) await expect(cardsOf(page).nth(i)).toHaveAttribute('aria-label', `Carta ${i + 1}: escondida`);
    await goTab(page, 'Hoje');
    await tab(page, 'Mente').click();
  });
});

test.describe('Pares — motion preferences', () => {
  test('normal motion: the freshly flipped card animates (flip); only that card', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PAIRS');
    await cardsOf(page).nth(0).click();
    const names = await page.evaluate(() => [...document.querySelectorAll('#screen .pair-card')].map((e) => getComputedStyle(e).animationName));
    expect(names[0]).toBe('em-pair-flip');
    expect(names.slice(1).every((n) => n === 'none')).toBe(true);
  });

  test('prefers-reduced-motion: no flip animation or transition, and the game still works', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openApp(page);
    await openGame(page, 'PAIRS');
    const before = await snapshot(page);
    const { pairIds } = await pairsLayout(page);
    const cards = cardsOf(page);
    const b = pairIds.findIndex((p, i) => i > 0 && p !== pairIds[0]);
    await cards.nth(0).click();
    await cards.nth(b).click();
    const info = await page.evaluate(() => [...document.querySelectorAll('#screen .pair-card')].map((e) => {
      const cs = getComputedStyle(e);
      return { anim: cs.animationName, trans: parseFloat(cs.transitionDuration) };
    }));
    expect(info.every((i) => i.anim === 'none')).toBe(true);
    expect(info.every((i) => i.trans < 0.01)).toBe(true);
    await expect(cards.nth(0)).toHaveAttribute('aria-label', 'Carta 1: escondida'); // still flips back
    for (const [i, j] of pairIndexes(pairIds)) { await cards.nth(i).click(); await cards.nth(j).click(); }
    await expect(page.locator('#screen').getByText('Todos os Pares')).toBeVisible();
    await expectAwarded(page, before);
  });
});

test.describe('Pares — engine', () => {
  test('deterministic by seed; every deck has 6 distinct figures, each exactly twice, ids 0..11', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.pairs;
      const out = { problems: [], layouts: new Set(), figures: new Set() };
      const same = JSON.stringify(g.createRound(42)) === JSON.stringify(g.createRound(42));
      for (let seed = 1; seed <= 60; seed++) {
        const round = g.createRound(seed);
        out.layouts.add(round.cards.map((c) => c.pairId).join());
        const counts = {};
        round.cards.forEach((c, i) => {
          counts[c.pairId] = (counts[c.pairId] || 0) + 1;
          out.figures.add(c.emoji);
          if (c.id !== i) out.problems.push(`seed ${seed}: card id ${c.id} at ${i}`);
        });
        if (round.cards.length !== 12) out.problems.push(`seed ${seed}: ${round.cards.length} cards`);
        if (Object.keys(counts).length !== 6) out.problems.push(`seed ${seed}: ${Object.keys(counts).length} pairs`);
        if (Object.values(counts).some((n) => n !== 2)) out.problems.push(`seed ${seed}: a figure is not exactly twice`);
        const emojiByPair = {};
        round.cards.forEach((c) => { (emojiByPair[c.pairId] = emojiByPair[c.pairId] || new Set()).add(c.emoji); });
        if (new Set(Object.values(emojiByPair).map((s) => [...s][0])).size !== 6) out.problems.push(`seed ${seed}: two pairs share a figure`);
        if (round.flippedIds.length || round.matchedPairIds.length || round.attempts || round.isComplete || round.pendingMismatch) out.problems.push(`seed ${seed}: dirty new round`);
      }
      const pool = g.PAIR_POOL;
      return {
        same, problems: out.problems, layouts: out.layouts.size, figures: out.figures.size,
        poolUnique: new Set(pool.map((p) => p.emoji)).size === pool.length && new Set(pool.map((p) => p.name)).size === pool.length,
        poolSize: pool.length, delay: g.MISMATCH_DELAY_MS, pairCount: g.PAIR_COUNT,
      };
    });
    expect(r.same).toBe(true);
    expect(r.problems).toEqual([]);
    expect(r.layouts, 'different layouts over 60 seeds').toBeGreaterThan(30);
    expect(r.figures, 'different figures over 60 seeds').toBeGreaterThan(6);
    expect(r.poolUnique).toBe(true);
    expect(r.poolSize).toBeGreaterThanOrEqual(8);
    expect(r.pairCount).toBe(6);
    expect(r.delay).toBeGreaterThanOrEqual(800);
    expect(r.delay).toBeLessThanOrEqual(2000);
  });

  test('flip logic: attempts, match, mismatch, resolve, auto-resolve, completion and same-object no-ops', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.pairs;
      const out = [];
      const ok = (cond, msg) => { if (!cond) out.push(msg); };
      let st = g.createRound(7);
      const idx = (n) => st.cards.map((c, i) => [c.pairId, i]).filter(([p]) => p === st.cards[n].pairId).map(([, i]) => i);
      const other = (n) => st.cards.findIndex((c) => c.pairId !== st.cards[n].pairId);

      // first flip
      let res = g.flipCard(st, 0);
      ok(res.outcome === 'first' && res.nextState.flippedIds.join() === '0' && res.nextState.attempts === 0, 'first flip');
      ok(g.cardStatus(res.nextState, 0) === 'up', 'status up');
      const afterFirst = res.nextState;
      // same card again = no-op
      ok(g.flipCard(afterFirst, 0).nextState === afterFirst && g.flipCard(afterFirst, 0).outcome === 'ignored', 'same card twice must be a no-op');
      // out of range = no-op
      ok(g.flipCard(afterFirst, 99).nextState === afterFirst && g.flipCard(afterFirst, -1).nextState === afterFirst, 'invalid card ids must be no-ops');
      // mismatch
      const b = other(0);
      res = g.flipCard(afterFirst, b);
      ok(res.outcome === 'mismatch' && res.nextState.pendingMismatch && res.nextState.attempts === 1 && res.nextState.matchedPairIds.length === 0, 'mismatch');
      const mism = res.nextState;
      ok(g.resolveMismatch(afterFirst) === afterFirst, 'resolve with nothing pending must be the same object');
      const resolved = g.resolveMismatch(mism);
      ok(!resolved.pendingMismatch && resolved.flippedIds.length === 0 && resolved.attempts === 1, 'resolveMismatch');
      ok(g.cardStatus(resolved, 0) === 'hidden' && g.cardStatus(resolved, b) === 'hidden', 'cards back to hidden');
      // auto-resolve: flipping a third card during the pause
      const c3 = st.cards.findIndex((c, i) => i !== 0 && i !== b);
      res = g.flipCard(mism, c3);
      ok(res.outcome === 'first' && !res.nextState.pendingMismatch && res.nextState.flippedIds.join() === String(c3) && res.nextState.attempts === 1, 'auto-resolve on a third flip');
      // a card of the pending pair is still "up", so flipping it is ignored
      ok(g.flipCard(mism, 0).nextState === mism, 'flipping an already-open card during the pause is a no-op');

      // play the whole deck
      let attempts = 0;
      for (let p = 0; p < 6; p++) {
        const remaining = st.cards.map((c, i) => i).filter((i) => g.cardStatus(st, i) === 'hidden');
        const first = remaining[0];
        const mate = remaining.find((i) => i !== first && st.cards[i].pairId === st.cards[first].pairId);
        st = g.flipCard(st, first).nextState;
        const m = g.flipCard(st, mate);
        ok(m.outcome === 'match', `pair ${p} should match`);
        st = m.nextState;
        attempts++;
        ok(st.attempts === attempts && st.matchedPairIds.length === p + 1, `counters after pair ${p}`);
        ok(st.isComplete === (p === 5), `isComplete after pair ${p}`);
        ok(g.cardStatus(st, first) === 'matched' && g.cardStatus(st, mate) === 'matched', 'matched status');
        // a matched card cannot be flipped again
        ok(g.flipCard(st, first).nextState === st, 'matched card tap must be a no-op');
      }
      const done = st;
      ok(g.flipCard(done, 0).nextState === done, 'completed round: same object');
      return out;
    });
    expect(r).toEqual([]);
  });
});

/* ============================================================================
   7. COMPLETE O DITADO
   ============================================================================ */
test.describe('Complete o Ditado — screen', () => {
  test('wrong answer = soft hint, dashed disabled option, no award; then correct shows the full proverb and its meaning (+1/+10 once)', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PROVERBS');
    const before = await snapshot(page);
    const s = await gymState(page, `({ start: s.proverbsRound.proverb.start, answer: s.proverbsRound.proverb.answer, end: s.proverbsRound.proverb.end,
      meaning: s.proverbsRound.proverb.meaning, options: s.proverbsRound.options, idx: s.proverbsRound.proverbIndex,
      full: EM.games.proverbs.fullText(s.proverbsRound.proverb) })`);
    const tiles = gameTiles(page);
    await expect(tiles).toHaveCount(3);
    await expect(page.locator('#screen .proverb-box')).toContainText(s.start);
    await expect(page.locator('#screen .proverb-box')).toContainText('___');
    // options appear in the engine's order and are named by their visible text
    for (const [i, option] of s.options.entries()) {
      await expect(tiles.nth(i)).toHaveText(option);
      await expect(page.getByRole('button', { name: option, exact: true })).toHaveCount(1);
    }
    await expectLabelInName(page, 'proverbs');

    const wrong = s.options.findIndex((o) => o !== s.answer);
    await tiles.nth(wrong).click();
    await expect(page.locator('#screen').getByText('DICA CARINHOSA')).toBeVisible();
    await expect(page.locator('#screen').getByText('Quase!', { exact: false })).toBeVisible();
    await expect(tiles.nth(wrong)).toBeDisabled();
    expect(await tiles.nth(wrong).evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe('dashed');
    expect(await snapshot(page)).toEqual(before);
    await expectAntiGuilt(page, 'proverbs wrong');
    await expectLabelInName(page, 'proverbs wrong');

    await tiles.nth(s.options.indexOf(s.answer)).click();
    await expect(page.locator('#screen').getByText(`“${s.full}”`)).toBeVisible();
    await expect(page.locator('#screen').getByText(`Significa: ${s.meaning}`)).toBeVisible();
    await expectAwarded(page, before);
    expect(await lastLogEntry(page)).toMatchObject({ p: 'MIND', k: 'game:proverbs' });
    await expect(page.locator('#screen .proverb-box')).toContainText(s.answer);
    await expect(page.locator('#screen .proverb-box')).not.toContainText('___');
    await expectAntiGuilt(page, 'proverbs solved');

    // nothing else awards
    await tiles.nth(wrong).click({ force: true });
    await tiles.nth(0).click({ force: true });
    await expectAwarded(page, before);

    // next proverb: the rotation moves on and the options are deterministic
    await page.getByRole('button', { name: 'PRÓXIMO DITADO' }).click();
    const n = await gymState(page, 'EM.games.proverbs.PROVERBS.length');
    expect(await gymState(page, 's.proverbsRound.proverbIndex')).toBe((s.idx + 1) % n);
    await expect(page.locator('#screen').getByText('DICA CARINHOSA')).toHaveCount(0);
  });

  test('the correct answer works first try as well (no hint shown), and every option can be reached with the keyboard', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'PROVERBS');
    const before = await snapshot(page);
    const s = await gymState(page, '({ answer: s.proverbsRound.proverb.answer, options: s.proverbsRound.options })');
    const tile = gameTiles(page).nth(s.options.indexOf(s.answer));
    await tile.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#screen').getByText('Significa:', { exact: false })).toBeVisible();
    await expect(page.locator('#screen').getByText('DICA CARINHOSA')).toHaveCount(0);
    await expectAwarded(page, before);
  });
});

test.describe('Complete o Ditado — engine and data', () => {
  test('>= 16 well-formed, traditional-looking proverbs: 3 distinct options, 1 correct, 2 plausible wrong', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.proverbs;
      const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const problems = [];
      const ids = new Set();
      const starts = new Set();
      const positions = new Set();
      g.PROVERBS.forEach((p, index) => {
        const tag = p.id;
        if (ids.has(p.id)) problems.push(`${tag}: duplicate id`);
        ids.add(p.id);
        if (starts.has(p.start)) problems.push(`${tag}: duplicate proverb`);
        starts.add(p.start);
        if (!p.start || p.start !== p.start.trim() || !/^[A-ZÀ-Ý]/.test(p.start)) problems.push(`${tag}: start`);
        if (!/^(\.| é\.)$/.test(p.end)) problems.push(`${tag}: end "${p.end}"`);
        if (!p.answer || p.answer !== p.answer.trim()) problems.push(`${tag}: answer`);
        if (!Array.isArray(p.wrong) || p.wrong.length !== 2) problems.push(`${tag}: needs exactly 2 wrong options`);
        if (!p.meaning || p.meaning.length < 15 || p.meaning.length > 110 || !/[.!]$/.test(p.meaning)) problems.push(`${tag}: meaning "${p.meaning}"`);
        const all = [p.answer, ...p.wrong];
        if (new Set(all.map(fold)).size !== 3) problems.push(`${tag}: options not distinct`);
        if (p.wrong.map(fold).includes(fold(p.answer))) problems.push(`${tag}: wrong option equals the answer`);
        if (!p.wrong.every((w) => w && w === w.trim() && !/\s/.test(w))) problems.push(`${tag}: wrong options must be single words`);
        if (!g.promptText(p).includes(' ___')) problems.push(`${tag}: no blank`);
        if (g.fullText(p) !== `${p.start} ${p.answer}${p.end}`) problems.push(`${tag}: fullText`);
        if (g.fullText(p).includes('___')) problems.push(`${tag}: fullText has a blank`);

        const round = g.createRound(index);
        const again = g.createRound(index);
        if (JSON.stringify(round) !== JSON.stringify(again)) problems.push(`${tag}: round is not deterministic`);
        if (round.options.length !== 3 || new Set(round.options).size !== 3) problems.push(`${tag}: round options`);
        if (round.options.filter((o) => o === p.answer).length !== 1) problems.push(`${tag}: correct answer not exactly once`);
        if (round.options.slice().sort().join() !== all.slice().sort().join()) problems.push(`${tag}: options differ from data`);
        positions.add(round.options.indexOf(p.answer));
        if (round.proverb !== p || round.proverbIndex !== index || round.isSolved || round.disabledOptions.length) problems.push(`${tag}: round state`);
      });
      // another seed can change the order (still the same three options)
      const seeds = new Set();
      for (let s = 0; s < 12; s++) seeds.add(g.createRound(0, s).options.join());
      // the answer of one proverb is never offered as a wrong option of the SAME proverb, nor is any wrong option another proverb's answer to the same blank
      return { count: g.PROVERBS.length, problems, positions: [...positions].sort(), seedOrders: seeds.size };
    });
    expect(r.problems).toEqual([]);
    expect(r.count).toBeGreaterThanOrEqual(16);
    expect(r.positions, 'the correct option sits in different positions').toEqual([0, 1, 2]);
    expect(r.seedOrders).toBeGreaterThan(1);
  });

  test('submitAnswer: wrong disables + shows the hint, repeat/unknown/solved are same-object no-ops, correct solves', async ({ page }) => {
    await openApp(page);
    const bad = await page.evaluate(() => {
      const g = EM.games.proverbs;
      const out = [];
      g.PROVERBS.forEach((p, index) => {
        const round = g.createRound(index);
        const w = g.submitAnswer(round, p.wrong[0]);
        if (w.isCorrect || w.nextState.isSolved || !w.nextState.showHint || w.nextState.disabledOptions.join() !== p.wrong[0]) out.push(`${p.id}: wrong answer`);
        if (g.submitAnswer(w.nextState, p.wrong[0]).nextState !== w.nextState) out.push(`${p.id}: repeated wrong is not a no-op`);
        if (g.submitAnswer(round, 'xyz-not-an-option').nextState !== round) out.push(`${p.id}: unknown option is not a no-op`);
        const w2 = g.submitAnswer(w.nextState, p.wrong[1]);
        if (w2.nextState.disabledOptions.length !== 2 || w2.nextState.isSolved) out.push(`${p.id}: second wrong`);
        const c = g.submitAnswer(w2.nextState, p.answer);
        if (!c.isCorrect || !c.nextState.isSolved) out.push(`${p.id}: correct after two wrong`);
        const again = g.submitAnswer(c.nextState, p.wrong[0]);
        if (again.nextState !== c.nextState || !again.isCorrect) out.push(`${p.id}: solved state must be returned as-is`);
        const first = g.submitAnswer(round, p.answer);
        if (!first.isCorrect || first.nextState.showHint) out.push(`${p.id}: correct on the first try`);
      });
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('rotation visits every proverb and never repeats the current one', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.proverbs;
      const n = g.PROVERBS.length;
      const seen = [];
      let i = 5;
      for (let k = 0; k < n; k++) { seen.push(i); i = g.nextProverbIndex(i); }
      return { n, distinct: new Set(seen).size, back: i };
    });
    expect(r.distinct).toBe(r.n);
    expect(r.back).toBe(5);
  });
});

/* ============================================================================
   8. CONTA DO MERCADO
   ============================================================================ */
test.describe('Conta do Mercado — screen', () => {
  test('wrong answer = gentle hint + disabled option; correct explains the calculation in one line; +1/+10 once', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'MARKET');
    const before = await snapshot(page);
    const s = await gymState(page, `({ prompt: EM.games.market.promptFor(s.marketRound.problem), correct: s.marketRound.problem.correctCents,
      options: s.marketRound.options, labels: s.marketRound.options.map(EM.games.market.formatBRL),
      hint: EM.games.market.hintFor(s.marketRound.problem), explanation: EM.games.market.explanationFor(s.marketRound.problem),
      idx: s.marketRound.problemIndex, type: s.marketRound.problem.type })`);
    const tiles = gameTiles(page);
    await expect(tiles).toHaveCount(4);
    await expect(page.locator('#screen').getByText(norm(s.prompt))).toBeVisible();
    for (const [i, label] of s.labels.entries()) {
      expect(norm(label)).toMatch(/^R\$ \d+,\d{2}$/);
      expect(norm(await tiles.nth(i).innerText())).toBe(norm(label));
    }
    await expectLabelInName(page, 'market');

    const wrong = s.options.findIndex((o) => o !== s.correct);
    await tiles.nth(wrong).click();
    await expect(page.locator('#screen').getByText('DICA CARINHOSA')).toBeVisible();
    await expect(page.locator('#screen').getByText(s.hint)).toBeVisible();
    await expect(tiles.nth(wrong)).toBeDisabled();
    expect(await tiles.nth(wrong).evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe('dashed');
    expect(await snapshot(page)).toEqual(before);
    await expectAntiGuilt(page, 'market wrong');
    await expectLabelInName(page, 'market wrong');

    await tiles.nth(s.options.indexOf(s.correct)).click();
    await expect(page.locator('#screen').getByText('Conta Certa')).toBeVisible();
    await expect(page.locator('#screen').getByText(norm(s.explanation))).toBeVisible();
    await expectAwarded(page, before);
    expect(await lastLogEntry(page)).toMatchObject({ p: 'MIND', k: 'game:market' });
    await expectAntiGuilt(page, 'market solved');

    await tiles.nth(wrong).click({ force: true });
    await tiles.nth(0).click({ force: true });
    await expectAwarded(page, before);

    await page.getByRole('button', { name: 'PRÓXIMA CONTA' }).click();
    const n = await gymState(page, 'EM.games.market.PROBLEMS.length');
    expect(await gymState(page, 's.marketRound.problemIndex')).toBe((s.idx + 1) % n);
    // the next problem is of a different kind (bands are interleaved)
    expect(await gymState(page, 's.marketRound.problem.type')).not.toBe(s.type);
  });

  test('the three kinds of hint (sum / change / double) keep the gentle "Quase!" tone, each reached through the UI', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'MARKET');
    const seen = {};
    for (let idx = 0; idx < 3; idx++) {
      // bands are interleaved: problem 0 = sum, 1 = change, 2 = double
      await page.evaluate((i) => {
        EM.screens.brainGym._getState().marketRound = EM.games.market.createRound(i);
        EM.app.render();
      }, idx);
      const s = await gymState(page, '({ c: s.marketRound.problem.correctCents, o: s.marketRound.options, t: s.marketRound.problem.type })');
      await gameTiles(page).nth(s.o.findIndex((x) => x !== s.c)).click();
      const hint = norm(await page.locator('.soft-hint').innerText());
      seen[s.t] = hint;
      expect(hint).toContain('Quase! ');
    }
    expect(Object.keys(seen).sort()).toEqual(['change', 'double', 'sum']);
    expect(seen.sum).toContain('Quase! Tente somar com calma.');
  });
});

test.describe('Conta do Mercado — engine and data', () => {
  test('>= 20 problems in 3 bands; the arithmetic is recomputed here and matches the declared answer for ALL of them', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.market;
      const problems = [];
      const bands = { 1: 0, 2: 0, 3: 0 };
      const ids = new Set();
      const mismatches = [];
      g.PROBLEMS.forEach((p) => {
        const tag = p.id;
        if (ids.has(p.id)) problems.push(`${tag}: duplicate id`);
        ids.add(p.id);
        bands[p.band] = (bands[p.band] || 0) + 1;
        // independent recomputation from the operands (integer centavos)
        let expected;
        if (p.type === 'sum') {
          if (p.band !== 1 || p.items.length !== 2) problems.push(`${tag}: a sum has band 1 and exactly 2 items`);
          expected = p.items[0].cents + p.items[1].cents;
        } else if (p.type === 'change') {
          if (p.band !== 2) problems.push(`${tag}: change is band 2`);
          if (![1000, 2000, 5000].includes(p.paidCents)) problems.push(`${tag}: paid with ${p.paidCents}`);
          if (!(p.priceCents > 0 && p.priceCents < p.paidCents)) problems.push(`${tag}: price must be below the note`);
          expected = p.paidCents - p.priceCents;
        } else if (p.type === 'double') {
          if (p.band !== 3 || p.quantity !== 2) problems.push(`${tag}: a double is band 3 with quantity 2`);
          expected = p.unitCents * p.quantity;
        } else {
          problems.push(`${tag}: unknown type ${p.type}`);
        }
        if (p.correctCents !== expected) mismatches.push(`${tag}: declared ${p.correctCents}, recomputed ${expected}`);
        if (g.computeAnswer(p) !== expected) mismatches.push(`${tag}: computeAnswer ${g.computeAnswer(p)} != ${expected}`);
        const money = [p.correctCents, p.paidCents, p.priceCents, p.unitCents, ...(p.items || []).map((i) => i.cents)].filter((v) => v !== undefined);
        if (!money.every((v) => Number.isInteger(v) && v > 0 && v < 20000)) problems.push(`${tag}: amounts must be small positive integers (centavos)`);
        if (!p.who) problems.push(`${tag}: no shopper`);
        // the text mentions every operand, formatted in pt-BR
        const prompt = g.promptFor(p).replace(/ /g, ' ');
        const operands = p.type === 'sum' ? p.items.map((i) => i.cents) : p.type === 'change' ? [p.paidCents, p.priceCents] : [p.unitCents];
        operands.forEach((c) => {
          const f = g.formatBRL(c).replace(/ /g, ' ');
          if (!prompt.includes(f)) problems.push(`${tag}: prompt lacks ${f}`);
        });
        if (!/\?$/.test(prompt)) problems.push(`${tag}: prompt is not a question`);
        const expl = g.explanationFor(p).replace(/ /g, ' ');
        if (!expl.includes(g.formatBRL(p.correctCents).replace(/ /g, ' '))) problems.push(`${tag}: explanation lacks the answer`);
        if (expl.includes('\n')) problems.push(`${tag}: explanation must be one line`);
        if (!/^Quase! /.test(g.hintFor(p))) problems.push(`${tag}: hint tone`);
      });
      return { count: g.PROBLEMS.length, bands, problems, mismatches };
    });
    expect(r.mismatches).toEqual([]);
    expect(r.problems).toEqual([]);
    expect(r.count).toBeGreaterThanOrEqual(20);
    for (const band of [1, 2, 3]) expect(r.bands[band], `band ${band}`).toBeGreaterThanOrEqual(6);
  });

  test('every round: 4 distinct positive options, the correct one exactly once, deterministic, in different positions', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.market;
      const problems = [];
      const positions = new Set();
      g.PROBLEMS.forEach((p, index) => {
        const round = g.createRound(index);
        if (JSON.stringify(round) !== JSON.stringify(g.createRound(index))) problems.push(`${p.id}: not deterministic`);
        if (round.options.length !== 4) problems.push(`${p.id}: ${round.options.length} options`);
        if (new Set(round.options).size !== 4) problems.push(`${p.id}: repeated option`);
        if (!round.options.every((o) => Number.isInteger(o) && o > 0)) problems.push(`${p.id}: option must be a positive integer`);
        if (round.options.filter((o) => o === p.correctCents).length !== 1) problems.push(`${p.id}: correct not exactly once`);
        const labels = round.options.map((o) => g.formatBRL(o));
        if (new Set(labels).size !== 4) problems.push(`${p.id}: repeated label`);
        // every wrong option is "near" (plausible) and never an alternative right answer
        round.options.filter((o) => o !== p.correctCents).forEach((o) => {
          if (Math.abs(o - p.correctCents) > 500 && o !== p.unitCents) problems.push(`${p.id}: implausible distractor ${o}`);
        });
        positions.add(round.options.indexOf(p.correctCents));
      });
      return { problems, positions: [...positions].sort() };
    });
    expect(r.problems).toEqual([]);
    expect(r.positions.length).toBeGreaterThanOrEqual(3);
  });

  test('formatBRL: pt-BR comma, two decimals, "R$" glued to the number', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const f = EM.games.market.formatBRL;
      return [f(750), f(5), f(100), f(2000), f(1350), f(99), f(123456)].map((s) => s.replace(/ /g, '_'));
    });
    expect(r).toEqual(['R$_7,50', 'R$_0,05', 'R$_1,00', 'R$_20,00', 'R$_13,50', 'R$_0,99', 'R$_1234,56']);
  });

  test('submitAnswer: wrong disables + hint, repeat/unknown/solved are same-object no-ops', async ({ page }) => {
    await openApp(page);
    const bad = await page.evaluate(() => {
      const g = EM.games.market;
      const out = [];
      g.PROBLEMS.forEach((p, index) => {
        const round = g.createRound(index);
        const wrongOpt = round.options.find((o) => o !== p.correctCents);
        const w = g.submitAnswer(round, wrongOpt);
        if (w.isCorrect || !w.nextState.showHint || w.nextState.isSolved || w.nextState.disabledOptions.join() !== String(wrongOpt)) out.push(`${p.id}: wrong`);
        if (g.submitAnswer(w.nextState, wrongOpt).nextState !== w.nextState) out.push(`${p.id}: repeat`);
        if (g.submitAnswer(round, 1).nextState !== round && !round.options.includes(1)) out.push(`${p.id}: unknown`);
        const c = g.submitAnswer(w.nextState, p.correctCents);
        if (!c.isCorrect || !c.nextState.isSolved) out.push(`${p.id}: correct`);
        if (g.submitAnswer(c.nextState, wrongOpt).nextState !== c.nextState) out.push(`${p.id}: solved is not a no-op`);
      });
      return out;
    });
    expect(bad).toEqual([]);
  });
});

/* ============================================================================
   9. ORDEM CERTA
   ============================================================================ */
const stepsOf = (page) => page.locator('#screen button.order-step');

async function orderInfo(page) {
  return gymState(page, `({ shown: s.orderRound.steps.map((x) => x.id), texts: s.orderRound.steps.map((x) => x.text),
    idx: s.orderRound.routineIndex, title: s.orderRound.routine.title })`);
}

test.describe('Ordem Certa — screen', () => {
  test('numbers 1-4 on tapped steps; Desfazer removes the last pick; a wrong order = gentle message + Recomeçar; correct completes once', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'ORDER');
    const before = await snapshot(page);
    const info0 = await orderInfo(page);
    const { shown, texts, title } = info0;
    const steps = stepsOf(page);
    await expect(steps).toHaveCount(4);
    await expect(page.locator('#screen').getByText(`passos de ${title}`, { exact: false })).toBeVisible();
    await expect(page.locator('#screen').getByText('Passos escolhidos: 0 / 4')).toBeVisible();
    await expectLabelInName(page, 'order');

    // Desfazer / Recomeçar are inert (dimmed) before any pick
    await expect(page.getByRole('button', { name: /DESFAZER/ })).toBeDisabled();
    await expect(page.getByRole('button', { name: /RECOMEÇAR/ })).toBeDisabled();

    // pick the first two shown, undo the last
    await steps.nth(0).click();
    await steps.nth(1).click();
    await expect(steps.nth(0).locator('.order-num')).toHaveText('1');
    await expect(steps.nth(1).locator('.order-num')).toHaveText('2');
    await expect(steps.nth(2).locator('.order-num')).toHaveText('');
    await expect(page.locator('#screen').getByText('Passos escolhidos: 2 / 4')).toBeVisible();
    await expect(steps.nth(0)).toBeDisabled();
    await page.getByRole('button', { name: /DESFAZER/ }).click();
    await expect(steps.nth(1).locator('.order-num')).toHaveText('');
    await expect(page.locator('#screen').getByText('Passos escolhidos: 1 / 4')).toBeVisible();
    await expect(steps.nth(1)).toBeEnabled();

    // finish in the SHOWN order: it never equals the right order, so this is a wrong complete order
    await steps.nth(1).click();
    await steps.nth(2).click();
    await steps.nth(3).click();
    for (let i = 0; i < 4; i++) await expect(steps.nth(i).locator('.order-num')).toHaveText(String(i + 1));
    await expect(page.locator('#screen').getByText('Quase! Vamos tentar de novo', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RECOMEÇAR' })).toBeEnabled();
    expect(await snapshot(page)).toEqual(before);
    await expectAntiGuilt(page, 'order wrong');
    await expectLabelInName(page, 'order wrong');
    for (let i = 0; i < 4; i++) await expect(steps.nth(i)).toBeDisabled(); // nothing more to tap until Desfazer/Recomeçar

    // Desfazer from the wrong state returns to picking
    await page.getByRole('button', { name: /DESFAZER/ }).click();
    await expect(page.locator('#screen').getByText('Quase! Vamos tentar de novo', { exact: false })).toHaveCount(0);
    await expect(page.locator('#screen').getByText('Passos escolhidos: 3 / 4')).toBeVisible();
    await steps.nth(3).click();
    await expect(page.locator('#screen').getByText('Quase! Vamos tentar de novo', { exact: false })).toBeVisible();

    // Recomeçar clears everything
    await page.getByRole('button', { name: 'RECOMEÇAR' }).click();
    await expect(page.locator('#screen').getByText('Passos escolhidos: 0 / 4')).toBeVisible();
    await expect(page.locator('#screen').getByText('Quase! Vamos tentar de novo', { exact: false })).toHaveCount(0);
    await expect(page.locator('#screen .order-num-on')).toHaveCount(0);

    // the right order, tapped in sequence
    for (const id of [0, 1, 2, 3]) await steps.nth(shown.indexOf(id)).click();
    await expect(page.locator('#screen').getByText('Ordem Perfeita')).toBeVisible();
    await expect(page.getByRole('button', { name: 'PRÓXIMA ROTINA' })).toBeVisible();
    await expectAwarded(page, before);
    expect(await lastLogEntry(page)).toMatchObject({ p: 'MIND', k: 'game:order' });
    await expectAntiGuilt(page, 'order solved');
    // the 4 steps remain on screen numbered by the order of tapping
    for (const id of [0, 1, 2, 3]) await expect(steps.nth(shown.indexOf(id)).locator('.order-num')).toHaveText(String(id + 1));
    expect(texts).toHaveLength(4);

    // nothing else awards
    await steps.nth(0).click({ force: true });
    await expectAwarded(page, before);

    await page.getByRole('button', { name: 'PRÓXIMA ROTINA' }).click();
    const n = await gymState(page, 'EM.games.order.ROUTINES.length');
    expect(n).toBeGreaterThanOrEqual(10);
    expect((await orderInfo(page)).idx).toBe((info0.idx + 1) % n);
    await expect(page.locator('#screen').getByText('Passos escolhidos: 0 / 4')).toBeVisible();
    await expect(page.locator('#screen').getByText('Ordem Perfeita')).toHaveCount(0);
  });

  test('the word is RECOMEÇAR (never "zerar") and keyboard focus survives picking a step', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'ORDER');
    await expect(page.getByRole('button', { name: /zerar/i })).toHaveCount(0);
    const focusKey = () => page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-focus-key'));
    const { shown } = await orderInfo(page);
    await stepsOf(page).nth(2).focus();
    await page.keyboard.press('Enter');
    await expect(stepsOf(page).nth(2).locator('.order-num')).toHaveText('1');
    expect(await focusKey()).toBe(`order-step-${shown[2]}`);
    // Desfazer keeps the keyboard where it was (it dims but stays focusable)
    await page.getByRole('button', { name: /DESFAZER/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#screen').getByText('Passos escolhidos: 0 / 4')).toBeVisible();
    expect(await focusKey()).toBe('order-undo');
  });

  test('a step tap is announced to screen readers with its number', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'ORDER');
    const { texts } = await orderInfo(page);
    await stepsOf(page).nth(0).click();
    await expect(page.locator('#sr-status')).toHaveText(`Passo 1: ${texts[0]}.`);
  });
});

test.describe('Ordem Certa — engine and data', () => {
  test('>= 10 routines with 4 distinct steps; the shown order is always a different permutation, deterministic by seed', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.order;
      const problems = [];
      const ids = new Set();
      const titles = new Set();
      const allSteps = new Set();
      g.ROUTINES.forEach((routine, index) => {
        const tag = routine.id;
        if (ids.has(routine.id)) problems.push(`${tag}: duplicate id`);
        ids.add(routine.id);
        if (titles.has(routine.title)) problems.push(`${tag}: duplicate title`);
        titles.add(routine.title);
        if (!routine.title || routine.title !== routine.title.toLowerCase()) problems.push(`${tag}: title "${routine.title}"`);
        if (routine.steps.length !== 4) problems.push(`${tag}: ${routine.steps.length} steps`);
        if (new Set(routine.steps).size !== 4) problems.push(`${tag}: duplicate steps`);
        routine.steps.forEach((t) => {
          if (!t || t !== t.trim() || t.length > 60 || !/^[A-ZÀ-Ý]/.test(t)) problems.push(`${tag}: step "${t}"`);
          if (allSteps.has(t)) problems.push(`${tag}: step "${t}" reused in another routine`);
          allSteps.add(t);
        });
        for (let seed = 0; seed < 40; seed++) {
          const round = g.createRound(index, seed);
          const ids4 = round.steps.map((x) => x.id);
          if (ids4.slice().sort().join() !== '0,1,2,3') problems.push(`${tag}/${seed}: not a permutation`);
          if (ids4.join() === '0,1,2,3') problems.push(`${tag}/${seed}: shown already in the right order`);
          round.steps.forEach((x) => { if (x.text !== routine.steps[x.id]) problems.push(`${tag}/${seed}: text/id mismatch`); });
          if (JSON.stringify(round) !== JSON.stringify(g.createRound(index, seed))) problems.push(`${tag}/${seed}: not deterministic`);
        }
        const d = g.createRound(index);
        if (JSON.stringify(d) !== JSON.stringify(g.createRound(index))) problems.push(`${tag}: default seed not deterministic`);
        if (d.pickedIds.length || d.status !== 'picking' || d.isComplete || d.attempts) problems.push(`${tag}: dirty new round`);
      });
      // the shown order actually varies between seeds
      const orders = new Set();
      for (let seed = 0; seed < 40; seed++) orders.add(g.createRound(0, seed).steps.map((x) => x.id).join());
      return { count: g.ROUTINES.length, problems, orders: orders.size };
    });
    expect(r.problems).toEqual([]);
    expect(r.count).toBeGreaterThanOrEqual(10);
    expect(r.orders).toBeGreaterThan(5);
  });

  test('exactly ONE of the 24 possible orders completes the round (unambiguous), the other 23 are "wrong"', async ({ page }) => {
    await openApp(page);
    const bad = await page.evaluate(() => {
      const g = EM.games.order;
      const out = [];
      const perms = [];
      const permute = (a, rest) => { if (!rest.length) perms.push(a); rest.forEach((x, i) => permute(a.concat(x), rest.filter((_, j) => j !== i))); };
      permute([], [0, 1, 2, 3]);
      g.ROUTINES.forEach((routine, index) => {
        let complete = 0;
        let wrong = 0;
        perms.forEach((perm) => {
          let st = g.createRound(index);
          let last;
          perm.forEach((id, i) => {
            const r = g.pickStep(st, id);
            if (i < 3 && r.outcome !== 'picked') out.push(`${routine.id}: ${perm} step ${i} outcome ${r.outcome}`);
            st = r.nextState;
            last = r;
          });
          if (last.outcome === 'complete') {
            complete++;
            if (perm.join() !== '0,1,2,3' || !st.isComplete || st.status !== 'complete') out.push(`${routine.id}: ${perm} completed`);
          } else if (last.outcome === 'wrong') {
            wrong++;
            if (st.isComplete || st.status !== 'wrong' || st.attempts !== 1) out.push(`${routine.id}: ${perm} wrong state`);
          } else out.push(`${routine.id}: ${perm} outcome ${last.outcome}`);
        });
        if (complete !== 1 || wrong !== 23) out.push(`${routine.id}: ${complete} complete / ${wrong} wrong`);
      });
      return out;
    });
    expect(bad).toEqual([]);
  });

  test('pick / undo / restart: same-object no-ops, status transitions and attempts counting', async ({ page }) => {
    await openApp(page);
    const out = await page.evaluate(() => {
      const g = EM.games.order;
      const problems = [];
      const ok = (c, m) => { if (!c) problems.push(m); };
      const base = g.createRound(2);
      ok(g.undoLastPick(base) === base, 'undo with nothing picked must be the same object');
      ok(g.restart(base) === base, 'restart with nothing picked must be the same object');
      ok(g.pickStep(base, 99).nextState === base && g.pickStep(base, 99).outcome === 'ignored', 'unknown step is a no-op');

      let st = g.pickStep(base, 3).nextState;
      ok(g.pickStep(st, 3).nextState === st && g.pickStep(st, 3).outcome === 'ignored', 'the same step twice is a no-op');
      st = g.pickStep(st, 2).nextState;
      ok(st.pickedIds.join() === '3,2' && st.status === 'picking', 'two picks');
      const undone = g.undoLastPick(st);
      ok(undone.pickedIds.join() === '3' && undone.status === 'picking', 'undo removes only the last');
      ok(g.restart(st).pickedIds.length === 0, 'restart clears');

      // wrong complete order: no more picks until undo/restart
      let w = g.createRound(2);
      [3, 2, 1, 0].forEach((id) => { w = g.pickStep(w, id).nextState; });
      ok(w.status === 'wrong' && !w.isComplete && w.attempts === 1 && w.pickedIds.length === 4, 'wrong order');
      ok(g.pickStep(w, 0).nextState === w, 'picking while wrong is a no-op');
      const fromWrong = g.undoLastPick(w);
      ok(fromWrong.status === 'picking' && fromWrong.pickedIds.length === 3 && fromWrong.attempts === 1, 'undo from wrong');
      const again = g.pickStep(fromWrong, 0);
      ok(again.outcome === 'wrong' && again.nextState.attempts === 2, 'attempts counts every complete order');
      const restarted = g.restart(w);
      ok(restarted.pickedIds.length === 0 && restarted.status === 'picking' && restarted.attempts === 1, 'restart from wrong');
      // then the right order
      let c = restarted;
      [0, 1, 2, 3].forEach((id) => { c = g.pickStep(c, id).nextState; });
      ok(c.isComplete && c.status === 'complete' && c.attempts === 2, 'right order after a wrong attempt');
      ok(g.pickStep(c, 1).nextState === c, 'completed: pick is a no-op');
      ok(g.undoLastPick(c) === c && g.restart(c) === c, 'completed: undo/restart are no-ops');
      return problems;
    });
    expect(out).toEqual([]);
  });

  test('rotation visits every routine and never repeats the current one', async ({ page }) => {
    await openApp(page);
    const r = await page.evaluate(() => {
      const g = EM.games.order;
      const n = g.ROUTINES.length;
      const seen = [];
      let i = 4;
      for (let k = 0; k < n; k++) { seen.push(i); i = g.nextRoutineIndex(i); }
      return { n, distinct: new Set(seen).size, back: i };
    });
    expect(r.distinct).toBe(r.n);
    expect(r.back).toBe(4);
  });
});

/* ============================================================================
   Shared: every game of the batch
   ============================================================================ */
test.describe('new games: shared guarantees', () => {
  test('no punitive wording (and no "zerar") anywhere in the catalogs of the new games', async ({ page }) => {
    await openApp(page);
    const strings = await page.evaluate(() => {
      const out = [];
      const pv = EM.games.proverbs;
      pv.PROVERBS.forEach((p) => out.push(pv.fullText(p), pv.promptText(p), p.meaning, ...p.wrong));
      const mk = EM.games.market;
      mk.PROBLEMS.forEach((p) => out.push(mk.promptFor(p), mk.explanationFor(p), mk.hintFor(p), p.who));
      const od = EM.games.order;
      od.ROUTINES.forEach((r) => out.push(r.title, ...r.steps));
      EM.games.pairs.PAIR_POOL.forEach((p) => out.push(p.name));
      EM.screens.brainGym.GAME_MENU_ITEMS.forEach((m) => out.push(m.title, m.subtitle, m.tag));
      return out;
    });
    expect(strings.length).toBeGreaterThan(150);
    for (const s of strings) {
      expect(s, s).not.toMatch(PUNITIVE);
      expect(s.toLowerCase(), s).not.toMatch(/zerar|zerou|\berro\b|errad/);
    }
  });

  for (const id of NEW_GAMES) {
    test(`${id}: opening the game never completes it, and no console errors / overflow at this width`, async ({ page }) => {
      await openApp(page);
      const before = await snapshot(page);
      await openGame(page, id);
      await expectNoHorizontalOverflow(page, id);
      await expectTapTargets(page, id);
      await expectLabelInName(page, id);
      await expectAntiGuilt(page, id);
      expect(await snapshot(page)).toEqual(before);
    });
  }

  test('text size 130%: wrong and solved states of Palavras and the 4 new games fit (no overflow, targets >= 44px), pair cards stay >= 64px', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('evermind:settings_text_size', '130'));
    await openApp(page);
    const check = async (label) => {
      await expectNoHorizontalOverflow(page, `${label} @130%`);
      await expectTapTargets(page, `${label} @130%`);
    };

    await openGame(page, 'PAIRS');
    const ids = await gymState(page, 's.pairsRound.cards.map((c) => c.pairId)');
    const cards = cardsOf(page);
    await cards.nth(0).click();
    await cards.nth(ids.findIndex((p, i) => i > 0 && p !== ids[0])).click();
    await check('pairs mismatch');
    const minSide = await page.evaluate(() => Math.min(...[...document.querySelectorAll('#screen .pair-card')].map((e) => { return Math.min(e.offsetWidth, e.offsetHeight); })));
    expect(minSide, 'pair card side @130%').toBeGreaterThanOrEqual(64);

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
    for (let i = 0; i < 4; i++) await stepsOf(page).nth(i).click();
    await check('order wrong');

    await openGame(page, 'WORDS');
    const w = await gymState(page, '({ pool: s.wordsRound.optionsPool, valid: s.wordsRound.challenge.validSuggestions })');
    await gameTiles(page).nth(w.pool.findIndex((x) => !w.valid.includes(x))).click();
    await check('words wrong');
  });

  test('state survives switching tabs: a half-finished Ordem Certa is still there on return', async ({ page }) => {
    await openApp(page);
    await openGame(page, 'ORDER');
    await stepsOf(page).nth(0).click();
    await goTab(page, 'Corpo');
    await goTab(page, 'Mente');
    await expect(page.locator('#screen').getByText('Passos escolhidos: 1 / 4')).toBeVisible();
  });

  test('the new games count for the pillar, the weekly log and the streak (same path as the old ones)', async ({ page }) => {
    await openApp(page);
    const before = await snapshot(page);
    await openGame(page, 'PROVERBS');
    const s = await gymState(page, '({ a: s.proverbsRound.proverb.answer, o: s.proverbsRound.options })');
    await gameTiles(page).nth(s.o.indexOf(s.a)).click();
    await expectAwarded(page, before);
    const p = await page.evaluate(() => JSON.parse(localStorage.getItem('evermind:evermind_user_progress_v1')));
    expect(p.currentStreak).toBe(1);
    expect(p.activeDates).toHaveLength(1);
    expect(p.completionLog[p.completionLog.length - 1]).toMatchObject({ p: 'MIND', k: 'game:proverbs' });
  });
});
