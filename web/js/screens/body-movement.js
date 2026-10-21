/* ============================================================================
   everMind Web — js/screens/body-movement.js
   Tela 3 — "Corpo" / Mexa o Corpo.

   Portagem 1:1 de `src/screens/BodyMovementScreen/`:
     index.tsx + useBodyMovement.ts + BodyMovementView.tsx

   ⚠️ Este arquivo concentra o ÚNICO `useEffect` do projeto React Native
      inteiro: o `setInterval(…, 1000)` do cronômetro.

   ── Como o efeito foi portado sem React ───────────────────────────────────
     O intervalo é gerenciado por `syncTimerInterval()`, chamado pelo
     `render()` da tela. Ele roda FORA do caminho de construção do DOM:

       • se o status é RUNNING e não há intervalo ativo, cria um;
       • se o status deixou de ser RUNNING, limpa o intervalo existente.

     Como `render()` reconstrói a tela inteira a cada mudança de estado, o
     efeito é reavaliado naturalmente — exatamente como o React reavalida
     efeitos após cada render. Nenhum intervalo duplicado pode sobreviver,
     porque a criação é sempre precedida por uma limpeza.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var h = EM.dom.h;
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var habits = EM.domain.habitsCoordinator;

  var state = null;
  var intervalId = null;

  function ensureState() {
    var app = EM.app;
    // Data LOCAL recalculada a cada render: o hábito "vira o dia" à meia-noite
    // local mesmo com o app aberto.
    var todayStr = app.today();

    if (state) {
      // Outras telas (Cuidado) gravam no mesmo estado de hábitos: relê do
      // storage para nunca sobrescrever com uma cópia velha.
      state.todayStr = todayStr;
      state.habitsState = habits.loadState(app.storage, todayStr);
      return state;
    }

    state = {
      todayStr: todayStr,
      habitsState: habits.loadState(app.storage, todayStr),
      timerStatus: 'IDLE', // 'IDLE' | 'RUNNING' | 'PAUSED'
      secondsElapsed: 0,
    };

    return state;
  }

  /* ------------------------------------------------------------------------
     Efeito: setInterval de 1 segundo enquanto o cronômetro está RUNNING.
     ---------------------------------------------------------------------- */
  function syncTimerInterval() {
    var shouldRun = state && state.timerStatus === 'RUNNING';

    if (shouldRun && intervalId === null) {
      intervalId = global.setInterval(function () {
        state.secondsElapsed += 1;
        updateTimerDisplay();
      }, 1000);
    } else if (!shouldRun && intervalId !== null) {
      global.clearInterval(intervalId);
      intervalId = null;
    }
  }

  /**
   * Atualiza APENAS o texto do cronômetro, sem redesenhar a tela toda.
   * Redesenhar a cada segundo recriaria o DOM sem necessidade e, pior,
   * reiniciaria a contagem de foco.
   */
  function updateTimerDisplay() {
    var node = document.getElementById('body-movement-timer');
    if (node) node.textContent = formatTime(state.secondsElapsed);
  }

  /** MM:SS com zero à esquerda — idêntico ao `padStart(2,'0')` do original. */
  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  function toggleTimer() {
    state.timerStatus = state.timerStatus === 'RUNNING' ? 'PAUSED' : 'RUNNING';
    EM.app.feedback.triggerSelectFeedback();
    EM.app.render();
  }

  function resetTimer() {
    state.timerStatus = 'IDLE';
    state.secondsElapsed = 0;
    EM.app.feedback.triggerSelectFeedback();
    EM.app.render();
  }

  function handleCompleteWalk() {
    var s = ensureState();
    // Idempotente: uma única recompensa por dia (o coordenador também protege).
    if (s.habitsState.movement.todayWalkCompleted) return;

    s.habitsState = habits.completeMovementSession(EM.app.storage, s.habitsState, s.todayStr);
    EM.app.refreshUserProgress();
    EM.app.feedback.triggerSuccessFeedback();
    EM.showToast('Caminhada registrada! +10 pontos de crescimento 🌿');
    EM.app.render();
  }

  /* =========================================================================
     BodyMovementView.tsx
     ======================================================================= */
  function render() {
    var s = ensureState();
    var app = EM.app;
    var movement = s.habitsState.movement;
    var targetMinutes = movement.targetMinutes;
    var isRunning = s.timerStatus === 'RUNNING';

    // Reavalia o efeito de tempos em tempos.
    syncTimerInterval();

    return view(
      {},
      C.PageHeader({
        title: 'Mexa o Corpo',
        subtitle: 'Pilar Movimento & Vitalidade Diária',
        action: '🏠 INÍCIO',
        onAction: function () {
          app.navigate('HOME');
        },
      }),

      /* --- Cartão 1: motivação + onde caminhar --------------------------- */
      C.Card(
        { className: 'mb-6 b-card border-2 br-subtle p-5' },
        row(
          { class: 'items-center justify-between mb-3' },
          row(
            { class: 'items-center flex-1' },
            C.Text({ variant: 'body', className: 't-3xl mr-2' }, '🚶'),
            C.Text({ variant: 'title-md' }, 'Caminhada Suave')
          ),
          C.Badge({ variant: 'outline', label: targetMinutes + ' MINUTOS' })
        ),
        C.Text(
          { variant: 'body-lead', className: 't-fg mb-4' },
          'Uma caminhada leve faz maravilhas pelo seu corpo e oxigena sua mente.'
        ),
        view(
          { class: 'b-surface p-4 rounded-2xl border br-subtle mb-2' },
          C.Text(
            {
              variant: 'caption',
              className: 'font-mono fw-bold t-xs t-muted uppercase mb-2',
            },
            '📍 ONDE CAMINHAR HOJE?'
          ),
          C.Text(
            { variant: 'body', className: 't-sm t-fg mb-1' },
            '• Na sua rua, praça ou calçada perto de casa'
          ),
          C.Text(
            { variant: 'body', className: 't-sm t-fg mb-1' },
            '• No seu quintal ou jardim ao ar livre'
          ),
          C.Text(
            { variant: 'body', className: 't-sm t-fg' },
            '• Ou dando passos confortáveis dentro da própria sala!'
          )
        )
      ),

      /* --- Cartão 2: cronômetro compassivo (opcional) --------------------- */
      C.Card(
        { className: 'mb-6 b-card br-subtle p-5 items-center' },
        C.Text(
          {
            variant: 'caption',
            className: 'font-mono t-xs uppercase t-muted mb-1',
          },
          '⏱️ TEMPO SUGERIDO (OPCIONAL)'
        ),
        h(
          'div',
          {
            id: 'body-movement-timer',
            class: 'timer-value',
            role: 'timer',
            'aria-live': 'off',
            'aria-label': 'Tempo decorrido da caminhada',
          },
          formatTime(s.secondsElapsed)
        ),
        view(
          { class: 'timer-actions' },
          C.Button({
            variant: isRunning ? 'secondary' : 'default',
            size: 'default',
            className: 'mr-2 px-6',
            onPress: toggleTimer,
            label: isRunning ? '⏸️ PAUSAR' : '▶️ INICIAR TEMPO',
          }),
          s.timerStatus !== 'IDLE'
            ? C.Button({
                variant: 'outline',
                size: 'default',
                onPress: resetTimer,
                label: '🔄 RECOMEÇAR',
              })
            : null
        )
      ),

      /* --- Ação principal ------------------------------------------------ */
      view(
        { class: 'mb-6' },
        C.Button({
          variant: movement.todayWalkCompleted ? 'secondary' : 'default',
          size: 'lg',
          fullWidth: true,
          disabled: movement.todayWalkCompleted,
          onPress: handleCompleteWalk,
          label: movement.todayWalkCompleted
            ? 'Caminhada de hoje feita! 🎉'
            : '✅ MARCAR COMO CONCLUÍDO',
        })
      ),

      /* --- Celebração ---------------------------------------------------- */
      movement.todayWalkCompleted
        ? C.Card(
            { className: 'p-5 b-card border br-strong rounded-2xl mb-4' },
            C.Text(
              { variant: 'title-md', className: 't-center mb-1' },
              '🌿 Suas pernas e coração agradecem!'
            ),
            C.Text(
              { variant: 'body', className: 't-muted t-center' },
              'Você completou sua caminhada de hoje e já acumula ' +
                movement.totalWalkSessions +
                (movement.totalWalkSessions === 1 ? ' sessão' : ' sessões') +
                ' de movimento!'
            )
          )
        : null,

      C.ClosingQuote(
        'Caminhar no seu próprio ritmo é o melhor exercício para a longevidade.'
      )
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.bodyMovement = {
    render: render,
    formatTime: formatTime,
  };
})(window);
