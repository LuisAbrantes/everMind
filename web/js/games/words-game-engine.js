/* ============================================================================
   everMind Web — js/games/words-game-engine.js
   Portagem de `src/modules/brain/WordsGameEngine.ts`, com UMA mudança de
   produto deliberada (outubro/2026): agora existe o que decidir.

   Jogo 3 — Formação de Palavras: uma letra sorteada + UMA categoria clara
   (ex.: "Toque em 3 FRUTAS que começam com M"). O usuário encontra
   `targetCount` (3) palavras entre as opções.

   ┌─ Antes ────────────────────────────────────────────────────────────────┐
   │  "Não existe resposta errada: TODAS as sugestões são válidas." Toda opção│
   │  servia, então não havia nada a decidir e o jogo perdia o sentido.      │
   └────────────────────────────────────────────────────────────────────────┘
   ┌─ Agora ───────────────────────────────────────────────────────────────┐
   │  Cada desafio tem `validSuggestions` (servem) e `distractors` (claramente│
   │  não servem). O conjunto mostrado mistura os dois e embaralha. Há dois  │
   │  tipos de distrator, SEM ambiguidade:                                   │
   │    • tema certo, LETRA errada  (ex.: "Banana" — fruta, mas começa com B)│
   │    • letra certa, TEMA errado  (ex.: "Martelo" — com M, mas não é fruta)│
   │  O tipo é deduzido da primeira letra (sem acento) — não é dado à parte. │
   │  Tocar num distrator NÃO tira nada: a opção fica desativada (tracejada),│
   │  aparece uma dica carinhosa composta dos dados e o usuário tenta outra. │
   └────────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /* Composição do conjunto mostrado: 4 palavras que servem + 4 que não servem
     (2 de cada tipo). 8 opções = 4 linhas de 2 toques confortáveis. */
  var POOL_VALID_COUNT = 4;
  var POOL_WRONG_LETTER_COUNT = 2;
  var POOL_WRONG_THEME_COUNT = 2;

  /**
   * Monta um desafio. `instruction` é derivada: diz com precisão o que tocar.
   *
   * Regras de curadoria (conferidas pelos testes de integridade):
   *   • toda palavra de `validSuggestions` começa com `letter` e é, sem
   *     dúvida, membro da categoria;
   *   • `distractors` de "letra errada" são, sem dúvida, membros da categoria
   *     que NÃO começam com `letter`;
   *   • `distractors` de "tema errado" começam com `letter` e, sem dúvida, NÃO
   *     são membros da categoria (nada que alguém pudesse defender como certo);
   *   • nenhuma palavra se repete, nem entre as duas listas.
   */
  function defineChallenge(def) {
    return {
      id: def.id,
      letter: def.letter,
      theme: def.theme,
      themeDescription: def.themeDescription,
      categoryPlural: def.categoryPlural,
      itemLabel: def.itemLabel,
      targetCount: 3,
      instruction:
        'Toque em 3 ' + def.categoryPlural.toUpperCase() + ' que começam com ' + def.letter,
      validSuggestions: def.validSuggestions,
      distractors: def.distractors,
    };
  }

  var PRESET_WORD_CHALLENGES = [
    defineChallenge({
      id: 'words_letter_m',
      letter: 'M',
      theme: 'Frutas',
      themeDescription: 'Pense em frutas que você conhece e que começam com M.',
      categoryPlural: 'frutas',
      itemLabel: 'uma fruta',
      validSuggestions: [
        'Maçã', 'Melancia', 'Mamão', 'Morango', 'Manga', 'Maracujá', 'Melão', 'Mexerica',
      ],
      distractors: [
        // fruta, mas outra letra
        'Banana', 'Laranja', 'Uva', 'Abacaxi', 'Goiaba', 'Pera',
        // começa com M, mas não é fruta
        'Martelo', 'Mesa', 'Moto', 'Mala', 'Mochila', 'Meia',
      ],
    }),
    defineChallenge({
      id: 'words_letter_c',
      letter: 'C',
      theme: 'Objetos de casa',
      themeDescription: 'Pense em coisas que você encontra dentro de uma casa.',
      categoryPlural: 'objetos de casa',
      itemLabel: 'um objeto de casa',
      validSuggestions: [
        'Cadeira', 'Cama', 'Copo', 'Colher', 'Cortina', 'Caneca', 'Cobertor', 'Cabide',
      ],
      distractors: [
        'Mesa', 'Sofá', 'Panela', 'Prato', 'Garfo', 'Vassoura',
        'Cavalo', 'Cidade', 'Cometa', 'Campo', 'Coelho', 'Cobra',
      ],
    }),
    defineChallenge({
      id: 'words_letter_s',
      letter: 'S',
      theme: 'Coisas da natureza',
      themeDescription: 'Pense em coisas que existem na natureza, sem ajuda de ninguém.',
      categoryPlural: 'coisas da natureza',
      itemLabel: 'uma coisa da natureza',
      validSuggestions: [
        'Sol', 'Serra', 'Selva', 'Semente', 'Samambaia', 'Savana',
      ],
      distractors: [
        'Lua', 'Rio', 'Mar', 'Nuvem', 'Montanha', 'Chuva',
        'Sapato', 'Sofá', 'Sabão', 'Sino', 'Sandália', 'Sopa',
      ],
    }),
    defineChallenge({
      id: 'words_letter_b',
      letter: 'B',
      theme: 'Animais',
      themeDescription: 'Pense em bichos: da fazenda, da mata, do mar ou do quintal.',
      categoryPlural: 'animais',
      itemLabel: 'um animal',
      validSuggestions: [
        'Boi', 'Borboleta', 'Baleia', 'Bode', 'Besouro', 'Burro', 'Bem-te-vi',
      ],
      distractors: [
        'Cavalo', 'Gato', 'Pato', 'Vaca', 'Leão', 'Tartaruga',
        'Bola', 'Banco', 'Balde', 'Botão', 'Barco', 'Bicicleta',
      ],
    }),
    defineChallenge({
      id: 'words_letter_p',
      letter: 'P',
      theme: 'Comidas',
      themeDescription: 'Pense em coisas gostosas de comer, do café da manhã ao jantar.',
      categoryPlural: 'comidas',
      itemLabel: 'uma comida',
      validSuggestions: [
        'Pão', 'Pizza', 'Pastel', 'Pipoca', 'Pudim', 'Pamonha', 'Peixe', 'Pimentão',
      ],
      distractors: [
        'Arroz', 'Feijão', 'Bolo', 'Queijo', 'Macarrão', 'Tapioca',
        'Porta', 'Praça', 'Piano', 'Pente', 'Pedra', 'Pneu',
      ],
    }),
    defineChallenge({
      id: 'words_letter_c_body',
      letter: 'C',
      theme: 'Partes do corpo',
      themeDescription: 'Pense em partes do corpo humano, de cima a baixo.',
      categoryPlural: 'partes do corpo',
      itemLabel: 'uma parte do corpo',
      validSuggestions: [
        'Cabeça', 'Cabelo', 'Cotovelo', 'Coração', 'Costas', 'Coxa', 'Cintura', 'Cílios',
      ],
      distractors: [
        'Mão', 'Pé', 'Nariz', 'Olho', 'Joelho', 'Orelha',
        'Cadeira', 'Cavalo', 'Casa', 'Chapéu', 'Carro', 'Copo',
      ],
    }),
    defineChallenge({
      id: 'words_letter_b_clothes',
      letter: 'B',
      theme: 'Roupas',
      themeDescription: 'Pense em peças de roupa que as pessoas vestem.',
      categoryPlural: 'peças de roupa',
      itemLabel: 'uma peça de roupa',
      validSuggestions: [
        'Blusa', 'Bota', 'Boné', 'Bermuda', 'Biquíni', 'Bata', 'Boina',
      ],
      distractors: [
        'Camisa', 'Calça', 'Meia', 'Saia', 'Luva', 'Vestido',
        'Bola', 'Banco', 'Balde', 'Barco', 'Bicicleta', 'Banana',
      ],
    }),
    defineChallenge({
      id: 'words_letter_s_cities',
      letter: 'S',
      theme: 'Cidades do Brasil',
      themeDescription: 'Pense em cidades brasileiras, grandes ou pequenas.',
      categoryPlural: 'cidades do Brasil',
      itemLabel: 'uma cidade do Brasil',
      validSuggestions: [
        'São Paulo', 'Salvador', 'Santos', 'Santarém', 'Sorocaba', 'Sobral', 'Santa Maria',
      ],
      distractors: [
        'Recife', 'Curitiba', 'Manaus', 'Belém', 'Fortaleza', 'Goiânia',
        'Sapato', 'Sofá', 'Sabão', 'Sino', 'Sopa', 'Sandália',
      ],
    }),
    defineChallenge({
      id: 'words_letter_p_jobs',
      letter: 'P',
      theme: 'Profissões',
      themeDescription: 'Pense em trabalhos que as pessoas fazem para ganhar a vida.',
      categoryPlural: 'profissões',
      itemLabel: 'uma profissão',
      validSuggestions: [
        'Padeiro', 'Pedreiro', 'Professor', 'Pintor', 'Pescador', 'Policial', 'Pianista', 'Piloto',
      ],
      distractors: [
        'Médico', 'Cozinheiro', 'Motorista', 'Dentista', 'Jardineiro', 'Carteiro',
        'Pente', 'Porta', 'Praia', 'Pedra', 'Prato', 'Piano',
      ],
    }),
    defineChallenge({
      id: 'words_letter_t',
      letter: 'T',
      theme: 'Meios de transporte',
      themeDescription: 'Pense em veículos que levam pessoas de um lugar a outro.',
      categoryPlural: 'meios de transporte',
      itemLabel: 'um meio de transporte',
      validSuggestions: [
        'Táxi', 'Trem', 'Trator', 'Triciclo', 'Teleférico', 'Trólebus',
      ],
      distractors: [
        'Ônibus', 'Carro', 'Bicicleta', 'Avião', 'Barco', 'Metrô',
        'Toalha', 'Telhado', 'Tomate', 'Tesoura', 'Tigre', 'Tapete',
      ],
    }),
  ];

  /* ------------------------------------------------------------------------
     Utilidades
     ---------------------------------------------------------------------- */

  /** Minúsculas, sem acentos e sem espaços nas pontas (só p/ achar a 1ª letra). */
  function fold(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();
  }

  function lower(value) {
    return String(value).trim().toLowerCase();
  }

  /** Embaralhamento com o comparador clássico (ver README §4.5). */
  function biasedShuffle(list, rng) {
    return list.slice().sort(function () {
      return 0.5 - rng();
    });
  }

  /**
   * Tipo do distrator, deduzido da primeira letra (sem acento):
   *   'letter' → o tema serve, a LETRA não;
   *   'theme'  → a letra serve, o TEMA não.
   */
  function distractorKind(challenge, word) {
    return fold(word).charAt(0) === fold(challenge.letter).charAt(0) ? 'theme' : 'letter';
  }

  /** Dica carinhosa composta a partir dos dados do desafio. */
  function hintFor(challenge, word) {
    var shown = String(word).trim();
    if (distractorKind(challenge, shown) === 'letter') {
      return (
        'Quase! "' + shown + '" é ' + challenge.itemLabel +
        ', mas não começa com ' + challenge.letter + '. Tente outra.'
      );
    }
    return (
      'Quase! "' + shown + '" começa com ' + challenge.letter +
      ', mas não é ' + challenge.itemLabel + '. Tente outra.'
    );
  }

  /** Próximo desafio da rotação (nunca repete o atual de imediato). */
  function nextChallengeIndex(currentIndex) {
    return (Math.abs(currentIndex || 0) + 1) % PRESET_WORD_CHALLENGES.length;
  }

  /**
   * @param {number} challengeIndex
   * @param {function} [rng]  padrão Math.random (testes podem injetar um fixo)
   */
  function createRound(challengeIndex, rng) {
    var random = typeof rng === 'function' ? rng : Math.random;
    var safeIndex = Math.abs(challengeIndex || 0) % PRESET_WORD_CHALLENGES.length;
    var challenge = PRESET_WORD_CHALLENGES[safeIndex];

    var wrongLetter = challenge.distractors.filter(function (word) {
      return distractorKind(challenge, word) === 'letter';
    });
    var wrongTheme = challenge.distractors.filter(function (word) {
      return distractorKind(challenge, word) === 'theme';
    });

    var chosen = biasedShuffle(challenge.validSuggestions, random)
      .slice(0, POOL_VALID_COUNT)
      .concat(biasedShuffle(wrongLetter, random).slice(0, POOL_WRONG_LETTER_COUNT))
      .concat(biasedShuffle(wrongTheme, random).slice(0, POOL_WRONG_THEME_COUNT));

    return {
      challenge: challenge,
      challengeIndex: safeIndex,
      foundWords: [],
      wrongWords: [],
      lastWrongWord: null,
      // ⚠️ Embaralhamento com o comparador clássico `() => 0.5 - Math.random()`.
      //    NÃO é um Fisher–Yates uniforme: é o que dá a "sensação de sorteio".
      optionsPool: biasedShuffle(chosen, random),
      isComplete: false,
    };
  }

  /**
   * Julga uma palavra.
   * @returns {{nextState:object, isAccepted:boolean, isWrong:boolean, hint:(string|null)}}
   *
   *   • serve e é nova           → entra em `foundWords` (guardada sem espaços
   *                                nas pontas, acentos e maiúsculas originais);
   *   • é um distrator conhecido → entra em `wrongWords`, `isWrong: true` e a
   *                                `hint` carinhosa. Nada é descontado, a rodada
   *                                não acaba e o contador não muda;
   *   • repetida / já descartada / desconhecida / rodada concluída
   *                              → MESMO objeto de estado (no-op).
   *
   * Observações de fidelidade:
   *   • a comparação é case-insensitive após `trim()`;
   *   • NÃO há insensibilidade a acentos: "maca" ≠ "Maçã" (como no original);
   *   • `optionsPool` nunca é mutado — quem desativa a opção é a camada de UI.
   */
  function selectWord(state, word) {
    if (state.isComplete) {
      return { nextState: state, isAccepted: true, isWrong: false, hint: null };
    }

    var normalizedWord = lower(word);
    var wrongSoFar = state.wrongWords || [];

    var isAlreadyFound = state.foundWords.some(function (found) {
      return lower(found) === normalizedWord;
    });
    if (isAlreadyFound) {
      return { nextState: state, isAccepted: false, isWrong: false, hint: null };
    }

    var isAlreadyWrong = wrongSoFar.some(function (wrong) {
      return lower(wrong) === normalizedWord;
    });
    if (isAlreadyWrong) {
      return { nextState: state, isAccepted: false, isWrong: false, hint: null };
    }

    var isValid = state.challenge.validSuggestions.some(function (valid) {
      return lower(valid) === normalizedWord;
    });

    if (isValid) {
      var nextFound = state.foundWords.concat([String(word).trim()]);
      var isComplete = nextFound.length >= state.challenge.targetCount;
      return {
        nextState: Object.assign({}, state, {
          foundWords: nextFound,
          lastWrongWord: null,
          isComplete: isComplete,
        }),
        isAccepted: true,
        isWrong: false,
        hint: null,
      };
    }

    var known = state.challenge.distractors.filter(function (distractor) {
      return lower(distractor) === normalizedWord;
    })[0];
    if (!known) {
      return { nextState: state, isAccepted: false, isWrong: false, hint: null };
    }

    return {
      nextState: Object.assign({}, state, {
        wrongWords: wrongSoFar.concat([known]),
        lastWrongWord: known,
      }),
      isAccepted: false,
      isWrong: true,
      hint: hintFor(state.challenge, known),
    };
  }

  EM.games = EM.games || {};
  EM.games.words = {
    PRESET_WORD_CHALLENGES: PRESET_WORD_CHALLENGES,
    POOL_VALID_COUNT: POOL_VALID_COUNT,
    POOL_WRONG_LETTER_COUNT: POOL_WRONG_LETTER_COUNT,
    POOL_WRONG_THEME_COUNT: POOL_WRONG_THEME_COUNT,
    createRound: createRound,
    selectWord: selectWord,
    nextChallengeIndex: nextChallengeIndex,
    distractorKind: distractorKind,
    hintFor: hintFor,
  };
})(window);
