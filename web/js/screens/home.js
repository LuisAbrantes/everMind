/* ============================================================================
   everMind Web — js/screens/home.js
   Tela 1 — "Hoje" / Bom Dia.

   Portagem 1:1 de `src/screens/HomeScreen/`:
     index.tsx                    → EM.screens.home.render()
     useHomeScreen.ts             → estado + openChallenge() (só navega)
     HomeScreenView.tsx           → estrutura visual
     components/GentleStreakCard.tsx
     components/VirtualBrainWidget.tsx
     components/DailyChallengeCard.tsx
     components/SurpriseDiscoveryButton.tsx

   Auditoria 2026-10 (ADR-0009): sem perfil de demonstração; o toque num card
   da Tríade apenas NAVEGA; a conclusão vem da atividade real
   (`progress.triadCompletions[data]`), nunca é desfeita e nunca decrementa.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var h = EM.dom.h;
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var brainEngine = EM.domain.brainEvolutionEngine;
  var streakManager = EM.domain.gentleStreakManager;
  var triadCoordinator = EM.domain.dailyTriadCoordinator;

  /* Meta de cada pilar — exibida no cabeçalho do cartão de desafio.
     `tag` existe no original mas nunca é renderizado; mantido por fidelidade. */
  var PILLAR_META = {
    MIND: { emoji: '🧠', name: 'Mente', tag: 'COG' },
    MOVEMENT: { emoji: '🚶', name: 'Movimento', tag: 'CORPO' },
    SELFCARE: { emoji: '💧', name: 'Autocuidado', tag: 'SAÚDE' },
    CONNECTION: { emoji: '❤️', name: 'Conexão', tag: 'AFETO' },
  };
  var PILLAR_FALLBACK = { emoji: '🌟', name: 'Desafio', tag: 'HÁBITO' };

  /* ------------------------------------------------------------------------
     components/GentleStreakCard.tsx
     ---------------------------------------------------------------------- */
  function renderGentleStreakCard(streakDays, streakMessage) {
    return C.Card(
      { className: 'mb-6 b-card br-subtle p-4' },
      row(
        { class: 'items-center justify-between mb-2' },
        row(
          { class: 'items-center flex-1' },
          C.Text({ variant: 'body', className: 't-xl mr-2' }, '🌱'),
          C.Text(
            { variant: 'caption', className: 'font-mono fw-bold tracking-wider uppercase t-muted' },
            'RITMO & CONSTÂNCIA'
          )
        ),
        C.Badge({
          variant: 'secondary',
          className: 'px-3 py-1',
          label: streakDays + ' ' + (streakDays === 1 ? 'DIA' : 'DIAS'),
        })
      ),
      C.Text(
        { variant: 'body', className: 't-fg fw-medium leading-relaxed' },
        streakMessage
      )
    );
  }

  /* ------------------------------------------------------------------------
     components/VirtualBrainWidget.tsx
     ---------------------------------------------------------------------- */
  function renderVirtualBrainWidget(options) {
    var opts = options || {};
    var isMaster = opts.stage === 'MEGA';
    var progressText = isMaster
      ? 'TOTAL: ' + opts.totalCompleted
      : opts.currentProgress + ' / ' + opts.currentTarget;

    return C.Card(
      { className: 'mb-6 b-card border-2 br-subtle p-5' },
      row(
        { class: 'items-center justify-between mb-4' },
        row(
          { class: 'items-center flex-1' },
          C.Avatar({
            emoji: opts.stageEmoji,
            size: 'lg',
            accessibilityLabel: 'Mascote do cérebro no estágio ' + opts.stageLabel,
          }),
          view(
            { class: 'ml-4' },
            C.Text(
              { variant: 'caption', className: 'font-mono fw-bold tracking-wider uppercase t-muted' },
              'MEU CÉREBRO VIRTUAL'
            ),
            C.Text(
              { variant: 'title-md', className: 't-fg fw-extrabold' },
              opts.stageLabel
            )
          )
        ),
        C.Badge({
          variant: 'outline',
          className: 'px-3.5 py-1.5 br-strong',
          label: opts.stageShortLabel,
        })
      ),
      view(
        { class: 'mt-1' },
        row(
          { class: 'justify-between items-center mb-2' },
          C.Text(
            { variant: 'caption', className: 't-sm t-muted fw-medium' },
            'Progresso de Estágio'
          ),
          C.Text({ variant: 'mono-stat', className: 't-sm t-fg' }, progressText)
        ),
        C.Progress({
          value: opts.percentage,
          height: 14,
          accessibilityLabel:
            'Seu Cérebro Virtual está no estágio ' +
            opts.stageLabel +
            '. Você completou ' +
            progressText +
            '. Progresso do nível: ' +
            opts.percentage +
            ' por cento.',
        })
      )
    );
  }

  /* ------------------------------------------------------------------------
     components/DailyChallengeCard.tsx
     ---------------------------------------------------------------------- */
  function renderDailyChallengeCard(challenge, index, onPress) {
    var meta = PILLAR_META[challenge.pillar] || PILLAR_FALLBACK;
    var challengeNumber = index + 1;
    var isCompleted = challenge.isCompleted;

    return C.Card(
      { className: 'mb-4 b-card border-2 br-subtle p-5' },
      row(
        { class: 'items-center justify-between mb-3' },
        row(
          { class: 'items-center flex-1' },
          C.Text({ variant: 'body', className: 't-2xl mr-2.5' }, meta.emoji),
          view(
            {},
            C.Text(
              {
                variant: 'caption',
                className: 'font-mono fw-bold tracking-wider t-muted uppercase',
              },
              challengeNumber + '. ' + meta.name
            )
          )
        ),
        isCompleted
          ? C.Badge({ variant: 'success', className: 'b-surface br-strong', label: '✓ CONCLUÍDO' })
          : C.Badge({ variant: 'outline', className: 'br-subtle', label: '+10 PONTOS' })
      ),
      C.Text(
        { variant: 'title-md', className: 't-xl fw-bold t-fg mb-1.5 leading-snug' },
        challenge.title
      ),
      C.Text(
        { variant: 'body', className: 't-base t-muted leading-relaxed mb-5' },
        challenge.subtitle
      ),
      C.Button({
        variant: isCompleted ? 'secondary' : 'default',
        size: 'lg',
        fullWidth: true,
        className: 'challenge-btn',
        // WCAG 2.5.3: o nome acessível COMEÇA com o texto visível do botão.
        accessibilityLabel:
          (isCompleted ? 'REVISITAR ATIVIDADE' : 'INICIAR ATIVIDADE') +
          ': desafio ' +
          challengeNumber +
          ' de 3, pilar ' +
          meta.name +
          ', ' +
          challenge.title +
          (isCompleted ? ' (já concluído)' : ''),
        onPress: onPress,
        label: isCompleted ? 'REVISITAR ATIVIDADE' : 'INICIAR ATIVIDADE',
      })
    );
  }

  /* ------------------------------------------------------------------------
     components/SurpriseDiscoveryButton.tsx
     ---------------------------------------------------------------------- */
  function renderSurpriseDiscoveryButton(onPress) {
    return view(
      { class: 'my-3' },
      C.Button({
        variant: 'outline',
        size: 'lg',
        fullWidth: true,
        onPress: onPress,
        label: '🎲 SURPREENDER-ME COM UM HOBBY',
      })
    );
  }

  /* =========================================================================
     useHomeScreen.ts — derivação de estado
     ======================================================================= */

  /** Nome opcional (uma fase futura pede o nome). Aceita JSON ou texto puro. */
  function readUserName() {
    try {
      var gateway = EM.app.storage;
      var raw = typeof gateway.getRaw === 'function' ? gateway.getRaw(EM.domain.types.STORAGE_KEY_USER_NAME) : null;
      if (raw == null || raw === '') return '';
      var value = raw;
      try {
        value = JSON.parse(raw);
      } catch (error) {
        value = raw;
      }
      if (typeof value !== 'string') return '';
      return value.trim().slice(0, 40);
    } catch (error) {
      return '';
    }
  }

  function buildState() {
    var app = EM.app;
    var today = app.today(); // data LOCAL, recalculada a cada render
    app.refreshUserProgress();
    var userProgress = app.userProgress;

    var streakPreview = streakManager.previewStreak(userProgress, today);

    var brainStageConfig = brainEngine.evaluateStage(
      userProgress.totalCompletedChallenges,
      userProgress.highestBrainStageAchieved
    );

    var brainProgress = brainEngine.calculateProgress(
      userProgress.totalCompletedChallenges,
      brainStageConfig.stage
    );

    // Conclusão POR DATA: só os desafios concluídos HOJE por uma atividade real.
    var doneToday = (userProgress.triadCompletions && userProgress.triadCompletions[today]) || [];
    var triadChallenges = triadCoordinator.generateTriadForDate(today, doneToday);

    var triadCompletedCount = triadChallenges.filter(function (challenge) {
      return challenge.isCompleted;
    }).length;

    return {
      greeting: buildGreeting(new Date(), readUserName()),
      dateFormatted: 'Hoje é um lindo dia para cuidar de você!',
      brainStageConfig: brainStageConfig,
      brainProgress: brainProgress,
      streak: streakPreview,
      triadChallenges: triadChallenges,
      triadCompletedCount: triadCompletedCount,
      isTriadFullyCompleted: triadCompletedCount === 3,
    };
  }

  /** Saudação por faixa horária (docs/features/screen-01-home.md §3). Sem nome → "Olá!" implícito. */
  function buildGreeting(now, name) {
    var hour = now.getHours();
    var suffix = name ? ', ' + name + '!' : '!';
    if (hour >= 5 && hour < 12) return '☀️ Bom dia' + suffix;
    if (hour >= 12 && hour < 18) return '🌤️ Boa tarde' + suffix;
    return '🌙 Boa noite' + suffix;
  }

  /** Tocar no card só NAVEGA (abre o jogo exato quando a rota o nomeia). */
  function openChallenge(challenge) {
    var target = triadCoordinator.resolveRoute(challenge.route);
    EM.app.feedback.triggerSelectFeedback();
    EM.app.navigate(target.screen, target.params);
  }

  /* =========================================================================
     HomeScreenView.tsx — árvore completa
     ======================================================================= */
  function render() {
    var app = EM.app;
    var state = buildState();

    return view(
      {},
      /* Cabeçalho de saudação */
      view(
        { class: 'mb-6' },
        C.Text(
          { variant: 'title-lg', className: 't-fg fw-extrabold mb-1 home-greeting', as: 'h1' },
          state.greeting
        ),
        C.Text({ variant: 'caption', className: 't-lg t-muted' }, state.dateFormatted)
      ),

      /* Ritmo & Constância */
      renderGentleStreakCard(state.streak.currentStreak, state.streak.encouragementMessage),

      /* Cérebro Virtual */
      renderVirtualBrainWidget({
        stage: state.brainStageConfig.stage,
        stageShortLabel: state.brainStageConfig.shortLabel,
        stageLabel: state.brainStageConfig.label,
        stageEmoji: state.brainStageConfig.emoji,
        totalCompleted: app.userProgress.totalCompletedChallenges,
        currentProgress: state.brainProgress.current,
        currentTarget: state.brainProgress.target,
        percentage: state.brainProgress.percentage,
      }),

      /* Cabeçalho da Tríade do Dia */
      view(
        { class: 'mb-4 row items-center justify-between' },
        view(
          { class: 'flex-1' },
          C.Text({ variant: 'title-md', className: 't-fg fw-bold' }, 'Tríade do Dia'),
          C.Text(
            { variant: 'caption', className: 't-sm t-muted mt-0.5' },
            '3 metas acolhedoras para o seu dia'
          )
        ),
        C.Badge({
          variant: state.isTriadFullyCompleted ? 'success' : 'outline',
          className: 'px-3.5 py-1.5 br-strong',
          label: state.triadCompletedCount + ' / 3 CONCLUÍDOS',
        })
      ),

      /* Os 3 desafios */
      state.triadChallenges.map(function (challenge, index) {
        return renderDailyChallengeCard(challenge, index, function () {
          openChallenge(challenge);
        });
      }),

      /* Botão de surpresa */
      renderSurpriseDiscoveryButton(function () {
        app.navigate('DISCOVERY');
      }),

      /* Progresso / celebração da tríade (sempre afirmativo) */
      state.isTriadFullyCompleted
        ? view(
            { class: 'mt-4 p-4 rounded-2xl b-card br-subtle items-center' },
            C.Text(
              { variant: 'body-lead', className: 't-fg t-center fw-semibold' },
              '🎉 Incrível! Você completou sua Tríade do Dia! Seu cérebro está mais forte!'
            )
          )
        : state.triadCompletedCount > 0
        ? view(
            { class: 'mt-4 p-4 rounded-2xl b-card br-subtle items-center' },
            C.Text(
              { variant: 'body-lead', className: 't-fg t-center fw-semibold' },
              '🌟 Você já completou ' + state.triadCompletedCount + ' de 3 desafios hoje! Parabéns!'
            )
          )
        : null
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.home = { render: render, PILLAR_META: PILLAR_META };
})(window);
