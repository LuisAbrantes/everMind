/* ============================================================================
   everMind Web — js/screens/weekly-summary.js
   Tela 7 — "Semana" / Minha Semana.

   Portagem 1:1 de `src/screens/WeeklySummaryScreen/`:
     index.tsx + useWeeklySummary.ts + WeeklySummaryView.tsx

   REGRA DE DOMÍNIO (CONTEXT.md §3.5): a retrospectiva apresenta EXCLUSIVAMENTE
   métricas afirmativas — o que foi conquistado, nunca o que faltou.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var weeklyCalculator = EM.domain.weeklySummaryCalculator;
  var supabaseSync = EM.domain.supabaseSync;

  var state = null;

  function ensureState() {
    if (state) return state;
    state = { isSyncing: false, syncStatus: null };
    return state;
  }

  /**
   * Monta o relatório da semana a partir do LOG REAL de conclusões
   * (`progress.completionLog`, últimos 60 dias): janela rolante [hoje-6, hoje]
   * em data LOCAL. Sem valores de reserva: uma instalação nova mostra zeros
   * de verdade, e a mensagem de "primeiro dia" é alcançável.
   */
  function buildReport() {
    var app = EM.app;
    app.refreshUserProgress();
    var progress = app.userProgress;
    var today = app.today();
    var totals = EM.domain.gentleStreakManager.weeklyTotals(progress, today);

    return weeklyCalculator.calculateReport(
      {
        // Descobertas contam como atividade de Mente (exploração cognitiva).
        mindPillarTotal: totals.MIND + totals.DISCOVERY,
        movementPillarTotal: totals.MOVEMENT,
        selfCarePillarTotal: totals.SELFCARE,
        connectionPillarTotal: totals.CONNECTION,
        activeDaysInWeek: totals.activeDays,
        unlockedBadges: progress.badges || [],
      },
      new Date()
    );
  }

  /** Texto afirmativo em pt-BR para enviar à família (WhatsApp etc.). */
  function buildShareText(report) {
    var lines = ['🌟 Minha semana no everMind'];
    lines.push('🧠 ' + report.mindPillarTotal + ' atividades mentais');
    lines.push('🚶 ' + report.movementPillarTotal + ' momentos de movimento');
    lines.push('🌿 ' + report.selfCarePillarTotal + ' momentos de autocuidado');
    lines.push('❤️ ' + report.connectionPillarTotal + ' contatos de afeto');
    lines.push(
      report.totalActivitiesCompleted > 0
        ? '✨ Cada passo conta, e eu estou cuidando de mim no meu ritmo!'
        : '✨ Estou começando a cuidar de mim no meu ritmo!'
    );
    return lines.join('\n');
  }

  /** Compartilha pelo sistema; sem suporte, copia o texto e avisa com um toast. */
  function handleShareAchievements() {
    var report = buildReport();
    var text = buildShareText(report);
    var nav = global.navigator;
    EM.app.feedback.triggerSelectFeedback();

    function copyFallback() {
      var done = function () {
        EM.showToast('Texto copiado! Agora é só colar na conversa com quem você ama 💛');
      };
      var failed = function () {
        EM.showToast('Não conseguimos copiar agora. Tente de novo em instantes 💛');
      };
      if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
        nav.clipboard.writeText(text).then(done, failed);
      } else {
        failed();
      }
    }

    if (nav && typeof nav.share === 'function') {
      try {
        nav
          .share({ title: 'Minha semana no everMind', text: text })
          .then(function () {
            EM.app.feedback.triggerSuccessFeedback();
          })
          .catch(function (error) {
            // Fechar a folha de compartilhamento não é erro: nada a avisar.
            if (error && error.name === 'AbortError') return;
            copyFallback();
          });
      } catch (error) {
        copyFallback();
      }
      return;
    }
    copyFallback();
  }

  function isCloudConfigured() {
    var client = EM.domain.supabaseClient;
    return Boolean(client && typeof client.isConfigured === 'function' && client.isConfigured());
  }

  function handleSyncCloud() {
    var s = ensureState();
    s.isSyncing = true;
    s.syncStatus = null;
    EM.app.feedback.triggerSelectFeedback();
    EM.app.render();

    return supabaseSync
      .syncLocalProgressToCloud(EM.app.storage)
      .then(function (result) {
        s.isSyncing = false;
        s.syncStatus = result.success
          ? '✓ Cópia de segurança guardada'
          : 'Seu progresso está guardado neste aparelho';
        if (result.success) {
          EM.app.feedback.triggerSuccessFeedback();
        } else if (result.error) {
          EM.showToast(result.error);
        }
        EM.app.render();
      })
      .catch(function () {
        s.isSyncing = false;
        s.syncStatus = 'Seu progresso está guardado neste aparelho';
        EM.app.render();
      });
  }

  /** "2026-10-20T14:03:00Z" → "20/10" (data local). */
  function formatUnlockedDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  }

  /* =========================================================================
     WeeklySummaryView.tsx
     ======================================================================= */
  var PILLARS = [
    { key: 'mind', icon: '🧠', label: 'Atividades Mentais', description: 'Jogos de memória, raciocínio e descobertas', tag: 'MENTE' },
    { key: 'movement', icon: '🚶', label: 'Caminhadas & Movimento', description: 'Sessões de passos e oxigenação', tag: 'CORPO' },
    { key: 'selfCare', icon: '🌿', label: 'Momentos de Autocuidado', description: 'Água, frutas nutritivas e sono restaurador', tag: 'SAÚDE' },
    { key: 'connection', icon: '❤️', label: 'Contatos de Afeto', description: 'Ligações e conversas calorosas', tag: 'AFETO' },
  ];

  function renderPillarCard(pillar, total) {
    return view(
      { class: 'pillar-card' },
      row(
        { class: 'items-center' },
        C.Text({ variant: 'body', className: 'pillar-emoji' }, pillar.icon),
        view(
          { class: 'flex-1' },
          C.Text(
            { variant: 'body', className: 'fw-bold t-fg' },
            total + ' ' + pillar.label
          ),
          C.Text({ variant: 'caption', className: 't-xs t-muted' }, pillar.description)
        )
      ),
      C.Badge({ variant: 'outline', label: pillar.tag })
    );
  }

  function render() {
    var s = ensureState();
    var app = EM.app;
    var report = buildReport();
    var nextBadge = report.badges.filter(function (badge) {
      return !badge.unlockedAt;
    })[0];

    return view(
      {},
      C.PageHeader({
        title: 'Minha Semana',
        subtitle: 'Retrospectiva Positiva dos 4 Pilares',
        action: '🏠 INÍCIO',
        onAction: function () {
          app.navigate('HOME');
        },
      }),

      /* Banner afirmativo */
      C.Card(
        { className: 'mb-6 b-card border-2 br-subtle p-5' },
        row(
          { class: 'items-center mb-3' },
          C.Text({ variant: 'body', className: 't-3xl mr-2' }, '🌟'),
          C.Text({ variant: 'title-md' }, 'Vitórias da Sua Semana')
        ),
        C.Text(
          { variant: 'body-lead', className: 't-fg fw-medium leading-relaxed mb-3' },
          report.affirmativeMessage
        ),
        report.totalActivitiesCompleted > 0
          ? view(
              { class: 'chip-stat' },
              report.totalActivitiesCompleted +
                (report.totalActivitiesCompleted === 1 ? ' ATIVIDADE CONQUISTADA' : ' ATIVIDADES CONQUISTADAS')
            )
          : null
      ),

      /* Os 4 pilares */
      view(
        {},
        C.Text(
          { variant: 'caption', className: 'section-label' },
          '📊 SEUS 4 PILARES DA LONGEVIDADE:'
        ),
        PILLARS.map(function (pillar) {
          return renderPillarCard(pillar, report[pillar.key + 'PillarTotal']);
        })
      ),

      /* Minhas conquistas */
      view(
        { class: 'mt-4' },
        C.Text({ variant: 'caption', className: 'section-label' }, '🏆 Minhas conquistas'),
        nextBadge
          ? C.Text(
              { variant: 'body', className: 't-fg fw-semibold mb-3' },
              'Sua próxima conquista: ' + nextBadge.icon + ' ' + nextBadge.name
            )
          : C.Text(
              { variant: 'body', className: 't-fg fw-semibold mb-3' },
              '🎉 Você conquistou todas as medalhas! Que jornada linda!'
            ),
        report.badges.map(function (badge) {
          var isUnlocked = badge.unlockedAt !== null && badge.unlockedAt !== undefined;
          var when = isUnlocked ? formatUnlockedDate(badge.unlockedAt) : '';

          return view(
            {
              class: EM.dom.cls([
                'badge-card',
                isUnlocked
                  ? 'b-card border-2 br-strong'
                  : 'b-locked border br-hairline op-50',
              ]),
            },
            row(
              { class: 'items-center flex-1 mr-3' },
              C.Text({ variant: 'body', className: 'pillar-emoji' }, badge.icon),
              view(
                { class: 'flex-1' },
                C.Text({ variant: 'body', className: 'fw-bold t-fg' }, badge.name),
                C.Text({ variant: 'caption', className: 't-xs t-muted' }, badge.description)
              )
            ),
            isUnlocked
              ? C.Badge({
                  variant: 'success',
                  label: when ? 'CONQUISTADA EM ' + when : 'CONQUISTADA',
                })
              : null
          );
        })
      ),

      /* Ações */
      view(
        { class: 'mt-4' },
        C.Button({
          variant: 'default',
          size: 'lg',
          fullWidth: true,
          className: 'mb-3',
          onPress: handleShareAchievements,
          label: '📤 COMPARTILHAR CONQUISTAS',
        }),
        /* O botão de cópia de segurança só existe quando há credenciais
           configuradas: sem elas, não há nada a oferecer ao usuário. */
        isCloudConfigured()
          ? C.Button({
              variant: 'outline',
              size: 'lg',
              fullWidth: true,
              isLoading: s.isSyncing,
              accessibilityLabel: s.isSyncing ? 'Guardando a cópia de segurança' : undefined,
              onPress: handleSyncCloud,
              label: '💾 GUARDAR CÓPIA DE SEGURANÇA',
            })
          : null,
        isCloudConfigured() && s.syncStatus
          ? C.Text(
              { variant: 'caption', className: 't-center t-xs t-muted mt-1' },
              s.syncStatus
            )
          : null
      ),

      C.ClosingQuote(
        'Cada novo dia é uma oportunidade de celebrar a vida e cuidar de quem você é.'
      )
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.weeklySummary = { render: render, PILLARS: PILLARS, buildShareText: buildShareText };
})(window);
