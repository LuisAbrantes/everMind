/* ============================================================================
   everMind Web — js/games/pairs-game-engine.js
   Jogo 6 — Pares (jogo da memória): 12 cartas = 6 pares de figuras, em grade
   de 3 colunas x 4 linhas. O usuário vira duas cartas por vez; os pares
   encontrados ficam abertos; se as duas não combinam, elas viram de volta.

   Sem cronômetro: o usuário joga no tempo que quiser. O único "tempo" é a
   pausa calma (MISMATCH_DELAY_MS) antes de duas cartas diferentes virarem de
   volta — ela só existe para dar tempo de ver as figuras, e tocar em outra
   carta durante a pausa não bloqueia nada (as duas viram e a nova abre).

   Motor puro e determinístico: `createRound(seed)` com a mesma semente sempre
   gera as mesmas cartas na mesma ordem. Nos caminhos de "no-op" devolve o
   MESMO objeto de estado (README §4.6).
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var util = EM.games.util;

  /* Figuras bem distintas entre si (nada parecido com outra do conjunto) e claras
   sobre o fundo escuro (nada de figuras azul-marinho ou pretas). */
  var PAIR_POOL = [
    { id: 'apple', emoji: '🍎', name: 'Maçã' },
    { id: 'flower', emoji: '🌸', name: 'Flor' },
    { id: 'sun', emoji: '☀️', name: 'Sol' },
    { id: 'book', emoji: '📖', name: 'Livro' },
    { id: 'bird', emoji: '🐦', name: 'Pássaro' },
    { id: 'cup', emoji: '☕', name: 'Xícara' },
    { id: 'clock', emoji: '⏰', name: 'Relógio' },
    { id: 'house', emoji: '🏡', name: 'Casa' },
    { id: 'tree', emoji: '🌳', name: 'Árvore' },
    { id: 'guitar', emoji: '🎸', name: 'Violão' },
    { id: 'banana', emoji: '🍌', name: 'Banana' },
    { id: 'cake', emoji: '🎂', name: 'Bolo' },
    { id: 'fish', emoji: '🐟', name: 'Peixe' },
    { id: 'balloon', emoji: '🎈', name: 'Balão' },
  ];

  var PAIR_COUNT = 6;
  /** Pausa calma antes de duas cartas diferentes virarem de volta. */
  var MISMATCH_DELAY_MS = 1200;

  /**
   * @param {number} [seed]  o app passa `Date.now()`; os testes passam um número fixo
   */
  function createRound(seed) {
    var roundSeed = seed === undefined ? 1 : seed;

    var chosen = util.seededShuffle(PAIR_POOL, roundSeed).slice(0, PAIR_COUNT);
    var deck = [];
    chosen.forEach(function (pair) {
      deck.push({ pairId: pair.id, emoji: pair.emoji, name: pair.name });
      deck.push({ pairId: pair.id, emoji: pair.emoji, name: pair.name });
    });

    // `id` = posição na grade (0..11): a carta N da tela é `id + 1`.
    var cards = util.seededShuffle(deck, Number(roundSeed) + 7919).map(function (card, index) {
      return { id: index, pairId: card.pairId, emoji: card.emoji, name: card.name };
    });

    return {
      seed: roundSeed,
      cards: cards,
      flippedIds: [], // cartas viradas ainda sem par (0, 1 ou 2)
      matchedPairIds: [],
      attempts: 0, // cada par de cartas virado conta 1 tentativa (só um número neutro)
      pendingMismatch: false, // 2 cartas diferentes abertas, esperando virar de volta
      lastFlippedId: null,
      isComplete: false,
    };
  }

  /** 'hidden' | 'up' | 'matched' */
  function cardStatus(state, cardId) {
    var card = state.cards[cardId];
    if (!card) return 'hidden';
    if (state.matchedPairIds.indexOf(card.pairId) >= 0) return 'matched';
    if (state.flippedIds.indexOf(cardId) >= 0) return 'up';
    return 'hidden';
  }

  /** Vira de volta as duas cartas diferentes. No-op (mesmo objeto) se não há par pendente. */
  function resolveMismatch(state) {
    if (!state.pendingMismatch) return state;
    return Object.assign({}, state, { flippedIds: [], pendingMismatch: false });
  }

  /**
   * Vira uma carta.
   * @returns {{nextState:object, outcome:'ignored'|'first'|'match'|'mismatch'}}
   *   'ignored'  → rodada concluída, carta inexistente, já aberta ou já com par
   *                (MESMO objeto);
   *   'first'    → primeira carta da tentativa;
   *   'match'    → a segunda combina: o par fica aberto;
   *   'mismatch' → a segunda não combina: as duas ficam à vista até
   *                `resolveMismatch` (a UI chama após MISMATCH_DELAY_MS).
   */
  function flipCard(state, cardId) {
    if (state.isComplete || !state.cards[cardId]) {
      return { nextState: state, outcome: 'ignored' };
    }
    var status = cardStatus(state, cardId);
    if (status !== 'hidden') {
      return { nextState: state, outcome: 'ignored' };
    }

    // Tocar noutra carta durante a pausa: as duas diferentes viram e a nova abre.
    var base = state.pendingMismatch ? resolveMismatch(state) : state;
    var card = state.cards[cardId];

    if (base.flippedIds.length === 0) {
      return {
        nextState: Object.assign({}, base, { flippedIds: [cardId], lastFlippedId: cardId }),
        outcome: 'first',
      };
    }

    var first = base.cards[base.flippedIds[0]];
    var attempts = base.attempts + 1;

    if (first.pairId === card.pairId) {
      var matched = base.matchedPairIds.concat([card.pairId]);
      return {
        nextState: Object.assign({}, base, {
          flippedIds: [],
          matchedPairIds: matched,
          attempts: attempts,
          lastFlippedId: cardId,
          isComplete: matched.length === PAIR_COUNT,
        }),
        outcome: 'match',
      };
    }

    return {
      nextState: Object.assign({}, base, {
        flippedIds: base.flippedIds.concat([cardId]),
        attempts: attempts,
        pendingMismatch: true,
        lastFlippedId: cardId,
      }),
      outcome: 'mismatch',
    };
  }

  EM.games = EM.games || {};
  EM.games.pairs = {
    PAIR_POOL: PAIR_POOL,
    PAIR_COUNT: PAIR_COUNT,
    MISMATCH_DELAY_MS: MISMATCH_DELAY_MS,
    createRound: createRound,
    flipCard: flipCard,
    resolveMismatch: resolveMismatch,
    cardStatus: cardStatus,
  };
})(window);
