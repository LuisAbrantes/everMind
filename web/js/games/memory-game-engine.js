/* ============================================================================
   everMind Web — js/games/memory-game-engine.js
   Portagem literal de `src/modules/brain/MemoryGameEngine.ts`.

   Jogo 1 — Memória Visual: memorizar 5 figuras, depois reencontrá-las
   entre 8 (5 verdadeiras + 3 distratoras).
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /* Pool temático — 10 itens. */
  var MEMORY_THEMATIC_POOL = [
    { id: 'apple', name: 'Maçã', emoji: '🍎' },
    { id: 'guitar', name: 'Violão', emoji: '🎸' },
    { id: 'flower', name: 'Flor', emoji: '🌸' },
    { id: 'sun', name: 'Sol', emoji: '☀️' },
    { id: 'book', name: 'Livro', emoji: '📖' },
    { id: 'bird', name: 'Pássaro', emoji: '🐦' },
    { id: 'cup', name: 'Xícara', emoji: '☕' },
    { id: 'clock', name: 'Relógio', emoji: '⏰' },
    { id: 'house', name: 'Casa', emoji: '🏡' },
    { id: 'tree', name: 'Árvore', emoji: '🌳' },
  ];

  var TARGET_COUNT = 5;
  var DISTRACTOR_COUNT = 3;

  /**
   * Cria uma rodada.
   *
   * ⚠️ Pseudo-shuffle determinístico — comportamento do original PRESERVADO:
   *   o score usa apenas o PRIMEIRO CARACTERE do id
   *   (`id.charCodeAt(0) * seed) % 17`) e o Array#sort do V8 é ESTÁVEL.
   *
   *   ⚠️ Consequência: pares com o mesmo primeiro caractere NUNCA trocam de
   *   posição — `book` sempre precede `bird`, `cup` sempre precede `clock`.
   *   Se você trocar isso por um Fisher–Yates, os alvos mudam a cada rodada e o
   *   jogo fica imprevisível. Mantivemos o algoritmo original.
   *
   * @param {number} [seed]  o app passa `Date.now()`; o hook inicial passa 1
   */
  function createRound(seed) {
    var roundSeed = seed === undefined ? Date.now() : seed;

    var shuffledPool = MEMORY_THEMATIC_POOL.slice().sort(function (a, b) {
      var hashA = (a.id.charCodeAt(0) * roundSeed) % 17;
      var hashB = (b.id.charCodeAt(0) * roundSeed) % 17;
      return hashA - hashB;
    });

    var targetItems = shuffledPool.slice(0, TARGET_COUNT);
    var distractors = shuffledPool.slice(TARGET_COUNT, TARGET_COUNT + DISTRACTOR_COUNT);

    // Ordena por nome usando collation ICU (localeCompare), NÃO por code unit.
    // Isso importa com acentos: "Árvore" vem DEPOIS de "Xícara".
    var displayGrid = targetItems.concat(distractors).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    return {
      targetItems: targetItems,
      displayGrid: displayGrid,
      selectedItemIds: [],
      isMemorizationPhase: true,
      isRoundComplete: false,
      correctCount: 0,
    };
  }

  /** Entra na fase de escolha, limpando qualquer seleção anterior. */
  function startSelectionPhase(state) {
    return Object.assign({}, state, {
      isMemorizationPhase: false,
      selectedItemIds: [],
    });
  }

  /**
   * Alterna a seleção de um item.
   * @returns {{nextState:object, isCorrectPick:boolean, isAlreadySelected:boolean}}
   *
   * Nota de fidelidade: nos caminhos de "no-op" devolvemos o MESMO objeto
   * `state`. O app original depende dessa identidade para detectar
   * "acabou de resolver" via `nextState.isRoundComplete && !prev.isRoundComplete`.
   */
  function toggleItemSelection(state, itemId) {
    if (state.isMemorizationPhase || state.isRoundComplete) {
      return { nextState: state, isCorrectPick: false, isAlreadySelected: false };
    }

    var isAlreadySelected = state.selectedItemIds.indexOf(itemId) >= 0;

    function countCorrect(ids) {
      return ids.filter(function (id) {
        return state.targetItems.some(function (target) {
          return target.id === id;
        });
      }).length;
    }

    // ── Desmarcar ─────────────────────────────────────────────────────────
    if (isAlreadySelected) {
      var nextSelected = state.selectedItemIds.filter(function (id) {
        return id !== itemId;
      });
      var correctAfterDeselect = countCorrect(nextSelected);

      return {
        nextState: Object.assign({}, state, {
          selectedItemIds: nextSelected,
          correctCount: correctAfterDeselect,
          isRoundComplete: false,
        }),
        isCorrectPick: false,
        isAlreadySelected: true,
      };
    }

    // ── Marcar ────────────────────────────────────────────────────────────
    // Distratoras também entram em selectedItemIds: não existe penalidade,
    // apenas feedback visual. A rodada fecha quando as 5 verdadeiras estão
    // todas selecionadas.
    var isTarget = state.targetItems.some(function (item) {
      return item.id === itemId;
    });

    var ids = state.selectedItemIds.concat([itemId]);
    var correctCount = countCorrect(ids);

    return {
      nextState: Object.assign({}, state, {
        selectedItemIds: ids,
        correctCount: correctCount,
        isRoundComplete: correctCount === state.targetItems.length,
      }),
      isCorrectPick: isTarget,
      isAlreadySelected: false,
    };
  }

  EM.games = EM.games || {};
  EM.games.memory = {
    MEMORY_THEMATIC_POOL: MEMORY_THEMATIC_POOL,
    createRound: createRound,
    startSelectionPhase: startSelectionPhase,
    toggleItemSelection: toggleItemSelection,
  };
})(window);
