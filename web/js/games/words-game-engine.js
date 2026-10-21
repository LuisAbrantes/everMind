/* ============================================================================
   everMind Web — js/games/words-game-engine.js
   Portagem literal de `src/modules/brain/WordsGameEngine.ts`.

   Jogo 3 — Formação de Palavras: uma letra sorteada + um campo temático.
   O usuário encontra `targetCount` palavras (3) entre as sugestões.

   Não existe resposta errada: TODAS as sugestões são válidas. O jogo é
   totalmente livre de pressão.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  var PRESET_WORD_CHALLENGES = [
    {
      id: 'words_letter_m',
      letter: 'M',
      theme: 'Frutas e Alimentos Gostosos',
      themeDescription: 'Pense em frutas, verduras ou comidas deliciosas iniciadas com M',
      targetCount: 3,
      validSuggestions: [
        'Maçã', 'Melancia', 'Mamão', 'Morango',
        'Manga', 'Maracujá', 'Milho', 'Manteiga',
      ],
    },
    {
      id: 'words_letter_c',
      letter: 'C',
      theme: 'Objetos e Coisas de Casa',
      themeDescription: 'Objetos que você encontra na sua casa ou no quarto iniciados com C',
      targetCount: 3,
      validSuggestions: [
        'Cadeira', 'Cama', 'Copo', 'Colher',
        'Chave', 'Cortina', 'Caneca', 'Caderno',
      ],
    },
    {
      id: 'words_letter_s',
      letter: 'S',
      theme: 'Natureza e Sentimentos',
      themeDescription: 'Coisas belas da natureza ou sentimentos com a letra S',
      targetCount: 3,
      validSuggestions: [
        'Sol', 'Saudade', 'Sorriso', 'Semente',
        'Sombra', 'Serenidade', 'Sabiá', 'Silêncio',
      ],
    },
  ];

  function createRound(challengeIndex) {
    var safeIndex = Math.abs(challengeIndex || 0) % PRESET_WORD_CHALLENGES.length;
    var challenge = PRESET_WORD_CHALLENGES[safeIndex];

    return {
      challenge: challenge,
      foundWords: [],
      // ⚠️ Embaralhamento com o comparador clássico `() => 0.5 - Math.random()`.
      //    NÃO é um Fisher–Yates uniforme. É o que o app original usa e é o que
      //    dá a "sensação de sorteio" a cada rodada. Mantido à risca.
      optionsPool: challenge.validSuggestions.slice().sort(function () {
        return 0.5 - Math.random();
      }),
      isComplete: false,
    };
  }

  /**
   * Aceita uma palavra se ela constar na lista de sugestões do desafio.
   * @returns {{nextState:object, isAccepted:boolean}}
   *
   * Observações de fidelidade:
   *   • a palavra é guardada sem espaços nas pontas (maiúsculas e acentos
   *     originais ficam preservados);
   *   • a comparação é case-insensitive após `trim()`;
   *   • NÃO há insensibilidade a acentos: "maca" ≠ "Maçã" (como no original);
   *   • `optionsPool` nunca é mutado — quem remove a palavra já escolhida da
   *     lista é a camada de UI.
   */
  function selectWord(state, word) {
    if (state.isComplete) {
      return { nextState: state, isAccepted: true };
    }

    var normalizedWord = String(word).trim().toLowerCase();

    var isAlreadyFound = state.foundWords.some(function (found) {
      return found.toLowerCase() === normalizedWord;
    });
    if (isAlreadyFound) {
      return { nextState: state, isAccepted: false };
    }

    var isValid = state.challenge.validSuggestions.some(function (valid) {
      return valid.toLowerCase() === normalizedWord;
    });
    if (!isValid) {
      return { nextState: state, isAccepted: false };
    }

    var nextFound = state.foundWords.concat([String(word).trim()]);
    var isComplete = nextFound.length >= state.challenge.targetCount;

    return {
      nextState: Object.assign({}, state, { foundWords: nextFound, isComplete: isComplete }),
      isAccepted: true,
    };
  }

  EM.games = EM.games || {};
  EM.games.words = {
    PRESET_WORD_CHALLENGES: PRESET_WORD_CHALLENGES,
    createRound: createRound,
    selectWord: selectWord,
  };
})(window);
