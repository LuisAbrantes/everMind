/* ============================================================================
   everMind Web — js/games/proverbs-game-engine.js
   Jogo 7 — Complete o Ditado: um ditado popular brasileiro com uma palavra
   faltando (___). O usuário escolhe, entre 3 opções, a palavra que o completa.

   Cultura geral e linguagem, sem pressão: errou? A opção fica desativada, uma
   dica carinhosa aparece e ele tenta outra. Acertou? O ditado inteiro aparece
   com o significado em uma frase amiga.

   Curadoria: só ditados genuinamente tradicionais (domínio público), nada
   inventado. As 2 opções erradas SOAM bem, mas não completam o ditado — e
   nenhuma delas é sinônimo da certa (ver testes de integridade).
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var util = EM.games.util;

  /* `start` + ' ' + `answer` + `end` = o ditado inteiro. */
  var PROVERBS = [
    { id: 'agua_mole', start: 'Água mole em pedra dura, tanto bate até que', answer: 'fura', end: '.',
      wrong: ['molha', 'esfria'],
      meaning: 'Com paciência e insistência, até o que é difícil se consegue.' },
    { id: 'devagar', start: 'Devagar se vai ao', answer: 'longe', end: '.',
      wrong: ['campo', 'mercado'],
      meaning: 'Quem vai com calma e sem parar chega mais longe do que quem corre.' },
    { id: 'grao', start: 'De grão em grão a galinha enche o', answer: 'papo', end: '.',
      wrong: ['ninho', 'balaio'],
      meaning: 'Pouco a pouco, com constância, se junta muita coisa.' },
    { id: 'cao_ladra', start: 'Cão que ladra não', answer: 'morde', end: '.',
      wrong: ['foge', 'volta'],
      meaning: 'Quem faz muito barulho ou ameaça costuma fazer pouco de verdade.' },
    { id: 'passaro', start: 'Mais vale um pássaro na mão do que dois', answer: 'voando', end: '.',
      wrong: ['cantando', 'dormindo'],
      meaning: 'É melhor guardar o que já se tem do que apostar em algo incerto.' },
    { id: 'uniao', start: 'A união faz a', answer: 'força', end: '.',
      wrong: ['festa', 'fama'],
      meaning: 'Quando as pessoas se juntam, conseguem muito mais.' },
    { id: 'roma', start: 'Quem tem boca vai a', answer: 'Roma', end: '.',
      wrong: ['Paris', 'Madri'],
      meaning: 'Quem sabe perguntar consegue chegar a qualquer lugar.' },
    { id: 'macaco', start: 'Cada macaco no seu', answer: 'galho', end: '.',
      wrong: ['mato', 'cipó'],
      meaning: 'Cada um deve cuidar do que é seu e ficar no seu lugar.' },
    { id: 'ferreiro', start: 'Em casa de ferreiro, espeto de', answer: 'pau', end: '.',
      wrong: ['ferro', 'ouro'],
      meaning: 'Às vezes quem mais entende de uma coisa é quem menos cuida dela em casa.' },
    { id: 'ri_ultimo', start: 'Quem ri por último ri', answer: 'melhor', end: '.',
      wrong: ['alto', 'pouco'],
      meaning: 'Só dá para saber quem tinha razão no final, então não vale se gabar antes.' },
    { id: 'pimenta', start: 'Pimenta nos olhos dos outros é', answer: 'refresco', end: '.',
      wrong: ['remédio', 'doce'],
      meaning: 'O problema dos outros parece pequeno para quem não está sentindo.' },
    { id: 'gato', start: 'Gato escaldado tem medo de água', answer: 'fria', end: '.',
      wrong: ['quente', 'suja'],
      meaning: 'Quem já levou um susto fica cuidadoso até com o que parece inofensivo.' },
    { id: 'andorinha', start: 'Uma andorinha só não faz', answer: 'verão', end: '.',
      wrong: ['ninho', 'festa'],
      meaning: 'Uma coisa só não basta para provar ou mudar tudo.' },
    { id: 'olhos', start: 'O que os olhos não veem, o coração não', answer: 'sente', end: '.',
      wrong: ['chora', 'esquece'],
      meaning: 'O que a gente não sabe não nos incomoda.' },
    { id: 'reluz', start: 'Nem tudo que reluz é', answer: 'ouro', end: '.',
      wrong: ['vidro', 'cobre'],
      meaning: 'Nem tudo o que parece valioso realmente é.' },
    { id: 'madruga', start: 'Deus ajuda quem cedo', answer: 'madruga', end: '.',
      wrong: ['reza', 'canta'],
      meaning: 'Quem começa o dia cedo tem mais chances de conseguir o que quer.' },
    { id: 'antes_so', start: 'Antes só do que mal', answer: 'acompanhado', end: '.',
      wrong: ['alimentado', 'cansado'],
      meaning: 'É melhor ficar sozinho do que com companhias que não fazem bem.' },
    { id: 'males', start: 'Há males que vêm para', answer: 'bem', end: '.',
      wrong: ['ficar', 'mudar'],
      meaning: 'Às vezes uma situação difícil acaba trazendo algo bom.' },
    { id: 'canta', start: 'Quem canta seus males', answer: 'espanta', end: '.',
      wrong: ['encanta', 'conta'],
      meaning: 'Cantar, ou se distrair com algo bom, ajuda a afastar a tristeza.' },
    { id: 'pressa', start: 'A pressa é inimiga da', answer: 'perfeição', end: '.',
      wrong: ['educação', 'saúde'],
      meaning: 'Fazer tudo correndo costuma estragar o resultado.' },
    { id: 'rir', start: 'Rir é o melhor', answer: 'remédio', end: '.',
      wrong: ['presente', 'tempero'],
      meaning: 'Uma boa risada faz bem para o corpo e para a alma.' },
    { id: 'vento', start: 'Quem semeia vento colhe', answer: 'tempestade', end: '.',
      wrong: ['chuva', 'flores'],
      meaning: 'Quem provoca confusão acaba recebendo problemas ainda maiores.' },
    { id: 'peixe', start: 'Filho de peixe,', answer: 'peixinho', end: ' é.',
      wrong: ['pescador', 'cardume'],
      meaning: 'Os filhos costumam herdar os hábitos e os talentos dos pais.' },
    { id: 'entendedor', start: 'Para bom entendedor, meia palavra', answer: 'basta', end: '.',
      wrong: ['sobra', 'cansa'],
      meaning: 'Quem entende bem não precisa de longas explicações.' },
    { id: 'cavalo', start: 'A cavalo dado não se olham os', answer: 'dentes', end: '.',
      wrong: ['olhos', 'pés'],
      meaning: 'Não se deve reclamar de um presente.' },
    { id: 'conto', start: 'Quem conta um conto aumenta um', answer: 'ponto', end: '.',
      wrong: ['passo', 'dia'],
      meaning: 'Ao repetir uma história, a gente costuma exagerar um pouquinho.' },
    { id: 'mosca', start: 'Em boca fechada não entra', answer: 'mosca', end: '.',
      wrong: ['vento', 'água'],
      meaning: 'Falar menos evita se meter em confusão.' },
    { id: 'santo', start: 'Santo de casa não faz', answer: 'milagre', end: '.',
      wrong: ['promessa', 'oração'],
      meaning: 'Nem sempre o talento de quem é próximo é valorizado em casa.' },
    { id: 'fumaca', start: 'Onde há fumaça, há', answer: 'fogo', end: '.',
      wrong: ['chuva', 'vento'],
      meaning: 'Quando há sinais de alguma coisa, geralmente existe um motivo verdadeiro.' },
  ];

  /** O ditado inteiro, com a palavra certa no lugar. */
  function fullText(proverb) {
    return proverb.start + ' ' + proverb.answer + proverb.end;
  }

  /** O ditado com a lacuna (___). */
  function promptText(proverb) {
    return proverb.start + ' ___' + proverb.end;
  }

  /** Próximo ditado da rotação (nunca repete o atual de imediato). */
  function nextProverbIndex(currentIndex) {
    return (Math.abs(currentIndex || 0) + 1) % PROVERBS.length;
  }

  /**
   * @param {number} proverbIndex
   * @param {number} [seed]  padrão = o próprio índice: a mesma rodada sempre
   *                         mostra as opções na mesma ordem (reproduzível).
   */
  function createRound(proverbIndex, seed) {
    var safeIndex = Math.abs(proverbIndex || 0) % PROVERBS.length;
    var proverb = PROVERBS[safeIndex];
    var shuffleSeed = seed === undefined ? safeIndex * 7 + 3 : seed;

    return {
      proverbIndex: safeIndex,
      proverb: proverb,
      options: util.seededShuffle([proverb.answer].concat(proverb.wrong), shuffleSeed),
      selectedAnswer: null,
      isSolved: false,
      disabledOptions: [],
      showHint: false,
    };
  }

  /**
   * @returns {{nextState:object, isCorrect:boolean}}
   * Errou: desativa a opção e REVELA a dica (gentle fallback). Opção repetida,
   * inexistente ou rodada já resolvida → MESMO objeto de estado (no-op).
   */
  function submitAnswer(state, option) {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }
    if (state.options.indexOf(option) < 0 || state.disabledOptions.indexOf(option) >= 0) {
      return { nextState: state, isCorrect: false };
    }
    if (option === state.proverb.answer) {
      return {
        nextState: Object.assign({}, state, { selectedAnswer: option, isSolved: true }),
        isCorrect: true,
      };
    }
    return {
      nextState: Object.assign({}, state, {
        selectedAnswer: option,
        disabledOptions: state.disabledOptions.concat([option]),
        showHint: true,
      }),
      isCorrect: false,
    };
  }

  EM.games = EM.games || {};
  EM.games.proverbs = {
    PROVERBS: PROVERBS,
    createRound: createRound,
    submitAnswer: submitAnswer,
    nextProverbIndex: nextProverbIndex,
    fullText: fullText,
    promptText: promptText,
  };
})(window);
