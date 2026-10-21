/* ============================================================================
   everMind Web — js/games/music-game-engine.js

   Jogo 5 — Reconhecimento Musical: ouvir um trecho curto de uma melodia
   tradicional brasileira (domínio público) e escolher o nome da canção.

   Áudio: `EM.audio.playNotes(notes, {bpm, onEnd})` (feedback-service.js).
   As melodias são listas de notas: {note:'G4', beats:1} ou {rest:true, beats:1}.
   Transcrições feitas de memória, em dó maior, ~8-12 notas; trechos
   reconhecíveis, não partituras oficiais.

   API: createRound(index) é DETERMINÍSTICA: mesma entrada => mesma rodada
   (trilha index mod N; distratores = trilhas +1 e +3; posição da resposta
   rotaciona com o índice). Resposta correta aparece exatamente 1 vez.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  var PRESET_MUSIC_TRACKS = [
    {
      id: 'music_parabens',
      title: 'Parabéns a Você',
      composer: 'Tradicional (domínio público)',
      genre: 'Canção de aniversário',
      soundSnippetDescription: '🎵 Pista: Uma canção que se canta ao redor do bolo.',
      culturalNote: 'Cantada em todo o Brasil nas festas de aniversário, quase sempre com palmas.',
      melody: [ { note: 'G4', beats: 0.75 }, { note: 'G4', beats: 0.25 }, { note: 'A4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'C5', beats: 1 }, { note: 'B4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_atirei',
      title: 'Atirei o Pau no Gato',
      composer: 'Cantiga popular',
      genre: 'Cantiga de roda',
      soundSnippetDescription: '🎵 Pista: Uma cantiga que fala de um gato levado.',
      culturalNote: 'Cantiga tradicional muito cantada pelas crianças brasileiras.',
      melody: [ { note: 'E4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 1 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 1 }, { note: 'E4', beats: 0.5 }, { note: 'D4', beats: 0.5 }, { note: 'C4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_ciranda',
      title: 'Ciranda, Cirandinha',
      composer: 'Cantiga popular',
      genre: 'Cantiga de roda',
      soundSnippetDescription: '🎵 Pista: Uma roda de mãos dadas.',
      culturalNote: 'Brincadeira de roda em que todos giram juntos de mãos dadas.',
      melody: [ { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'A4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'E4', beats: 0.5 }, { note: 'E4', beats: 0.5 }, { note: 'D4', beats: 0.5 }, { note: 'D4', beats: 0.5 }, { note: 'C4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_cravo',
      title: 'O Cravo Brigou com a Rosa',
      composer: 'Cantiga popular',
      genre: 'Cantiga de roda',
      soundSnippetDescription: '🎵 Pista: Uma flor que brigou com outra.',
      culturalNote: 'Cantiga de roda em que o cravo e a rosa se desentendem e fazem as pazes.',
      melody: [ { note: 'C4', beats: 1 }, { note: 'E4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'A4', beats: 1 }, { note: 'G4', beats: 2 }, { note: 'E4', beats: 1 }, { note: 'C4', beats: 1 }, { note: 'D4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_sapo',
      title: 'Sapo Cururu',
      composer: 'Cantiga popular',
      genre: 'Cantiga de roda',
      soundSnippetDescription: '🎵 Pista: Um bicho que vive à beira do rio.',
      culturalNote: 'Cantiga de roda sobre o sapo na beira do rio, com a mulher do sapo fazendo renda.',
      melody: [ { note: 'E4', beats: 0.5 }, { note: 'E4', beats: 0.5 }, { note: 'G4', beats: 1 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'E4', beats: 1 }, { note: 'D4', beats: 0.5 }, { note: 'D4', beats: 0.5 }, { note: 'C4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_balao',
      title: 'Cai, Cai, Balão',
      composer: 'Cantiga popular',
      genre: 'Cantiga de festa junina',
      soundSnippetDescription: '🎵 Pista: Algo que sobe e desce no céu da festa.',
      culturalNote: 'Cantiga de São João sobre o balão que cai e anima a festa.',
      melody: [ { note: 'C5', beats: 0.5 }, { note: 'C5', beats: 0.5 }, { note: 'A4', beats: 1 }, { note: 'A4', beats: 0.5 }, { note: 'C5', beats: 0.5 }, { note: 'C5', beats: 0.5 }, { note: 'A4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'F4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_alecrim',
      title: 'Alecrim Dourado',
      composer: 'Cantiga popular',
      genre: 'Cantiga de roda',
      soundSnippetDescription: '🎵 Pista: Uma erva cheirosa semeada no campo.',
      culturalNote: 'Cantiga tradicional que fala do alecrim, uma erva de cheiro.',
      melody: [ { note: 'E4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'G4', beats: 2 }, { note: 'E4', beats: 1 }, { note: 'G4', beats: 1 }, { note: 'A4', beats: 2 }, { note: 'G4', beats: 1 }, { note: 'E4', beats: 1 }, { note: 'D4', beats: 2 } ],
      bpm: 96,
    },
    {
      id: 'music_marcha',
      title: 'Marcha Soldado',
      composer: 'Cantiga popular',
      genre: 'Cantiga de marcha',
      soundSnippetDescription: '🎵 Pista: Uma marcha com cabeça de papel.',
      culturalNote: 'Cantiga de marcha infantil, boa para bater o pé no ritmo.',
      melody: [ { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 1 }, { note: 'E4', beats: 1 }, { note: 'E4', beats: 1 }, { note: 'G4', beats: 0.5 }, { note: 'G4', beats: 0.5 }, { note: 'A4', beats: 1 }, { note: 'G4', beats: 2 } ],
      bpm: 96,
    },
  ];

  /** Opções fixas por trilha: correta + 2 distratores determinísticos, em ordem rotacionada. */
  function buildOptions(index) {
    var n = PRESET_MUSIC_TRACKS.length;
    var titles = [
      PRESET_MUSIC_TRACKS[index].title,
      PRESET_MUSIC_TRACKS[(index + 1) % n].title,
      PRESET_MUSIC_TRACKS[(index + 3) % n].title,
    ];
    var rot = index % 3;
    return titles.slice(rot).concat(titles.slice(0, rot));
  }

  function createRound(trackIndex) {
    var n = PRESET_MUSIC_TRACKS.length;
    var safeIndex = Math.abs(Math.floor(trackIndex || 0)) % n;
    var base = PRESET_MUSIC_TRACKS[safeIndex];
    var track = Object.assign({}, base, {
      options: buildOptions(safeIndex),
      correctTitle: base.title,
    });
    return {
      trackIndex: safeIndex,
      track: track,
      selectedOption: null,
      isPlaying: false,
      isSolved: false,
      disabledOptions: [],
    };
  }

  /** Próximo índice diferente do atual (rand injetável). */
  function nextTrackIndex(current, rand) {
    var n = PRESET_MUSIC_TRACKS.length;
    var r = typeof rand === 'function' ? rand() : Math.random();
    return ((current || 0) + 1 + Math.floor(r * (n - 1))) % n;
  }

  function togglePlayback(state) {
    return Object.assign({}, state, { isPlaying: !state.isPlaying });
  }

  /**
   * @returns {{nextState:object, isCorrect:boolean}}
   * ⚠️ A comparação é por igualdade EXATA de string (case-sensitive), como no
   *    original.
   */
  function selectOption(state, option) {
    if (state.isSolved) {
      return { nextState: state, isCorrect: true };
    }

    if (option === state.track.correctTitle) {
      return {
        nextState: Object.assign({}, state, {
          selectedOption: option,
          isSolved: true,
          isPlaying: false,
        }),
        isCorrect: true,
      };
    }

    // Errou: desativa a opção. `isPlaying` NÃO é alterado — o trecho continua
    // "tocando", o usuário pode voltar a ouvir antes de tentar de novo.
    var nextDisabled = Array.from(new Set(state.disabledOptions.concat([option])));

    return {
      nextState: Object.assign({}, state, {
        selectedOption: option,
        disabledOptions: nextDisabled,
      }),
      isCorrect: false,
    };
  }

  EM.games = EM.games || {};
  EM.games.music = {
    PRESET_MUSIC_TRACKS: PRESET_MUSIC_TRACKS,
    createRound: createRound,
    nextTrackIndex: nextTrackIndex,
    togglePlayback: togglePlayback,
    selectOption: selectOption,
  };
})(window);
