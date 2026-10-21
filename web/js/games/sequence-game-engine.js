/* ============================================================================
   everMind Web — js/games/sequence-game-engine.js
   Portagem literal de `src/modules/brain/SequenceGameEngine.ts`.

   Jogo 2 — Sequência Lógica: 2 → 4 → 6 → [?]
   Sem cronômetro regressivo, sem penalidade. Errou? A opção é desativada
   suavemente e uma DICA CARINHOSA aparece.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  var PRESET_SEQUENCES = [
    {
      id: 'seq_even_2',
      sequence: [2, 4, 6, '?'],
      correctAnswer: 8,
      options: [7, 8, 9, 10],
      ruleDescription: 'Adicionando 2 a cada passo',
      hint: 'Observe que os números aumentam de 2 em 2: 2 + 2 = 4, 4 + 2 = 6...',
    },
    {
      id: 'seq_five_5',
      sequence: [5, 10, 15, '?'],
      correctAnswer: 20,
      options: [18, 19, 20, 25],
      ruleDescription: 'Contando de 5 em 5',
      hint: 'Pense nos ponteiros do relógio ou na tabuada do 5: 5, 10, 15...',
    },
    {
      id: 'seq_three_3',
      sequence: [3, 6, 9, '?'],
      correctAnswer: 12,
      options: [10, 11, 12, 15],
      ruleDescription: 'Adicionando 3 a cada número',
      hint: 'Cada número é 3 unidades maior que o anterior: 9 + 3 = ?',
    },
    {
      id: 'seq_double_2',
      sequence: [1, 2, 4, '?'],
      correctAnswer: 8,
      options: [6, 7, 8, 10],
      ruleDescription: 'Dobrando o valor anterior',
      hint: 'Cada número é o dobro do anterior: 1 x 2 = 2, 2 x 2 = 4, 4 x 2 = ?',
    },
    {
      id: 'seq_ten_10',
      sequence: [10, 20, 30, '?'],
      correctAnswer: 40,
      options: [35, 40, 45, 50],
      ruleDescription: 'Aumentando de 10 em 10',
      hint: 'Contando as dezenas: dez, vinte, trinta...',
    },
  ];

  function createRound(puzzleIndex) {
    var safeIndex = Math.abs(puzzleIndex || 0) % PRESET_SEQUENCES.length;
    return {
      puzzle: PRESET_SEQUENCES[safeIndex],
      selectedAnswer: null,
      isSolved: false,
      disabledOptions: [],
      showHint: false,
    };
  }

  /**
   * @returns {{nextState:object, isCorrect:boolean}}
   * Errou: desativa a opção e REVELA a dica (gentle fallback).
   */
  function submitAnswer(state, answer) {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }

    if (answer === state.puzzle.correctAnswer) {
      // ⚠️ `showHint` NÃO é resetado aqui — se o usuário errou antes e depois
      // acertou, a dica continua visível. Comportamento do original.
      return {
        nextState: Object.assign({}, state, { selectedAnswer: answer, isSolved: true }),
        isCorrect: true,
      };
    }

    var nextDisabled = Array.from(new Set(state.disabledOptions.concat([answer])));

    return {
      nextState: Object.assign({}, state, {
        selectedAnswer: answer,
        disabledOptions: nextDisabled,
        showHint: true,
      }),
      isCorrect: false,
    };
  }

  EM.games = EM.games || {};
  EM.games.sequence = {
    PRESET_SEQUENCES: PRESET_SEQUENCES,
    createRound: createRound,
    submitAnswer: submitAnswer,
  };
})(window);
