/* ============================================================================
   everMind Web — js/screens/discovery.js
   Tela 6 — "Descobrir" / Descubra Algo Novo.

   Portagem 1:1 de `src/screens/DiscoveryScreen/`:
     index.tsx + useDiscovery.ts + DiscoveryView.tsx
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var h = EM.dom.h;
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var discoveryEngine = EM.domain.discoveryEngine;
  var STORAGE_KEY_DISCOVERIES_COUNT = 'evermind_completed_discoveries_count';
  /* { date: 'YYYY-MM-DD', ids: [...] } — descobertas concluídas HOJE. */
  var STORAGE_KEY_DISCOVERIES_TODAY = 'evermind_discoveries_done_today_v1';
  /* Histórico [{id,date,completed?}] — últimos 14 dias (anti-repetição). */
  var STORAGE_KEY_DISCOVERY_HISTORY = 'evermind_discovery_history_v1';
  var GROWTH_POINTS = 10;

  var state = null;

  function loadHistory() {
    var h = EM.app.storage.get(STORAGE_KEY_DISCOVERY_HISTORY);
    return discoveryEngine.pruneHistory(h, EM.app.today());
  }

  /** Sorteia respeitando o histórico e registra a exibição. */
  function rollFor(excluded, category) {
    var today = EM.app.today();
    var item = discoveryEngine.rollSurprise(excluded, category, loadHistory(), today);
    EM.app.storage.set(
      STORAGE_KEY_DISCOVERY_HISTORY,
      discoveryEngine.recordInHistory(loadHistory(), item.id, today, false)
    );
    return item;
  }

  function ensureState() {
    if (!state) {
      var app = EM.app;
      state = {
        selectedCategory: 'ALL',
        // Sorteio inicial já ocorre no primeiro render, como no `useState` original.
        currentDiscovery: null,
        completedCount: app.storage.get(STORAGE_KEY_DISCOVERIES_COUNT) || 0,
        animate: false,
      };
      state.todayStr = app.today();
      state.currentDiscovery = rollFor([], 'ALL');
    }
    state.todayStr = EM.app.today(); // data LOCAL, recalculada a cada render
    return state;
  }

  /** Ids de descobertas concluídas na data local de hoje (persistido). */
  function doneTodayIds() {
    var s = ensureState();
    var saved = EM.app.storage.get(STORAGE_KEY_DISCOVERIES_TODAY);
    if (saved && saved.date === s.todayStr && Array.isArray(saved.ids)) return saved.ids;
    return [];
  }

  /** Concluída hoje? Derivado do registro do dia: sortear de novo o mesmo item não reabre a recompensa. */
  function isCurrentCompleted() {
    return doneTodayIds().indexOf(ensureState().currentDiscovery.id) >= 0;
  }

  /**
   * Anti-repetição: o motor evita itens vistos nos últimos 7 dias (e o atual);
   * se o pool esgotar, usa o visto há mais tempo. A conclusão continua sendo
   * por item e por dia (não reabre a recompensa).
   */
  function handleRollSurprise(category) {
    var s = ensureState();
    var target = category === undefined ? s.selectedCategory : category;
    s.currentDiscovery = rollFor([s.currentDiscovery.id], target);
    s.animate = true; // revelação calma (~1,2 s); some com prefers-reduced-motion
    if (EM.announce) {
      EM.announce(
        'Descoberta sorteada: ' + s.currentDiscovery.title + '. ' + s.currentDiscovery.categoryLabel + '.'
      );
    }
    EM.app.feedback.triggerSelectFeedback();
    EM.app.render();
  }

  function handleSelectCategory(category) {
    var s = ensureState();
    s.selectedCategory = category;
    handleRollSurprise(category);
    // O redesenho recria a fila de chips (scrollLeft volta a 0): traz o
    // chip ativo de volta para a área visível.
    global.requestAnimationFrame(function () {
      var active = global.document.querySelector('.chip-row .chip[aria-pressed="true"]');
      if (active && active.scrollIntoView) {
        active.scrollIntoView({ inline: 'center', block: 'nearest' });
      }
    });
  }

  function handleCompleteDiscovery() {
    var s = ensureState();
    if (isCurrentCompleted()) return; // idempotente por descoberta e por dia

    var app = EM.app;
    var ids = doneTodayIds().concat([s.currentDiscovery.id]);
    app.storage.set(STORAGE_KEY_DISCOVERIES_TODAY, { date: s.todayStr, ids: ids });

    app.storage.set(
      STORAGE_KEY_DISCOVERY_HISTORY,
      discoveryEngine.recordInHistory(loadHistory(), s.currentDiscovery.id, s.todayStr, true)
    );

    s.completedCount += 1;
    app.storage.set(STORAGE_KEY_DISCOVERIES_COUNT, s.completedCount);

    app.recordActivity({
      pillar: 'DISCOVERY',
      kind: 'discovery',
      activityKey: 'discovery',
      points: GROWTH_POINTS,
    });

    app.feedback.triggerSuccessFeedback();
    EM.showToast('Descoberta de hoje registrada! +10 pontos de crescimento 🎲');
    app.render();
  }

  /* =========================================================================
     DiscoveryView.tsx
     ======================================================================= */
  function render() {
    var s = ensureState();
    var app = EM.app;
    var current = s.currentDiscovery;
    var isCompletedCurrent = isCurrentCompleted();
    var categories = discoveryEngine.getCategories();
    var animate = s.animate;
    s.animate = false; // anima só o render logo após o sorteio

    function buildChip(category, label, isActive) {
      return h(
        'button',
        {
          type: 'button',
          class: 'chip',
          'aria-pressed': isActive ? 'true' : 'false',
          onClick: function () {
            handleSelectCategory(category);
          },
        },
        label
      );
    }

    return view(
      {},
      C.PageHeader({
        title: 'Descubra Algo Novo',
        subtitle: 'Curiosidade, Hobbies & Neuroplasticidade',
        action: '🏠 INÍCIO',
        onAction: function () {
          app.navigate('HOME');
        },
      }),

      /* Contador global */
      C.StatsBanner({
        icon: '🎲',
        eyebrow: 'DESCOBERTAS REALIZADAS',
        value: s.completedCount + ' novos horizontes explorados',
        badge: '+10 PONTOS / DESCOBERTA',
      }),

      /* Chamada principal */
      view(
        { class: 'mb-6' },
        C.Button({
          variant: 'default',
          size: 'lg',
          fullWidth: true,
          className: 'border-2 br-fg',
          onPress: function () {
            handleRollSurprise();
          },
          label: '🎲 SURPREENDER-ME AGORA!',
        })
      ),

      /* Filtro por categoria — rolagem horizontal (como o ScrollView do RN) */
      view(
        { class: 'mb-6' },
        C.Text(
          { variant: 'caption', className: 'font-mono fw-bold t-xs uppercase t-muted mb-3' },
          '📚 OU ESCOLHA UMA CATEGORIA:'
        ),
        view(
          { class: 'chip-row', role: 'group', 'aria-label': 'Categorias de descoberta' },
          buildChip('ALL', '✨ Todas', s.selectedCategory === 'ALL'),
          categories.map(function (cat) {
            return buildChip(cat.category, cat.icon + ' ' + cat.label, s.selectedCategory === cat.category);
          })
        )
      ),

      /* Cartão da descoberta atual */
      C.Card(
        { className: 'mb-6 b-card border-2 br-subtle p-5' + (animate ? ' discovery-reveal' : '') },
        row(
          { class: 'items-center justify-between mb-3' },
          row(
            { class: 'items-center flex-1' },
            C.Text({ variant: 'body', className: 't-3xl mr-3' }, current.categoryIcon),
            view(
              {},
              C.Text(
                { variant: 'caption', className: 'font-mono fw-bold uppercase t-muted' },
                current.categoryLabel
              ),
              C.Text(
                { variant: 'title-md', className: 't-xl fw-bold t-fg' },
                current.title
              )
            )
          )
        ),
        C.Text({ variant: 'body-lead', className: 't-fg mb-4' }, current.description),
        view(
          { class: 'p-4 b-surface rounded-2xl border br-subtle mb-5' },
          C.Text(
            { variant: 'caption', className: 'font-mono fw-bold t-xs uppercase t-muted mb-1' },
            '💡 DICA PRÁTICA:'
          ),
          C.Text(
            { variant: 'body', className: 't-sm t-fg leading-relaxed' },
            current.practicalTip
          )
        ),
        C.Button({
          variant: isCompletedCurrent ? 'secondary' : 'default',
          size: 'lg',
          fullWidth: true,
          disabled: isCompletedCurrent,
          onPress: handleCompleteDiscovery,
          label: isCompletedCurrent
            ? 'Descoberta de hoje feita! 🎉'
            : '✅ CONCLUÍ ESTA DESCOBERTA!',
        })
      ),

      C.ClosingQuote(
        'Aprender algo novo todos os dias mantém a juventude da mente e do coração.'
      )
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.discovery = { render: render };
})(window);
