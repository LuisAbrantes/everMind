/* ============================================================================
   everMind Web — js/screens/brain-gym.js
   Tela 2 — "Mente" / Ginástica Cerebral.

   Portagem 1:1 de `src/screens/BrainGymScreen/`:
     index.tsx + useBrainGym.ts  → estado e handlers
     BrainGymScreenView.tsx      → cabeçalho, banner e menu
     components/MemoryGameView.tsx
     components/SequenceGameView.tsx
     components/WordsGameView.tsx
     components/AttentionGameView.tsx
     components/MusicGameView.tsx
   e, desde outubro/2026, 4 jogos que NÃO existem no app original (variedade
   cognitiva: memória de pares, cultura geral, cálculo e sequenciamento):
     Pares · Complete o Ditado · Conta do Mercado · Ordem Certa

   REGRA DE DOMÍNIO (CONTEXT.md §5.3): sem temporizador regressivo, sem tela de
   "Game Over", tentativas ilimitadas. Errou? A opção é desativada suavemente e
   uma dica carinhosa aparece.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var h = EM.dom.h;
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var memoryEngine = EM.games.memory;
  var sequenceEngine = EM.games.sequence;
  var wordsEngine = EM.games.words;
  var attentionEngine = EM.games.attention;
  var musicEngine = EM.games.music;
  var pairsEngine = EM.games.pairs;
  var proverbsEngine = EM.games.proverbs;
  var marketEngine = EM.games.market;
  var orderEngine = EM.games.order;
  var brainEngine = EM.domain.brainEvolutionEngine;

  var STORAGE_KEY_MIND_COUNT = 'evermind_mind_activities_count';
  var GROWTH_POINTS_PER_GAME = 10;

  /** Jogos que `openGame` (Tríade, rotas) e o menu aceitam. */
  var GAME_IDS = ['MEMORY', 'SEQUENCE', 'WORDS', 'ATTENTION', 'MUSIC', 'PAIRS', 'PROVERBS', 'MARKET', 'ORDER'];

  /** Dica carinhosa genérica do Complete o Ditado (o certo nunca é revelado). */
  var PROVERBS_HINT = 'Quase! Leia o ditado com calma, lembre como ele costuma ser dito e tente outra palavra.';

  /* ------------------------------------------------------------------------
     Estado local da tela — equivalente ao conjunto de useState do hook.
     Criado UMA vez (na primeira renderização) e mantido no closure.
     ---------------------------------------------------------------------- */
  var state = null;

  function randomIndex(length) {
    return Math.floor(Math.random() * length);
  }

  function ensureState() {
    if (state) return state;

    var app = EM.app;

    state = {
      activeGame: 'MENU',
      completedGamesCount: app.storage.get(STORAGE_KEY_MIND_COUNT) || 0,
      memoryRound: memoryEngine.createRound(1),
      sequenceRound: sequenceEngine.createRound(0),
      // Cada sessão começa num desafio diferente; as rodadas seguintes avançam
      // pela rotação do próprio motor (nunca repetem o desafio anterior).
      wordsRound: wordsEngine.createRound(randomIndex(wordsEngine.PRESET_WORD_CHALLENGES.length)),
      attentionRound: attentionEngine.createRound(0),
      musicRound: musicEngine.createRound(Math.floor(Math.random() * 8)),
      pairsRound: pairsEngine.createRound(Date.now()),
      proverbsRound: proverbsEngine.createRound(randomIndex(proverbsEngine.PROVERBS.length)),
      marketRound: marketEngine.createRound(randomIndex(marketEngine.PROBLEMS.length)),
      orderRound: orderEngine.createRound(randomIndex(orderEngine.ROUTINES.length)),
    };

    return state;
  }

  /* ------------------------------------------------------------------------
     recordActivityCompletion — +1 atividade de Mente, +10 pontos, sequência,
     log semanal, desafio da Tríade (se o jogo for o do dia) e conquistas:
     tudo numa única chamada a `EM.app.recordActivity` (ADR-0009).

     `gameKey` = 'memory' | 'sequence' | 'words' | 'attention' | 'music' |
                 'pairs' | 'proverbs' | 'market' | 'order'.
     ---------------------------------------------------------------------- */
  function recordActivityCompletion(gameKey) {
    var app = EM.app;
    var s = ensureState();

    s.completedGamesCount += 1;
    app.storage.set(STORAGE_KEY_MIND_COUNT, s.completedGamesCount);

    app.recordActivity({
      pillar: 'MIND',
      kind: 'game:' + gameKey,
      activityKey: 'game:' + gameKey,
      points: GROWTH_POINTS_PER_GAME,
    });

    app.feedback.triggerSuccessFeedback();
  }

  /* =========================================================================
     HANDLERS — useBrainGym.ts
     ======================================================================= */

  /* --- 1. Memória Visual ------------------------------------------------- */
  function handleMemoryStartSelection() {
    var s = ensureState();
    s.memoryRound = memoryEngine.startSelectionPhase(s.memoryRound);
    EM.app.feedback.triggerSelectFeedback();
    EM.app.render();
  }

  function handleMemoryToggleItem(itemId) {
    var s = ensureState();
    var result = memoryEngine.toggleItemSelection(s.memoryRound, itemId);
    var previous = s.memoryRound;
    s.memoryRound = result.nextState;

    if (result.isCorrectPick) EM.app.feedback.triggerSelectFeedback();

    // Detecta "acabou de concluir" comparando com o estado anterior.
    if (result.nextState.isRoundComplete && !previous.isRoundComplete) {
      recordActivityCompletion('memory');
    }

    EM.app.render();
  }

  function handleMemoryNextRound() {
    var s = ensureState();
    s.memoryRound = memoryEngine.createRound(Date.now());
    EM.app.render();
  }

  /* --- 2. Sequência Lógica ---------------------------------------------- */
  function handleSequenceSubmit(answer) {
    var s = ensureState();
    var result = sequenceEngine.submitAnswer(s.sequenceRound, answer);
    var previous = s.sequenceRound;
    s.sequenceRound = result.nextState;

    if (result.isCorrect) {
      if (!previous.isSolved) recordActivityCompletion('sequence');
    } else {
      EM.app.feedback.triggerGentleNoticeFeedback();
    }

    EM.app.render();
  }

  function handleSequenceNextPuzzle() {
    var s = ensureState();
    s.sequenceRound = sequenceEngine.createRound(Math.floor(Math.random() * 5));
    EM.app.render();
  }

  /* --- 3. Formação de Palavras ------------------------------------------ */
  function handleWordsSelect(word) {
    var s = ensureState();
    var result = wordsEngine.selectWord(s.wordsRound, word);
    var previous = s.wordsRound;
    s.wordsRound = result.nextState;

    if (result.isAccepted) {
      if (result.nextState !== previous) {
        EM.app.feedback.triggerSelectFeedback();
        EM.announce('Muito bem! ' + String(word).trim() + ' serve. ' + result.nextState.foundWords.length +
          ' de ' + result.nextState.challenge.targetCount + '.');
      }
    } else if (result.isWrong) {
      // Palavra que não serve: dica carinhosa, a opção fica desativada e a
      // rodada segue (nada é descontado, o contador não muda).
      EM.app.feedback.triggerGentleNoticeFeedback();
      EM.announce(result.hint);
    }

    if (result.nextState.isComplete && !previous.isComplete) {
      EM.announce('Muito bem! Você completou as ' + result.nextState.challenge.targetCount + ' palavras.');
      recordActivityCompletion('words');
    }

    EM.app.render();
  }

  function handleWordsNextChallenge() {
    var s = ensureState();
    s.wordsRound = wordsEngine.createRound(wordsEngine.nextChallengeIndex(s.wordsRound.challengeIndex));
    EM.app.render();
  }

  /* --- 4. Atenção & Diferenças ------------------------------------------- */
  function handleAttentionSelect(itemId) {
    var s = ensureState();
    var result = attentionEngine.selectItem(s.attentionRound, itemId);
    var previous = s.attentionRound;
    s.attentionRound = result.nextState;

    if (result.isCorrect) {
      if (!previous.isSolved) recordActivityCompletion('attention');
    } else {
      EM.app.feedback.triggerGentleNoticeFeedback();
    }

    EM.app.render();
  }

  function handleAttentionNextPuzzle() {
    var s = ensureState();
    s.attentionRound = attentionEngine.createRound(Math.floor(Math.random() * 3));
    EM.app.render();
  }

  /* --- 5. Memória Musical ------------------------------------------------ */
  var musicHandle = null;
  var musicWatch = null;
  var musicToken = 0;
  var musicAudioFailed = false;

  /** Há áudio disponível e ligado? (código defensivo: o helper pode não existir.) */
  function musicAudioAvailable() {
    var a = EM.audio;
    if (!a || typeof a.playNotes !== 'function') return false;
    if (typeof a.isSoundEnabled === 'function' && !a.isSoundEnabled()) return false;
    return !musicAudioFailed;
  }

  function stopMusicAudio() {
    musicToken++;
    if (musicWatch) {
      global.clearInterval(musicWatch);
      musicWatch = null;
    }
    if (musicHandle && typeof musicHandle.stop === 'function') {
      try { musicHandle.stop(); } catch (e) { /* ignora */ }
    }
    musicHandle = null;
    if (EM.audio && typeof EM.audio.stopAll === 'function') {
      try { EM.audio.stopAll(); } catch (e2) { /* ignora */ }
    }
    if (state && state.musicRound && state.musicRound.isPlaying) {
      state.musicRound = Object.assign({}, state.musicRound, { isPlaying: false });
    }
  }

  function handleMusicTogglePlay() {
    var s = ensureState();
    EM.app.feedback.triggerSelectFeedback();
    if (s.musicRound.isPlaying) {
      stopMusicAudio();
      EM.app.render();
      return;
    }
    stopMusicAudio();
    musicAudioFailed = false;
    if (!musicAudioAvailable()) {
      EM.app.render(); // mostra a linha de texto 'ative o som em Ajustes'
      return;
    }
    var token = ++musicToken;
    var track = s.musicRound.track;
    var handle = null;
    try {
      handle = EM.audio.playNotes(track.melody, {
        bpm: track.bpm,
        onEnd: function () {
          if (token !== musicToken) return;
          musicHandle = null;
          if (musicWatch) { global.clearInterval(musicWatch); musicWatch = null; }
          if (state && state.musicRound.isPlaying) {
            state.musicRound = Object.assign({}, state.musicRound, { isPlaying: false });
            if (EM.app.currentScreen === 'BRAIN_GYM' && state.activeGame === 'MUSIC') EM.app.render();
          }
        },
      });
    } catch (e) {
      handle = null;
    }
    if (!handle) {
      musicAudioFailed = true;
      EM.app.render();
      return;
    }
    musicHandle = handle;
    s.musicRound = musicEngine.togglePlayback(s.musicRound);
    // Se o usuário sair da tela do jogo, o som para.
    musicWatch = global.setInterval(function () {
      if (EM.app.currentScreen !== 'BRAIN_GYM' || !state || state.activeGame !== 'MUSIC') {
        stopMusicAudio();
      }
    }, 400);
    EM.app.render();
  }

  function handleMusicSelectOption(option) {
    var s = ensureState();
    var result = musicEngine.selectOption(s.musicRound, option);
    var previous = s.musicRound;
    s.musicRound = result.nextState;

    if (result.isCorrect) {
      stopMusicAudio();
      if (!previous.isSolved) recordActivityCompletion('music');
    } else {
      EM.app.feedback.triggerGentleNoticeFeedback();
    }

    EM.app.render();
  }

  function handleMusicNextTrack() {
    var s = ensureState();
    stopMusicAudio();
    s.musicRound = musicEngine.createRound(musicEngine.nextTrackIndex(s.musicRound.trackIndex));
    EM.app.render();
  }

  /* --- 6. Pares ---------------------------------------------------------- */
  var pairsTimer = null;

  function clearPairsTimer() {
    if (pairsTimer) {
      global.clearTimeout(pairsTimer);
      pairsTimer = null;
    }
  }

  /** Ao sair do jogo, uma pausa pendente é resolvida de uma vez (as cartas já viraram de volta). */
  function settlePairs() {
    clearPairsTimer();
    if (state) state.pairsRound = pairsEngine.resolveMismatch(state.pairsRound);
  }

  /** Duas cartas diferentes à vista: vira de volta depois de uma pausa calma. */
  function schedulePairsResolve() {
    clearPairsTimer();
    pairsTimer = global.setTimeout(function () {
      pairsTimer = null;
      var s = ensureState();
      var next = pairsEngine.resolveMismatch(s.pairsRound);
      if (next === s.pairsRound) return;
      s.pairsRound = next;
      if (EM.app.currentScreen === 'BRAIN_GYM' && s.activeGame === 'PAIRS') EM.app.render();
    }, pairsEngine.MISMATCH_DELAY_MS);
  }

  function handlePairsFlip(cardId) {
    var s = ensureState();
    var previous = s.pairsRound;
    var result = pairsEngine.flipCard(previous, cardId);
    if (result.nextState === previous) return; // carta já aberta / par já feito: nada muda

    s.pairsRound = result.nextState;
    var card = result.nextState.cards[cardId];
    var number = cardId + 1;
    var found = result.nextState.matchedPairIds.length;

    // Se a virada resolveu uma pausa pendente, o cronômetro antigo perdeu o sentido.
    clearPairsTimer();
    EM.app.feedback.triggerSelectFeedback();

    if (result.outcome === 'first') {
      EM.announce('Carta ' + number + ' virada: ' + card.name + '.');
    } else if (result.outcome === 'match') {
      EM.announce('Par encontrado: ' + card.name + '! ' + found + ' de ' + pairsEngine.PAIR_COUNT + ' pares.');
    } else if (result.outcome === 'mismatch') {
      EM.announce('Carta ' + number + ': ' + card.name + '. Essas duas não combinam. Elas vão virar de volta, sem pressa.');
      schedulePairsResolve();
    }

    if (result.nextState.isComplete && !previous.isComplete) {
      EM.announce('Parabéns! Você encontrou os ' + pairsEngine.PAIR_COUNT + ' pares.');
      recordActivityCompletion('pairs');
    }

    EM.app.render();
  }

  function handlePairsNextRound() {
    var s = ensureState();
    clearPairsTimer();
    s.pairsRound = pairsEngine.createRound(Date.now());
    EM.app.render();
  }

  /* --- 7. Complete o Ditado ---------------------------------------------- */
  function handleProverbsSubmit(option) {
    var s = ensureState();
    var previous = s.proverbsRound;
    var result = proverbsEngine.submitAnswer(previous, option);
    s.proverbsRound = result.nextState;
    if (result.nextState === previous) return;

    if (result.isCorrect) {
      EM.announce('Muito bem! ' + proverbsEngine.fullText(previous.proverb) + ' ' + previous.proverb.meaning);
      recordActivityCompletion('proverbs');
    } else {
      EM.app.feedback.triggerGentleNoticeFeedback();
      EM.announce(PROVERBS_HINT);
    }
    EM.app.render();
  }

  function handleProverbsNext() {
    var s = ensureState();
    s.proverbsRound = proverbsEngine.createRound(proverbsEngine.nextProverbIndex(s.proverbsRound.proverbIndex));
    EM.app.render();
  }

  /* --- 8. Conta do Mercado ----------------------------------------------- */
  function handleMarketSubmit(cents) {
    var s = ensureState();
    var previous = s.marketRound;
    var result = marketEngine.submitAnswer(previous, cents);
    s.marketRound = result.nextState;
    if (result.nextState === previous) return;

    if (result.isCorrect) {
      EM.announce('Muito bem! ' + marketEngine.explanationFor(previous.problem));
      recordActivityCompletion('market');
    } else {
      EM.app.feedback.triggerGentleNoticeFeedback();
      EM.announce(marketEngine.hintFor(previous.problem));
    }
    EM.app.render();
  }

  function handleMarketNext() {
    var s = ensureState();
    s.marketRound = marketEngine.createRound(marketEngine.nextProblemIndex(s.marketRound.problemIndex));
    EM.app.render();
  }

  /* --- 9. Ordem Certa ---------------------------------------------------- */
  function handleOrderPick(stepId) {
    var s = ensureState();
    var previous = s.orderRound;
    var result = orderEngine.pickStep(previous, stepId);
    if (result.nextState === previous) return;
    s.orderRound = result.nextState;

    var step = previous.steps.filter(function (item) { return item.id === stepId; })[0];
    var position = result.nextState.pickedIds.length;

    if (result.outcome === 'wrong') {
      EM.app.feedback.triggerGentleNoticeFeedback();
      EM.announce('Passo ' + position + ': ' + step.text + '. Quase! Vamos tentar de novo. Use Desfazer ou Recomeçar.');
    } else if (result.outcome === 'complete') {
      EM.announce('Passo ' + position + ': ' + step.text + '. Ordem perfeita! Você organizou todos os passos.');
      recordActivityCompletion('order');
    } else {
      EM.app.feedback.triggerSelectFeedback();
      EM.announce('Passo ' + position + ': ' + step.text + '.');
    }
    EM.app.render();
  }

  function handleOrderUndo() {
    var s = ensureState();
    var next = orderEngine.undoLastPick(s.orderRound);
    if (next === s.orderRound) return;
    s.orderRound = next;
    EM.app.feedback.triggerSelectFeedback();
    EM.announce('Último passo desfeito. ' + next.pickedIds.length + ' de ' + orderEngine.STEP_COUNT + ' passos escolhidos.');
    EM.app.render();
  }

  function handleOrderRestart() {
    var s = ensureState();
    var next = orderEngine.restart(s.orderRound);
    if (next === s.orderRound) return;
    s.orderRound = next;
    EM.app.feedback.triggerSelectFeedback();
    EM.announce('Recomeçando. Escolha o primeiro passo.');
    EM.app.render();
  }

  function handleOrderNext() {
    var s = ensureState();
    s.orderRound = orderEngine.createRound(orderEngine.nextRoutineIndex(s.orderRound.routineIndex));
    EM.app.render();
  }

  function handleSetActiveGame(gameId) {
    var s = ensureState();
    stopMusicAudio();
    settlePairs();
    s.activeGame = gameId;
    EM.app.render();
  }

  /**
   * Abre um jogo específico (usado pela Tríade: `navigate('BRAIN_GYM', {game})`).
   * Se a rodada anterior daquele jogo já foi concluída, começa uma rodada nova
   * para que o usuário jogue de verdade (a conclusão só vale pela atividade).
   * Não renderiza: o `navigate` do app redesenha em seguida.
   */
  function openGame(gameId) {
    var s = ensureState();
    if (GAME_IDS.indexOf(gameId) < 0) return;
    if (gameId === 'MEMORY' && s.memoryRound.isRoundComplete) s.memoryRound = memoryEngine.createRound(Date.now());
    if (gameId === 'SEQUENCE' && s.sequenceRound.isSolved) {
      s.sequenceRound = sequenceEngine.createRound(Math.floor(Math.random() * 5));
    }
    if (gameId === 'WORDS' && s.wordsRound.isComplete) {
      s.wordsRound = wordsEngine.createRound(wordsEngine.nextChallengeIndex(s.wordsRound.challengeIndex));
    }
    if (gameId === 'ATTENTION' && s.attentionRound.isSolved) {
      s.attentionRound = attentionEngine.createRound(Math.floor(Math.random() * 3));
    }
    stopMusicAudio();
    settlePairs();
    if (gameId === 'MUSIC' && s.musicRound.isSolved) {
      s.musicRound = musicEngine.createRound(musicEngine.nextTrackIndex(s.musicRound.trackIndex));
    }
    if (gameId === 'PAIRS' && s.pairsRound.isComplete) s.pairsRound = pairsEngine.createRound(Date.now());
    if (gameId === 'PROVERBS' && s.proverbsRound.isSolved) {
      s.proverbsRound = proverbsEngine.createRound(proverbsEngine.nextProverbIndex(s.proverbsRound.proverbIndex));
    }
    if (gameId === 'MARKET' && s.marketRound.isSolved) {
      s.marketRound = marketEngine.createRound(marketEngine.nextProblemIndex(s.marketRound.problemIndex));
    }
    if (gameId === 'ORDER' && s.orderRound.isComplete) {
      s.orderRound = orderEngine.createRound(orderEngine.nextRoutineIndex(s.orderRound.routineIndex));
    }
    s.activeGame = gameId;
  }

  /* =========================================================================
     COMPONENTES DE JOGO
     ======================================================================= */

  /** Cabeçalho comum dos cartões de jogo. */
  function gameCardHeader(emoji, title, badgeLabel) {
    return row(
      { class: 'items-center justify-between mb-4 game-card-header' },
      row(
        { class: 'items-center flex-1 game-card-title' },
        C.Text({ variant: 'body', className: 't-2xl mr-2' }, emoji),
        C.Text({ variant: 'title-md', className: 't-fg' }, title)
      ),
      C.Badge({ variant: 'outline', label: badgeLabel })
    );
  }

  /** Dica carinhosa (neutra, sem cor de alerta): usada ao tocar numa opção que não serve. */
  function softHint(message, title) {
    return view(
      { class: 'p-4 b-surface border br-strong rounded-2xl mb-4 soft-hint' },
      C.Text(
        { variant: 'caption', className: 'font-mono t-xs t-fg uppercase mb-1' },
        title || '💡 DICA CARINHOSA:'
      ),
      C.Text({ variant: 'body', className: 't-sm t-muted' }, message)
    );
  }

  /** Opção de múltipla escolha (Ditado e Mercado): uma por linha, alvo >= 64 px.
      Desativar não usa `disabled` nativo: o foco do teclado se mantém. */
  function choiceTile(opts) {
    var isSoftDisabled = opts.isWrong || opts.isSolved;
    var style = 'b-surface br-subtle';
    if (opts.isCorrectPicked) style = 'b-subtle br-fg';
    if (opts.isWrong) style = 'b-card br-hairline op-40';
    return h(
      'button',
      {
        type: 'button',
        class: EM.dom.cls(['tile', 'min-h-64', 'p-4', style]),
        'aria-disabled': isSoftDisabled ? 'true' : null,
        'data-focus-key': opts.focusKey,
        onClick: opts.onPress,
      },
      C.Text({ variant: 'body', className: opts.textClass }, opts.label)
    );
  }

  /* ---- 1. MemoryGameView.tsx ------------------------------------------- */
  function renderMemoryGame() {
    var s = ensureState();
    var round = s.memoryRound;
    var isMemorizationPhase = round.isMemorizationPhase;

    var body;

    if (isMemorizationPhase) {
      body = view(
        {},
        C.Text(
          { variant: 'body', className: 't-muted mb-4' },
          'Olhe com calma para as 5 figuras abaixo e guarde-as na memória:'
        ),
        view(
          { class: 'grid-2 mb-6' },
          round.targetItems.map(function (item) {
            return C.Card(
              { className: 'w-48pct b-surface border-2 br-strong rounded-2xl p-4 items-center mb-3' },
              C.Text({ variant: 'body', className: 'tile-emoji t-center' }, item.emoji),
              C.Text(
                { variant: 'body', className: 'fw-semibold t-center' },
                item.name
              )
            );
          })
        ),
        C.Button({
          variant: 'default',
          size: 'lg',
          fullWidth: true,
          onPress: handleMemoryStartSelection,
          label: '✓ ESTOU PRONTO!',
        })
      );
    } else {
      var tileBodies = round.displayGrid.map(function (item) {
        var isSelected = round.selectedItemIds.indexOf(item.id) >= 0;
        var isTarget = round.targetItems.some(function (target) {
          return target.id === item.id;
        });

        // Resolução de estilo MUTUAMENTE EXCLUSIVA, na mesma ordem do original.
        var borderStyle;
        if (isSelected && isTarget) borderStyle = 'br-fg b-subtle';
        else if (isSelected && !isTarget) borderStyle = 'br-soft b-surface op-70';
        else borderStyle = 'br-subtle b-card';

        return h(
          'button',
          {
            type: 'button',
            class: EM.dom.cls(['tile', borderStyle]),
            'aria-pressed': isSelected ? 'true' : 'false',
            onClick: function () {
              handleMemoryToggleItem(item.id);
            },
          },
          C.Text({ variant: 'body', className: 'tile-emoji' }, item.emoji),
          C.Text({ variant: 'body', className: 'fw-semibold t-center' }, item.name),
          isSelected
            ? C.Text(
                { variant: 'caption', className: 't-xs font-mono mt-1 t-fg' },
                isTarget ? '✓ ACERTOU' : '• OUTRO'
              )
            : null
        );
      });

      body = view(
        {},
        C.Text(
          { variant: 'body', className: 't-muted mb-4' },
          'Selecione as 5 figuras que você memorizou anteriormente:'
        ),
        row(
          { class: 'items-center justify-between mb-4 px-2' },
          C.Text({ variant: 'caption' }, 'Figuras encontradas:'),
          C.Badge({
            variant: round.isRoundComplete ? 'success' : 'secondary',
            label: round.correctCount + ' / 5 CORRETAS',
          })
        ),
        view({ class: 'grid-2 mb-4' }, tileBodies),
        round.isRoundComplete
          ? view(
              { class: 'mt-2' },
              C.Celebration(
                '🌟 Excelente Memória!',
                'Você encontrou todas as 5 figuras com sucesso.'
              ),
              C.Button({
                variant: 'default',
                size: 'lg',
                fullWidth: true,
                onPress: handleMemoryNextRound,
                label: 'JOGAR OUTRA RODADA',
              })
            )
          : null
      );
    }

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('🖼️', 'Memória Visual', '5 FIGURAS'),
      body
    );
  }

  /* ---- 2. SequenceGameView.tsx ----------------------------------------- */
  function renderSequenceGame() {
    var s = ensureState();
    var round = s.sequenceRound;
    var puzzle = round.puzzle;

    var boxes = puzzle.sequence.map(function (item, index) {
      var isTargetBox = item === '?';
      var boxBg = isTargetBox
        ? round.isSolved
          ? 'b-subtle br-fg'
          : 'b-surface br-soft'
        : 'b-card br-subtle';

      var value = isTargetBox && round.isSolved ? puzzle.correctAnswer : item;

      return h(
        'div',
        { class: EM.dom.cls(['sequence-box', boxBg]) },
        h('span', { class: 'sequence-box-value' }, String(value))
      );
    });

    var optionTiles = puzzle.options.map(function (option) {
      var isDisabled = round.disabledOptions.indexOf(option) >= 0 || round.isSolved;
      var isCorrectPicked = round.isSolved && option === puzzle.correctAnswer;

      var btnBg = 'b-surface br-subtle';
      if (isCorrectPicked) btnBg = 'b-subtle br-fg';
      if (round.disabledOptions.indexOf(option) >= 0) btnBg = 'b-card br-hairline op-40';

      return h(
        'button',
        {
          type: 'button',
          class: EM.dom.cls(['tile', 'min-h-58', btnBg]),
          disabled: isDisabled,
          'aria-label': 'Opção número ' + option,
          onClick: function () {
            handleSequenceSubmit(option);
          },
        },
        C.Text({ variant: 'body', className: 'font-mono fw-bold t-2xl t-fg' }, String(option))
      );
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('🔢', 'Sequência Lógica', 'NÚMEROS'),
      C.Text(
        { variant: 'body', className: 't-muted mb-4' },
        'Descubra qual número completa o padrão lógico com calma:'
      ),
      view({ class: 'sequence-strip' }, boxes),
      C.Text({ variant: 'caption', className: 'mb-2 t-center' }, 'Escolha uma alternativa:'),
      view({ class: 'grid-2 mb-4' }, optionTiles),

      /* Dica carinhosa — só aparece depois de um erro */
      round.showHint && !round.isSolved
        ? view(
            { class: 'p-4 b-surface border br-strong rounded-2xl mb-4' },
            C.Text(
              { variant: 'caption', className: 'font-mono t-xs t-fg uppercase mb-1' },
              '💡 DICA CARINHOSA:'
            ),
            C.Text({ variant: 'body', className: 't-sm t-muted' }, puzzle.hint)
          )
        : null,

      round.isSolved
        ? view(
            { class: 'mt-2' },
            C.Celebration(
              '✨ Raciocínio Perfeito!',
              puzzle.ruleDescription + ': a resposta certa é ' + puzzle.correctAnswer + '.'
            ),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleSequenceNextPuzzle,
              label: 'PRÓXIMO DESAFIO',
            })
          )
        : null
    );
  }

  /* ---- 3. WordsGameView.tsx -------------------------------------------- */
  /* Controle desativado SEM `disabled` nativo: continua focável (o foco do
     teclado/leitor de tela não se perde quando a opção "apaga") e o toque é
     ignorado pelo CSS (`.tile[aria-disabled='true']`) e pelo motor. O visual
     (cor sólida + borda tracejada) vem das classes `op-*`. */
  function renderWordsGame() {
    var s = ensureState();
    var round = s.wordsRound;
    var challenge = round.challenge;
    var foundWords = round.foundWords;
    var wrongWords = round.wrongWords || [];

    var optionTiles = round.optionsPool.map(function (word) {
      var isChosen = foundWords.indexOf(word) >= 0;
      var isWrong = wrongWords.indexOf(word) >= 0;
      var isSoftDisabled = isChosen || isWrong || round.isComplete;

      // Acertada: preenchida e com borda branca sólida. Descartada: tracejada e apagada.
      var btnBg = 'b-surface br-subtle';
      if (isChosen) btnBg = 'b-subtle br-fg';
      if (isWrong) btnBg = 'b-card br-hairline op-40';

      return h(
        'button',
        {
          type: 'button',
          class: EM.dom.cls(['tile', 'min-h-54', btnBg]),
          'aria-disabled': isSoftDisabled ? 'true' : null,
          'data-focus-key': 'word-' + word,
          onClick: function () {
            handleWordsSelect(word);
          },
        },
        C.Text({ variant: 'body', className: 't-lg fw-semibold t-fg' }, word)
      );
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('🔤', 'Formação de Palavras', 'LETRA ' + challenge.letter),

      view(
        { class: 'p-4 b-surface border br-subtle rounded-2xl mb-4' },
        C.Text(
          { variant: 'caption', className: 'font-mono t-xs t-muted uppercase mb-1' },
          'O QUE FAZER:'
        ),
        C.Text({ variant: 'body-lead', className: 'fw-bold t-fg mb-1' }, challenge.instruction + '.'),
        C.Text(
          { variant: 'body', className: 't-sm t-muted' },
          challenge.themeDescription + ' Algumas palavras não servem: se tocar em uma, é só tentar outra.'
        )
      ),

      row(
        { class: 'items-center justify-between mb-3 px-2' },
        C.Text({ variant: 'caption' }, 'Palavras encontradas:'),
        C.Badge({
          variant: round.isComplete ? 'success' : 'secondary',
          label: foundWords.length + ' / ' + challenge.targetCount,
        })
      ),

      view(
        { class: 'mb-4' },
        view(
          { class: 'row flex-wrap gap-2' },
          foundWords.map(function (word) {
            return h(
              'span',
              { class: 'b-subtle border br-fg px-4 py-2 rounded-full' },
              C.Text({ variant: 'body', className: 'fw-bold t-fg' }, '✓ ' + word)
            );
          })
        )
      ),

      C.Text(
        { variant: 'caption', className: 'mb-2 t-center' },
        'Toque nas palavras que servem:'
      ),
      view({ class: 'words-grid mb-4' }, optionTiles),

      /* Dica carinhosa — composta a partir da última palavra que não serve */
      round.lastWrongWord && !round.isComplete
        ? softHint(wordsEngine.hintFor(challenge, round.lastWrongWord))
        : null,

      round.isComplete
        ? view(
            { class: 'mt-2' },
            C.Celebration(
              '🎉 Vocabulário Brilhante!',
              'Você encontrou as ' +
                challenge.targetCount +
                ' palavras com a letra ' +
                challenge.letter +
                ': ' +
                foundWords.join(', ') +
                '.'
            ),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleWordsNextChallenge,
              label: 'PRÓXIMO TEMA',
            })
          )
        : null
    );
  }

  /* ---- 4. AttentionGameView.tsx ---------------------------------------- */
  function renderAttentionGame() {
    var s = ensureState();
    var round = s.attentionRound;
    var puzzle = round.puzzle;

    var itemTiles = puzzle.items.map(function (item) {
      var isDisabled = round.disabledItemIds.indexOf(item.id) >= 0 || round.isSolved;

      var cardStyle = 'b-surface br-subtle';
      if (round.isSolved && item.isDivergent) cardStyle = 'b-subtle br-fg';
      else if (round.disabledItemIds.indexOf(item.id) >= 0) cardStyle = 'b-card br-hairline op-40';

      return h(
        'button',
        {
          type: 'button',
          class: EM.dom.cls(['tile', 'min-h-90', 'p-4', cardStyle]),
          disabled: isDisabled,
          onClick: function () {
            handleAttentionSelect(item.id);
          },
        },
        C.Text({ variant: 'body', className: 'tile-emoji-lg' }, item.emoji),
        C.Text({ variant: 'caption', className: 't-center fw-medium' }, item.label)
      );
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('👁️', 'Atenção & Diferenças', 'DISCRIMINAÇÃO'),
      C.Text({ variant: 'body-lead', className: 't-fg fw-medium mb-4' }, puzzle.instruction),
      view({ class: 'grid-2 mb-4' }, itemTiles),
      round.isSolved
        ? view(
            { class: 'mt-2' },
            C.Celebration('🎯 Olhar Atento!', puzzle.explanation),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleAttentionNextPuzzle,
              label: 'PRÓXIMO DESAFIO',
            })
          )
        : null
    );
  }

  /* ---- 5. MusicGameView.tsx -------------------------------------------- */
  function renderMusicGame() {
    var s = ensureState();
    var round = s.musicRound;
    var track = round.track;
    var isPlaying = round.isPlaying;

    var optionTiles = track.options.map(function (option) {
      var isDisabled = round.disabledOptions.indexOf(option) >= 0 || round.isSolved;
      var isCorrect = round.isSolved && option === track.correctTitle;

      var btnBg = 'b-surface br-subtle';
      if (isCorrect) btnBg = 'b-subtle br-fg';
      if (round.disabledOptions.indexOf(option) >= 0) btnBg = 'b-card br-hairline op-40';

      return h(
        'button',
        {
          type: 'button',
          class: EM.dom.cls(['tile', 'min-h-58', 'p-4', btnBg]),
          disabled: isDisabled,
          'aria-label': 'Canção ' + option,
          onClick: function () {
            handleMusicSelectOption(option);
          },
        },
        C.Text({ variant: 'body', className: 't-xl fw-bold t-fg' }, option)
      );
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('🎵', 'Memória Musical', track.genre),
      C.Text(
        { variant: 'body', className: 't-muted mb-4' },
        'Ouça o trecho melódico e recorde o nome da canção inesquecível:'
      ),

      view(
        { class: 'p-5 b-surface border-2 br-subtle rounded-2xl items-center mb-6' },
        (function () {
          var e = C.Text({ variant: 'body', className: 't-4xl mb-3' }, isPlaying ? '📻 🎶 🎵' : '📻');
          e.setAttribute('aria-hidden', 'true');
          return e;
        })(),
        C.Text(
          {
            variant: 'body-lead',
            className: 't-center fw-medium italic t-fg mb-4',
          },
          track.soundSnippetDescription
        ),
        (function () {
          var btn = C.Button({
            variant: isPlaying ? 'secondary' : 'default',
            size: 'default',
            onPress: handleMusicTogglePlay,
            label: isPlaying ? '⏹️ PARAR' : '▶️ OUVIR',
          });
          btn.setAttribute('data-focus-key', 'music-toggle');
          btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
          return btn;
        })(),
        musicAudioAvailable()
          ? null
          : (function () {
              var note = C.Text(
                { variant: 'caption', className: 'music-sound-note t-muted mt-3' },
                'Se o som estiver desligado, ative-o em Ajustes'
              );
              note.setAttribute('role', 'status');
              return note;
            })()
      ),

      round.disabledOptions.length > 0 && !round.isSolved
        ? C.Text(
            { variant: 'caption', className: 't-center t-muted mb-2' },
            'Quase! Ouça de novo, sem pressa, e escolha outra opção.'
          )
        : null,

      C.Text({ variant: 'caption', className: 'mb-2 t-center' }, 'Qual é o nome desta canção?'),
      view({ class: 'stack-options mb-4' }, optionTiles),

      round.isSolved
        ? view(
            { class: 'mt-2' },
            view(
              { class: 'p-4 b-surface border br-strong rounded-2xl mb-4' },
              C.Text(
                { variant: 'title-md', className: 't-center mb-1' },
                '🎶 Memória Musical Afetuosa!'
              ),
              C.Text(
                { variant: 'body', className: 't-muted t-center mb-2' },
                'Você acertou: ',
                C.Text({ variant: 'body', className: 'fw-bold t-fg' }, track.title),
                ' (' + track.composer + ').'
              ),
              C.Text(
                { variant: 'caption', className: 't-muted t-center italic t-xs' },
                track.culturalNote
              )
            ),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleMusicNextTrack,
              label: 'PRÓXIMA CANÇÃO',
            })
          )
        : null
    );
  }

  /* =========================================================================
     JOGOS NOVOS (não existem no app original)
     ======================================================================= */

  /* ---- 6. Pares --------------------------------------------------------- */
  function pairsCardLabel(round, card) {
    var number = card.id + 1;
    var status = pairsEngine.cardStatus(round, card.id);
    if (status === 'hidden') return 'Carta ' + number + ': escondida';
    if (status === 'up') return 'Carta ' + number + ': virada, ' + card.emoji;
    return 'Carta ' + number + ': par encontrado, ' + card.emoji;
  }

  function renderPairsGame() {
    var s = ensureState();
    var round = s.pairsRound;
    var found = round.matchedPairIds.length;

    var cardNodes = round.cards.map(function (card) {
      var status = pairsEngine.cardStatus(round, card.id);
      var style = 'b-card br-subtle';
      if (status === 'up') style = 'b-surface br-fg';
      if (status === 'matched') style = 'b-subtle br-strong';
      // Só a carta recém-virada anima (e só sem prefers-reduced-motion).
      var isFresh = status !== 'hidden' && round.lastFlippedId === card.id;

      return h(
        'button',
        {
          type: 'button',
          class: EM.dom.cls(['tile', 'pair-card', style, status === 'hidden' ? 'pair-hidden' : null, status === 'matched' ? 'pair-matched' : null, isFresh ? 'pair-fresh' : null]),
          'aria-label': pairsCardLabel(round, card),
          'aria-disabled': status === 'matched' ? 'true' : null,
          'data-focus-key': 'pair-' + card.id,
          onClick: function () {
            handlePairsFlip(card.id);
          },
        },
        status === 'hidden'
          ? h('span', { class: 'pair-number' }, String(card.id + 1))
          : h('span', { class: 'pair-face' }, card.emoji)
      );
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('🃏', 'Pares', pairsEngine.PAIR_COUNT + ' PARES'),
      C.Text(
        { variant: 'body', className: 't-muted mb-4' },
        'Vire duas cartas por vez e encontre os pares iguais. Sem pressa!'
      ),
      row(
        { class: 'items-center justify-between flex-wrap gap-2 mb-4 px-2 pairs-stats' },
        C.Text(
          { variant: 'body', className: 'fw-bold t-fg' },
          'Pares encontrados: ' + found + ' / ' + pairsEngine.PAIR_COUNT
        ),
        C.Text({ variant: 'caption' }, 'Tentativas: ' + round.attempts)
      ),
      view({ class: 'pairs-grid mb-4' }, cardNodes),

      round.pendingMismatch
        ? C.Text(
            { variant: 'caption', className: 't-center t-muted mb-2' },
            'Essas duas não combinam. Elas vão virar de volta, sem pressa.'
          )
        : null,

      round.isComplete
        ? view(
            { class: 'mt-2' },
            C.Celebration(
              '🌟 Todos os Pares!',
              'Você encontrou os ' + pairsEngine.PAIR_COUNT + ' pares. Parabéns!'
            ),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handlePairsNextRound,
              label: 'JOGAR OUTRA RODADA',
            })
          )
        : null
    );
  }

  /* ---- 7. Complete o Ditado --------------------------------------------- */
  function renderProverbsGame() {
    var s = ensureState();
    var round = s.proverbsRound;
    var proverb = round.proverb;

    // O ditado com a lacuna; resolvido, a palavra certa aparece no lugar.
    var sentence = C.Text(
      { variant: 'body-lead', className: 'fw-bold t-fg proverb-text' },
      proverb.start + ' ',
      round.isSolved
        ? h('span', { class: 'proverb-answer' }, proverb.answer)
        : [
            h('span', { class: 'sr-only' }, 'lacuna'),
            h('span', { class: 'proverb-blank', 'aria-hidden': 'true' }, '______'),
          ],
      proverb.end
    );

    var optionTiles = round.options.map(function (option) {
      var isWrong = round.disabledOptions.indexOf(option) >= 0;
      return choiceTile({
        label: option,
        textClass: 't-xl fw-bold t-fg',
        isWrong: isWrong,
        isSolved: round.isSolved,
        isCorrectPicked: round.isSolved && option === proverb.answer,
        focusKey: 'proverb-' + option,
        onPress: function () {
          handleProverbsSubmit(option);
        },
      });
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('📜', 'Complete o Ditado', 'DITADOS'),
      C.Text(
        { variant: 'body', className: 't-muted mb-4' },
        'Escolha a palavra que completa este ditado popular:'
      ),
      view({ class: 'p-4 b-surface border-2 br-subtle rounded-2xl mb-4 proverb-box' }, sentence),
      C.Text({ variant: 'caption', className: 'mb-2 t-center' }, 'Qual palavra completa o ditado?'),
      view({ class: 'stack-options mb-4' }, optionTiles),

      round.showHint && !round.isSolved ? softHint(PROVERBS_HINT) : null,

      round.isSolved
        ? view(
            { class: 'mt-2' },
            view(
              { class: 'p-4 b-surface border br-strong rounded-2xl mb-4' },
              C.Text({ variant: 'title-md', className: 't-center mb-2' }, '📜 Muito bem!'),
              C.Text(
                { variant: 'body-lead', className: 'fw-bold t-fg t-center mb-2' },
                '“' + proverbsEngine.fullText(proverb) + '”'
              ),
              C.Text({ variant: 'body', className: 't-muted t-center' }, 'Significa: ' + proverb.meaning)
            ),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleProverbsNext,
              label: 'PRÓXIMO DITADO',
            })
          )
        : null
    );
  }

  /* ---- 8. Conta do Mercado ---------------------------------------------- */
  function renderMarketGame() {
    var s = ensureState();
    var round = s.marketRound;
    var problem = round.problem;

    var optionTiles = round.options.map(function (cents) {
      return choiceTile({
        label: marketEngine.formatBRL(cents),
        textClass: 'font-mono fw-bold t-xl t-fg',
        isWrong: round.disabledOptions.indexOf(cents) >= 0,
        isSolved: round.isSolved,
        isCorrectPicked: round.isSolved && cents === problem.correctCents,
        focusKey: 'market-' + cents,
        onPress: function () {
          handleMarketSubmit(cents);
        },
      });
    });

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('🛒', 'Conta do Mercado', 'DINHEIRO'),
      C.Text(
        { variant: 'body', className: 't-muted mb-4' },
        'Faça a conta com calma e escolha a resposta certa:'
      ),
      view(
        { class: 'p-4 b-surface border-2 br-subtle rounded-2xl mb-4' },
        C.Text({ variant: 'body-lead', className: 'fw-bold t-fg' }, marketEngine.promptFor(problem))
      ),
      C.Text({ variant: 'caption', className: 'mb-2 t-center' }, 'Quanto dá?'),
      view({ class: 'stack-options mb-4' }, optionTiles),

      round.showHint && !round.isSolved ? softHint(marketEngine.hintFor(problem)) : null,

      round.isSolved
        ? view(
            { class: 'mt-2' },
            C.Celebration('🛒 Conta Certa!', marketEngine.explanationFor(problem)),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleMarketNext,
              label: 'PRÓXIMA CONTA',
            })
          )
        : null
    );
  }

  /* ---- 9. Ordem Certa --------------------------------------------------- */
  /* Botão de ação que "apaga" sem `disabled` nativo (mantém o foco do teclado). */
  function softButton(props, isSoftDisabled, focusKey) {
    var btn = C.Button(props);
    if (isSoftDisabled) btn.setAttribute('aria-disabled', 'true');
    if (focusKey) btn.setAttribute('data-focus-key', focusKey);
    return btn;
  }

  function renderOrderGame() {
    var s = ensureState();
    var round = s.orderRound;
    var picked = round.pickedIds;

    var stepButtons = round.steps.map(function (step) {
      var position = picked.indexOf(step.id);
      var isPicked = position >= 0;
      var style = isPicked ? 'b-subtle br-fg' : 'b-surface br-subtle';
      if (round.status === 'wrong' && isPicked) style = 'b-card br-hairline op-40';

      return h(
        'button',
        {
          type: 'button',
          class: EM.dom.cls(['tile', 'order-step', style]),
          'aria-disabled': isPicked || round.isComplete || round.status === 'wrong' ? 'true' : null,
          'data-focus-key': 'order-step-' + step.id,
          onClick: function () {
            handleOrderPick(step.id);
          },
        },
        h('span', { class: EM.dom.cls(['order-num', isPicked ? 'order-num-on' : null]) }, isPicked ? String(position + 1) : ''),
        h('span', { class: 'order-text' }, step.text)
      );
    });

    var canEdit = picked.length > 0 && !round.isComplete;

    return C.Card(
      { className: 'p-5 b-card border-2 br-subtle' },
      gameCardHeader('📋', 'Ordem Certa', orderEngine.STEP_COUNT + ' PASSOS'),
      C.Text(
        { variant: 'body-lead', className: 't-fg fw-medium mb-2' },
        'Toque nos passos de ' + round.routine.title + ', na ordem em que acontecem: do primeiro ao último.'
      ),
      C.Text(
        { variant: 'caption', className: 'mb-4 t-muted' },
        'Passos escolhidos: ' + picked.length + ' / ' + orderEngine.STEP_COUNT
      ),
      view({ class: 'order-list mb-4' }, stepButtons),

      round.isComplete
        ? null
        : row(
            { class: 'order-actions mb-4' },
            softButton(
              {
                variant: 'outline',
                size: 'sm',
                onPress: handleOrderUndo,
                label: '↩ DESFAZER',
                className: 'order-action',
              },
              !canEdit,
              'order-undo'
            ),
            softButton(
              {
                variant: 'outline',
                size: 'sm',
                onPress: handleOrderRestart,
                label: 'RECOMEÇAR',
                className: 'order-action',
              },
              !canEdit,
              'order-restart'
            )
          ),

      round.status === 'wrong'
        ? softHint(
            'Toque em RECOMEÇAR para escolher a ordem outra vez, ou em DESFAZER para trocar só o último passo.',
            'Quase! Vamos tentar de novo.'
          )
        : null,

      round.isComplete
        ? view(
            { class: 'mt-2' },
            C.Celebration(
              '🎉 Ordem Perfeita!',
              'Você organizou os ' + orderEngine.STEP_COUNT + ' passos de ' + round.routine.title + '.'
            ),
            C.Button({
              variant: 'default',
              size: 'lg',
              fullWidth: true,
              onPress: handleOrderNext,
              label: 'PRÓXIMA ROTINA',
            })
          )
        : null
    );
  }

  /* =========================================================================
     BrainGymScreenView.tsx — menu de modalidades
     ======================================================================= */
  var GAME_MENU_ITEMS = [
    {
      id: 'MEMORY',
      title: '1. Memória Visual',
      subtitle: 'Guarde 5 figuras acolhedoras e reencontre-as na grade.',
      emoji: '🖼️',
      tag: 'MEMÓRIA',
    },
    {
      id: 'SEQUENCE',
      title: '2. Sequência Lógica',
      subtitle: 'Descubra qual número completa a progressão matemática.',
      emoji: '🔢',
      tag: 'RACIOCÍNIO',
    },
    {
      id: 'WORDS',
      title: '3. Formação de Palavras',
      subtitle: 'Descubra palavras ricas do vocabulário com a letra sorteada.',
      emoji: '🔤',
      tag: 'LINGUAGEM',
    },
    {
      id: 'ATTENTION',
      title: '4. Atenção & Diferenças',
      subtitle: 'Encontre o item divergente no conjunto visual.',
      emoji: '👁️',
      tag: 'ATENÇÃO',
    },
    {
      id: 'MUSIC',
      title: '5. Memória Musical',
      subtitle: 'Ouça trechos de canções clássicas inesquecíveis da MPB.',
      emoji: '🎵',
      tag: 'AUDITIVO',
    },
    {
      id: 'PAIRS',
      title: '6. Pares',
      subtitle: 'Vire as cartas e encontre os 6 pares de figuras iguais.',
      emoji: '🃏',
      tag: 'MENTE · MEMÓRIA',
    },
    {
      id: 'PROVERBS',
      title: '7. Complete o Ditado',
      subtitle: 'Lembre a palavra que completa os ditados populares brasileiros.',
      emoji: '📜',
      tag: 'MENTE · CULTURA',
    },
    {
      id: 'MARKET',
      title: '8. Conta do Mercado',
      subtitle: 'Some, calcule o troco e dobre preços com dinheiro de verdade.',
      emoji: '🛒',
      tag: 'MENTE · CÁLCULO',
    },
    {
      id: 'ORDER',
      title: '9. Ordem Certa',
      subtitle: 'Coloque em ordem os 4 passos de uma tarefa do dia a dia.',
      emoji: '📋',
      tag: 'MENTE · PLANEJAMENTO',
    },
  ];

  function renderMenu() {
    return view(
      {},
      C.Text(
        { variant: 'body-lead', className: 'fw-bold t-fg mb-4' },
        'Escolha uma modalidade para exercitar com calma:'
      ),
      GAME_MENU_ITEMS.map(function (item) {
        return C.Card(
          { className: 'mb-4 b-card border-2 br-subtle p-5 game-menu-card' },
          row(
            { class: 'items-center justify-between mb-2' },
            row(
              { class: 'items-center' },
              C.Text({ variant: 'body', className: 't-3xl mr-3' }, item.emoji),
              view(
                {},
                C.Text(
                  { variant: 'caption', className: 'font-mono fw-bold uppercase t-muted' },
                  item.tag
                ),
                C.Text(
                  { variant: 'title-md', className: 't-xl fw-bold t-fg' },
                  item.title
                )
              )
            )
          ),
          C.Text({ variant: 'body', className: 't-sm t-muted mb-4' }, item.subtitle),
          C.Button({
            variant: 'default',
            size: 'lg',
            fullWidth: true,
            // WCAG 2.5.3: o nome acessível começa com o texto visível.
            accessibilityLabel: 'JOGAR AGORA: ' + item.title,
            onPress: function () {
              handleSetActiveGame(item.id);
            },
            label: 'JOGAR AGORA',
          })
        );
      })
    );
  }

  /* =========================================================================
     RENDER
     ======================================================================= */
  function render() {
    var s = ensureState();
    var app = EM.app;
    var isMenu = s.activeGame === 'MENU';

    var gameView = null;
    if (!isMenu) {
      if (s.activeGame === 'MEMORY') gameView = renderMemoryGame();
      else if (s.activeGame === 'SEQUENCE') gameView = renderSequenceGame();
      else if (s.activeGame === 'WORDS') gameView = renderWordsGame();
      else if (s.activeGame === 'ATTENTION') gameView = renderAttentionGame();
      else if (s.activeGame === 'MUSIC') gameView = renderMusicGame();
      else if (s.activeGame === 'PAIRS') gameView = renderPairsGame();
      else if (s.activeGame === 'PROVERBS') gameView = renderProverbsGame();
      else if (s.activeGame === 'MARKET') gameView = renderMarketGame();
      else if (s.activeGame === 'ORDER') gameView = renderOrderGame();
    }

    return view(
      {},
      /* Cabeçalho: alterna entre 🏠 INÍCIO e ← MENU */
      view(
        { class: 'page-header brain-gym-header' },
        view(
          { class: 'flex-1' },
          C.Text(
            { variant: 'title-lg', className: 't-fg fw-extrabold', as: 'h1' },
            'Ginástica Cerebral'
          ),
          C.Text(
            { variant: 'caption', className: 't-muted' },
            'Pilar Mente & Estimulação Cognitiva'
          )
        ),
        !isMenu
          ? C.Button({
              variant: 'outline',
              size: 'sm',
              onPress: function () {
                handleSetActiveGame('MENU');
              },
              label: '← MENU',
            })
          : C.Button({
              variant: 'outline',
              size: 'sm',
              onPress: function () {
                app.navigate('HOME');
              },
              label: '🏠 INÍCIO',
            })
      ),

      /* Banner de estatísticas */
      C.StatsBanner({
        icon: '🧠',
        eyebrow: 'ATIVIDADES CONCLUÍDAS',
        value:
          s.completedGamesCount +
          (s.completedGamesCount === 1 ? ' sessão' : ' sessões') +
          ' de ginástica mental',
        badge: '+10 PONTOS / JOGO',
      }),

      isMenu ? renderMenu() : gameView
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.brainGym = {
    render: render,
    GAME_MENU_ITEMS: GAME_MENU_ITEMS,
    // expostos para inspeção/testes
    openGame: openGame,
    _getState: function () {
      return ensureState();
    },
  };
})(window);
