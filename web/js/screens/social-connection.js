/* ============================================================================
   everMind Web — js/screens/social-connection.js
   Tela 5 — "Afeto" / Desafio da Conexão.

   Portagem 1:1 de `src/screens/SocialConnectionScreen/`:
     index.tsx + useSocialConnection.ts + SocialConnectionView.tsx
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var social = EM.domain.socialCoordinator;

  /* Horário do lembrete — literal '16:00' no `useSocialConnection` original. */
  var REMINDER_TIME = '16:00';

  var state = null;

  function ensureState() {
    var app = EM.app;
    // Data LOCAL recalculada a cada render (virada do dia à meia-noite local).
    var todayStr = app.today();
    if (state) {
      state.todayStr = todayStr;
      state.socialState = social.loadState(app.storage, todayStr);
      return state;
    }
    state = {
      todayStr: todayStr,
      socialState: social.loadState(app.storage, todayStr),
      // ⚠️ No original, `reminderConfirmed` é estado LOCAL e NÃO é persistido:
      //    ao trocar de aba e voltar, o botão volta ao rótulo original mesmo
      //    com `reminderScheduledTime` gravado. Preservado.
      reminderConfirmed: false,
    };
    return state;
  }

  function handleCompleteCall() {
    var s = ensureState();
    // Idempotente: uma única recompensa por dia.
    if (s.socialState.isConnectionCompletedToday) return;

    s.socialState = social.completeSocialConnection(EM.app.storage, s.socialState, s.todayStr);
    EM.app.refreshUserProgress();
    EM.app.feedback.triggerSuccessFeedback();
    EM.showToast('Que gesto lindo! +10 pontos de crescimento ❤️');
    EM.app.render();
  }

  function handleScheduleReminder() {
    ensureState();
    state.socialState = social.scheduleReminder(
      EM.app.storage,
      state.socialState,
      REMINDER_TIME
    );
    state.reminderConfirmed = true;
    EM.app.feedback.triggerGentleNoticeFeedback();
    EM.app.render();
  }

  /* =========================================================================
     SocialConnectionView.tsx
     ======================================================================= */
  function render() {
    var s = ensureState();
    var app = EM.app;
    var isCompleted = s.socialState.isConnectionCompletedToday;

    return view(
      {},
      C.PageHeader({
        title: 'Desafio da Conexão',
        subtitle: 'Pilar Conexão & Afeto Humano',
        action: '🏠 INÍCIO',
        onAction: function () {
          app.navigate('HOME');
        },
      }),

      /* Contador global */
      C.StatsBanner({
        icon: '❤️',
        eyebrow: 'LAÇOS CULTIVADOS',
        value: s.socialState.totalSocialConnections + ' momentos de carinho',
        badge: '+10 PONTOS / LIGAÇÃO',
      }),

      /* Cartão do convite */
      C.Card(
        { className: 'mb-6 b-card border-2 br-subtle p-5' },
        row(
          { class: 'items-center mb-3' },
          C.Text({ variant: 'body', className: 't-3xl mr-3' }, '💌'),
          C.Text(
            { variant: 'title-md', className: 'flex-1' },
            '"Quem você não conversa há algum tempo?"'
          )
        ),
        C.Text(
          { variant: 'body-lead', className: 't-fg mb-4' },
          'Que tal fazer uma ligação afetuosa hoje para um amigo ou familiar e perguntar:'
        ),
        view(
          { class: 'quote-block' },
          C.Text(
            { variant: 'title-md', className: 't-center italic t-fg' },
            '🗣️ "Como foi o seu dia hoje?"'
          )
        ),
        C.Text(
          { variant: 'body', className: 't-sm t-muted leading-relaxed' },
          'Uma conversa simples de 5 minutos alegra o coração de quem fala e de quem escuta, combatendo a solidão.'
        )
      ),

      /* Ações */
      view(
        { class: 'mb-6' },
        C.Button({
          variant: isCompleted ? 'secondary' : 'default',
          size: 'lg',
          fullWidth: true,
          className: 'mb-3',
          disabled: isCompleted,
          onPress: handleCompleteCall,
          label: isCompleted
            ? 'Ligação de hoje feita! 🎉'
            : '📞 JÁ LIGUEI / VOU LIGAR AGORA',
        }),
        C.Button({
          variant: 'outline',
          size: 'lg',
          fullWidth: true,
          onPress: handleScheduleReminder,
          label: s.reminderConfirmed
            ? '✓ LEMBRETE ATIVADO PARA MAIS TARDE'
            : '⏰ LEMBRAR-ME MAIS TARDE',
        })
      ),

      /* Celebração */
      isCompleted
        ? C.Card(
            { className: 'p-5 b-card border br-strong rounded-2xl mb-4' },
            C.Text(
              { variant: 'title-md', className: 't-center mb-1' },
              '❤️ Que gesto lindo e carinhoso!'
            ),
            C.Text(
              { variant: 'body', className: 't-muted t-center' },
              'Manter contato fortalece memórias afetivas e espalha bem-estar.'
            )
          )
        : null,

      C.ClosingQuote(
        'Laços de afeto e presença são o melhor remédio para o coração e para a mente.'
      )
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.socialConnection = { render: render };
})(window);
