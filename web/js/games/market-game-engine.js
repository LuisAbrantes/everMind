/* ============================================================================
   everMind Web — js/games/market-game-engine.js
   Jogo 8 — Conta do Mercado: contas do dia a dia, com dinheiro brasileiro (R$),
   números pequenos e raciocínio numérico leve. Três faixas, intercaladas:

     Faixa 1 — somar dois itens da compra;
     Faixa 2 — calcular o troco de uma nota de R$ 10, 20 ou 50;
     Faixa 3 — pagar 2 unidades do mesmo item (2 x o preço).

   Sem cronômetro. Errou? A opção fica desativada, uma dica carinhosa aparece
   ("Quase! Tente somar com calma.") e ele tenta outra. Acertou? A conta é
   explicada em uma linha.

   TODO O DINHEIRO É GUARDADO EM CENTAVOS INTEIROS — nunca em ponto flutuante —
   e só é formatado na borda (`formatBRL`). Cada problema traz os operandos e a
   resposta certa escrita à mão (`correctCents`); os testes refazem a conta a
   partir dos operandos e conferem com a resposta declarada.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var util = EM.games.util;

  var NBSP = ' ';

  /** 750 → 'R$ 7,50' (com espaço sem quebra, para o "R$" nunca ficar sozinho). */
  function formatBRL(cents) {
    var value = Math.round(Number(cents) || 0);
    var sign = value < 0 ? '-' : '';
    var abs = Math.abs(value);
    var reais = Math.floor(abs / 100);
    var rest = abs % 100;
    return sign + 'R$' + NBSP + reais + ',' + (rest < 10 ? '0' + rest : String(rest));
  }

  /* ---- Faixa 1: somar dois itens ------------------------------------------ */
  var BAND_1_SUM = [
    { id: 'm1_pao_leite', band: 1, type: 'sum', who: 'Dona Lúcia',
      items: [{ label: 'um pão', cents: 350 }, { label: 'um litro de leite', cents: 400 }],
      correctCents: 750 },
    { id: 'm1_banana_maca', band: 1, type: 'sum', who: 'Seu João',
      items: [{ label: 'um cacho de bananas', cents: 500 }, { label: 'três maçãs', cents: 350 }],
      correctCents: 850 },
    { id: 'm1_cafe_acucar', band: 1, type: 'sum', who: 'Dona Rosa',
      items: [{ label: 'um pacote de café', cents: 800 }, { label: 'um pacote de açúcar', cents: 450 }],
      correctCents: 1250 },
    { id: 'm1_ovos_manteiga', band: 1, type: 'sum', who: 'Seu Antônio',
      items: [{ label: 'uma dúzia de ovos', cents: 900 }, { label: 'um pote de manteiga', cents: 650 }],
      correctCents: 1550 },
    { id: 'm1_arroz_feijao', band: 1, type: 'sum', who: 'Dona Maria',
      items: [{ label: 'um pacote de arroz', cents: 1200 }, { label: 'um pacote de feijão', cents: 750 }],
      correctCents: 1950 },
    { id: 'm1_sabonete_xampu', band: 1, type: 'sum', who: 'Seu Pedro',
      items: [{ label: 'um sabonete', cents: 250 }, { label: 'um frasco de xampu', cents: 1100 }],
      correctCents: 1350 },
    { id: 'm1_tomate_cebola', band: 1, type: 'sum', who: 'Dona Célia',
      items: [{ label: 'um quilo de tomate', cents: 480 }, { label: 'um quilo de cebola', cents: 320 }],
      correctCents: 800 },
  ];

  /* ---- Faixa 2: troco ------------------------------------------------------ */
  var BAND_2_CHANGE = [
    { id: 'm2_nota10_pao', band: 2, type: 'change', who: 'Seu Carlos',
      item: 'um pacote de bolacha', paidCents: 1000, priceCents: 650, correctCents: 350 },
    { id: 'm2_nota10_suco', band: 2, type: 'change', who: 'Dona Neide',
      item: 'uma caixa de suco', paidCents: 1000, priceCents: 850, correctCents: 150 },
    { id: 'm2_nota20_cafe', band: 2, type: 'change', who: 'Seu Paulo',
      item: 'um pacote de café', paidCents: 2000, priceCents: 1350, correctCents: 650 },
    { id: 'm2_nota20_queijo', band: 2, type: 'change', who: 'Dona Lúcia',
      item: 'um pedaço de queijo', paidCents: 2000, priceCents: 1480, correctCents: 520 },
    { id: 'm2_nota20_frango', band: 2, type: 'change', who: 'Seu João',
      item: 'um frango assado', paidCents: 2000, priceCents: 1750, correctCents: 250 },
    { id: 'm2_nota50_carne', band: 2, type: 'change', who: 'Dona Rosa',
      item: 'um pacote de carne', paidCents: 5000, priceCents: 3200, correctCents: 1800 },
    { id: 'm2_nota50_frutas', band: 2, type: 'change', who: 'Seu Antônio',
      item: 'uma sacola de frutas', paidCents: 5000, priceCents: 4350, correctCents: 650 },
  ];

  /* ---- Faixa 3: 2 x o preço ------------------------------------------------ */
  var BAND_3_DOUBLE = [
    { id: 'm3_cafe', band: 3, type: 'double', who: 'Dona Maria',
      unitLabel: 'pacote de café', unitCents: 650, quantity: 2, correctCents: 1300 },
    { id: 'm3_pao_de_queijo', band: 3, type: 'double', who: 'Seu Pedro',
      unitLabel: 'pacote de pão de queijo', unitCents: 425, quantity: 2, correctCents: 850 },
    { id: 'm3_melao', band: 3, type: 'double', who: 'Dona Célia',
      unitLabel: 'melão', unitCents: 750, quantity: 2, correctCents: 1500 },
    { id: 'm3_detergente', band: 3, type: 'double', who: 'Seu Carlos',
      unitLabel: 'frasco de detergente', unitCents: 1240, quantity: 2, correctCents: 2480 },
    { id: 'm3_iogurte', band: 3, type: 'double', who: 'Dona Neide',
      unitLabel: 'pote de iogurte', unitCents: 975, quantity: 2, correctCents: 1950 },
    { id: 'm3_banana', band: 3, type: 'double', who: 'Seu Paulo',
      unitLabel: 'quilo de banana', unitCents: 390, quantity: 2, correctCents: 780 },
    { id: 'm3_azeite', band: 3, type: 'double', who: 'Dona Lúcia',
      unitLabel: 'vidro de azeite', unitCents: 1550, quantity: 2, correctCents: 3100 },
  ];

  /* As faixas entram intercaladas (1, 2, 3, 1, 2, 3…): cada rodada muda de tipo. */
  var PROBLEMS = (function () {
    var out = [];
    for (var i = 0; i < BAND_1_SUM.length; i++) {
      out.push(BAND_1_SUM[i], BAND_2_CHANGE[i], BAND_3_DOUBLE[i]);
    }
    return out;
  })();

  /** A resposta certa recalculada a partir dos operandos (inteiros, em centavos). */
  function computeAnswer(problem) {
    if (problem.type === 'sum') {
      return problem.items.reduce(function (sum, item) { return sum + item.cents; }, 0);
    }
    if (problem.type === 'change') return problem.paidCents - problem.priceCents;
    return problem.unitCents * problem.quantity;
  }

  /** Enunciado do problema, em português do dia a dia. */
  function promptFor(problem) {
    if (problem.type === 'sum') {
      return (
        problem.who + ' foi ao mercado e comprou ' + problem.items[0].label + ' por ' +
        formatBRL(problem.items[0].cents) + ' e ' + problem.items[1].label + ' por ' +
        formatBRL(problem.items[1].cents) + '. Quanto ficou a conta?'
      );
    }
    if (problem.type === 'change') {
      return (
        problem.who + ' comprou ' + problem.item + ' por ' + formatBRL(problem.priceCents) +
        ' e pagou com uma nota de ' + formatBRL(problem.paidCents) + '. Qual foi o troco?'
      );
    }
    return (
      'Cada ' + problem.unitLabel + ' custa ' + formatBRL(problem.unitCents) + '. ' +
      problem.who + ' vai levar ' + problem.quantity + '. Quanto vai pagar?'
    );
  }

  /** A conta explicada em uma linha (mostrada ao acertar). */
  function explanationFor(problem) {
    if (problem.type === 'sum') {
      return (
        formatBRL(problem.items[0].cents) + ' + ' + formatBRL(problem.items[1].cents) +
        ' = ' + formatBRL(problem.correctCents) + '.'
      );
    }
    if (problem.type === 'change') {
      return (
        formatBRL(problem.paidCents) + ' − ' + formatBRL(problem.priceCents) +
        ' = ' + formatBRL(problem.correctCents) + ' de troco.'
      );
    }
    return (
      problem.quantity + ' × ' + formatBRL(problem.unitCents) + ' = ' +
      formatBRL(problem.correctCents) + '.'
    );
  }

  /** Dica carinhosa, no tom do tipo de conta. */
  function hintFor(problem) {
    if (problem.type === 'sum') return 'Quase! Tente somar com calma.';
    if (problem.type === 'change') {
      return 'Quase! Tente subtrair com calma: o troco é o que sobra da nota.';
    }
    return 'Quase! Tente dobrar o preço com calma: some o valor de um com ele mesmo.';
  }

  /* Deslocamentos (em centavos) para fabricar respostas erradas que SOAM
     plausíveis: perto da certa, nunca iguais a ela. */
  var OFFSETS = [100, -100, 50, -50, 200, -200, 150, -150, 250, -250];

  /**
   * 3 respostas erradas determinísticas, positivas, distintas entre si e da certa.
   * Na faixa 3 a primeira candidata é o preço de UM (quem esquece de dobrar).
   */
  function distractorsFor(problem, index) {
    var correct = problem.correctCents;
    var candidates = [];
    if (problem.type === 'double') candidates.push(problem.unitCents);
    for (var k = 0; k < OFFSETS.length; k++) {
      candidates.push(correct + OFFSETS[(k + index) % OFFSETS.length]);
    }
    var out = [];
    candidates.forEach(function (value) {
      if (out.length >= 3) return;
      if (value > 0 && value !== correct && out.indexOf(value) < 0) out.push(value);
    });
    return out;
  }

  /** Próximo problema da rotação (nunca repete o atual de imediato). */
  function nextProblemIndex(currentIndex) {
    return (Math.abs(currentIndex || 0) + 1) % PROBLEMS.length;
  }

  /**
   * @param {number} problemIndex
   * @param {number} [seed]  padrão derivado do índice (rodada reproduzível)
   */
  function createRound(problemIndex, seed) {
    var safeIndex = Math.abs(problemIndex || 0) % PROBLEMS.length;
    var problem = PROBLEMS[safeIndex];
    var shuffleSeed = seed === undefined ? safeIndex * 11 + 5 : seed;
    var options = util.seededShuffle(
      [problem.correctCents].concat(distractorsFor(problem, safeIndex)),
      shuffleSeed
    );

    return {
      problemIndex: safeIndex,
      problem: problem,
      options: options, // centavos inteiros
      selectedAnswer: null,
      isSolved: false,
      disabledOptions: [],
      showHint: false,
    };
  }

  /**
   * @returns {{nextState:object, isCorrect:boolean}}
   * Errou: desativa a opção e REVELA a dica. Opção repetida, inexistente ou
   * rodada já resolvida → MESMO objeto de estado (no-op).
   */
  function submitAnswer(state, cents) {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }
    if (state.options.indexOf(cents) < 0 || state.disabledOptions.indexOf(cents) >= 0) {
      return { nextState: state, isCorrect: false };
    }
    if (cents === state.problem.correctCents) {
      return {
        nextState: Object.assign({}, state, { selectedAnswer: cents, isSolved: true }),
        isCorrect: true,
      };
    }
    return {
      nextState: Object.assign({}, state, {
        selectedAnswer: cents,
        disabledOptions: state.disabledOptions.concat([cents]),
        showHint: true,
      }),
      isCorrect: false,
    };
  }

  EM.games = EM.games || {};
  EM.games.market = {
    PROBLEMS: PROBLEMS,
    formatBRL: formatBRL,
    computeAnswer: computeAnswer,
    promptFor: promptFor,
    explanationFor: explanationFor,
    hintFor: hintFor,
    createRound: createRound,
    submitAnswer: submitAnswer,
    nextProblemIndex: nextProblemIndex,
  };
})(window);
