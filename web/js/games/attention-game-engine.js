/* ============================================================================
   everMind Web — js/games/attention-game-engine.js
   Portagem literal de `src/modules/brain/AttentionGameEngine.ts`.

   Jogo 4 — Atenção & Diferenças: um único toque no item divergente
   resolve a rodada. Errou? O item é desativado suavemente, sem penalidade.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  var PRESET_ATTENTION_PUZZLES = [
    {
      id: 'att_clock_diff',
      instruction: 'Toque no relógio que está marcando uma hora diferente dos outros:',
      explanation:
        'Excelente observação! Três relógios marcavam 3 horas e apenas um marcava 6 horas.',
      items: [
        { id: 'c1', emoji: '🕒', label: 'Relógio 3 horas', isDivergent: false },
        { id: 'c2', emoji: '🕒', label: 'Relógio 3 horas', isDivergent: false },
        { id: 'c3', emoji: '🕕', label: 'Relógio 6 horas', isDivergent: true },
        { id: 'c4', emoji: '🕒', label: 'Relógio 3 horas', isDivergent: false },
      ],
    },
    {
      id: 'att_nature_sun',
      instruction: 'Encontre o elemento que não é um girassol no jardim:',
      explanation: 'Muito bem! A flor de lótus estava escondida entre os girassóis.',
      items: [
        { id: 'f1', emoji: '🌻', label: 'Girassol', isDivergent: false },
        { id: 'f2', emoji: '🌻', label: 'Girassol', isDivergent: false },
        { id: 'f3', emoji: '🌻', label: 'Girassol', isDivergent: false },
        { id: 'f4', emoji: '🪷', label: 'Flor de Lótus', isDivergent: true },
      ],
    },
    {
      id: 'att_fruits_lemon',
      instruction: 'Qual fruta é diferente nesta colheita de maçãs?',
      explanation: 'Perfeito! O limãozinho cítrico estava no meio das maçãs vermelhas.',
      items: [
        { id: 'fr1', emoji: '🍎', label: 'Maçã Vermelha', isDivergent: false },
        { id: 'fr2', emoji: '🍋', label: 'Limão Amarelo', isDivergent: true },
        { id: 'fr3', emoji: '🍎', label: 'Maçã Vermelha', isDivergent: false },
        { id: 'fr4', emoji: '🍎', label: 'Maçã Vermelha', isDivergent: false },
      ],
    },
  ];

  function createRound(puzzleIndex) {
    var safeIndex = Math.abs(puzzleIndex || 0) % PRESET_ATTENTION_PUZZLES.length;
    return {
      puzzle: PRESET_ATTENTION_PUZZLES[safeIndex],
      selectedItemId: null,
      isSolved: false,
      disabledItemIds: [],
    };
  }

  /**
   * @returns {{nextState:object, isCorrect:boolean}}
   */
  function selectItem(state, itemId) {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }

    var item = state.puzzle.items.find(function (candidate) {
      return candidate.id === itemId;
    });
    if (!item) {
      return { nextState: state, isCorrect: false };
    }

    if (item.isDivergent) {
      // Acerto: `disabledItemIds` é carregado intacto, como no original.
      return {
        nextState: Object.assign({}, state, { selectedItemId: itemId, isSolved: true }),
        isCorrect: true,
      };
    }

    // Erro: desativa suavemente e mantém a rodada viva. Sem som de erro,
    // sem cor vermelha, sem contagem regressiva.
    var nextDisabled = Array.from(new Set(state.disabledItemIds.concat([itemId])));

    return {
      nextState: Object.assign({}, state, {
        selectedItemId: itemId,
        disabledItemIds: nextDisabled,
      }),
      isCorrect: false,
    };
  }

  EM.games = EM.games || {};
  EM.games.attention = {
    PRESET_ATTENTION_PUZZLES: PRESET_ATTENTION_PUZZLES,
    createRound: createRound,
    selectItem: selectItem,
  };
})(window);
