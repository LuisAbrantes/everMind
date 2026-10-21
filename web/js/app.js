/* ============================================================================
   everMind Web — js/app.js
   Ponto de entrada. Equivale a `App.tsx` + `src/navigation/RootNavigator.tsx`.

     App.tsx                 → monta o shell (#app, #screen, #tabbar)
     RootNavigator.tsx       → NAV_TABS, navegação e render da tela ativa

   Não há roteamento por URL no app React Native (é um `useState` simples), e
   também não criamos um aqui: manter o comportamento idêntico é mais fiel do
   que "melhorar". A PWA sempre abre em "Hoje", como o app sempre fazia.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var h = EM.dom.h;
  var dom = EM.dom;

  /* ------------------------------------------------------------------------
     O CONTEXTO DA APLICAÇÃO
     Equivale às dependências injetadas nos hooks do app original
     (`deps?: { storageGateway, feedbackService, todayDate }`).
     ---------------------------------------------------------------------- */
  var app = (EM.app = {
    storage: EM.storage.gateway,
    feedback: new EM.domain.feedback.WebFeedbackService(),

    /* Espelho em memória do progresso global. Toda mutação passa por
       `saveUserProgress`, que mantém memória e localStorage em sincronia. */
    userProgress: null,

    /* Data LOCAL (YYYY-MM-DD). Recalculada por `app.today()` a cada render e a
       cada `recordActivity`; estes campos são só um espelho. `todayUtc` é um
       ALIAS DEPRECADO: a convenção UTC foi removida (ADR-0009). */
    todayLocal: EM.domain.types.todayLocalDateString(new Date()),
    todayUtc: EM.domain.types.todayLocalDateString(new Date()),

    currentScreen: 'HOME',
  });

  /* ------------------------------------------------------------------------
     Datas
     ---------------------------------------------------------------------- */

  /** Hoje, no fuso LOCAL do aparelho. Também atualiza o espelho `todayLocal`. */
  app.today = function () {
    var now = EM.domain.types.todayLocalDateString(new Date());
    app.todayLocal = now;
    app.todayUtc = now;
    return now;
  };

  /* ------------------------------------------------------------------------
     Persistência do progresso global

     Primeira execução = ZEROS (Brain Baby, 0 desafios, sequência 0): não há
     mais perfil de demonstração. Dados ilegíveis nunca são sobrescritos em
     silêncio: o tracker os envia para `<chave>_backup` antes de recomeçar.
     ---------------------------------------------------------------------- */
  app.loadUserProgress = function () {
    return EM.domain.progressTracker.loadProgress(app.storage);
  };

  app.saveUserProgress = function (next) {
    app.userProgress = next;
    app.storage.set(EM.domain.types.STORAGE_KEY_USER_PROGRESS, next);
  };

  /** Relê do storage — o storage é a única fonte da verdade. */
  app.refreshUserProgress = function () {
    app.userProgress = app.loadUserProgress();
    return app.userProgress;
  };

  /**
   * Registra UMA atividade concluída (jogo, caminhada, meta de água, fruta,
   * sono, ligação, descoberta): atualiza sequência, log semanal, Tríade e
   * conquistas numa só gravação. Veja `EM.domain.progressTracker.recordActivity`.
   */
  app.recordActivity = function (opts) {
    var result = EM.domain.progressTracker.recordActivity(
      app.storage,
      Object.assign({ date: app.today() }, opts)
    );
    app.userProgress = result.progress;
    return result;
  };

  /* ------------------------------------------------------------------------
     Celebração de evolução do Cérebro Virtual
     O app React Native não tinha animação de mudança de estágio, apesar de a
     spec (`rewards-and-brain-evolution.md` §1.3) prever uma celebração de 3
     segundos. Aproveitamos a seam de feedback para anunciá-la de forma breve e
     discreta — nunca com confete barulhento ou cores de alerta.
     ---------------------------------------------------------------------- */
  app.announceBrainStageChange = function (previousStage, nextStage, config) {
    if (!config || previousStage === nextStage) return;
    var order = EM.domain.brainEvolutionEngine.STAGE_ORDER;
    if (order.indexOf(nextStage) <= order.indexOf(previousStage)) return;

    EM.vibrate([18, 60, 18]);
    EM.showToast(
      config.emoji + ' Seu Cérebro Virtual chegou ao estágio ' + config.label + '!',
      3200
    );
  };

  /* ------------------------------------------------------------------------
     Avisos gentis disparados pelo tracker (vale para QUALQUER caminho de
     conclusão): estágio do Cérebro Virtual, nova conquista e Tríade completa.
     Só celebram; nunca falam de perda.
     ---------------------------------------------------------------------- */
  function onProgressRecorded(result) {
    app.announceBrainStageChange(result.previousStage, result.nextStage, result.stageConfig);
    (result.newBadges || []).forEach(function (badge) {
      EM.showToast('🏅 Nova conquista: ' + badge.name + '! Parabéns!', 3600);
    });
    if (result.triadJustCompleted) {
      EM.showToast('🎉 Incrível! Você completou sua Tríade do Dia!', 3600);
    }
  }

  /** Avisa uma única vez, com delicadeza, quando um dado ilegível foi guardado em cópia. */
  function announceStorageNotices() {
    var gateway = app.storage;
    if (!gateway || typeof gateway.consumeNotices !== 'function') return;
    if (gateway.consumeNotices().length > 0) {
      EM.showToast(
        '💛 Um dado guardado não pôde ser lido. Fizemos uma cópia de segurança e você pode continuar normalmente.',
        6000
      );
    }
  }

  /* ------------------------------------------------------------------------
     RENDER
     ---------------------------------------------------------------------- */
  var screenHost = null;
  var tabHost = null;

  var SCREEN_RENDERERS = {
    HOME: function () {
      return EM.screens.home.render();
    },
    BRAIN_GYM: function () {
      return EM.screens.brainGym.render();
    },
    BODY_MOVEMENT: function () {
      return EM.screens.bodyMovement.render();
    },
    SELF_CARE: function () {
      return EM.screens.selfCare.render();
    },
    SOCIAL_CONNECTION: function () {
      return EM.screens.socialConnection.render();
    },
    DISCOVERY: function () {
      return EM.screens.discovery.render();
    },
    WEEKLY_SUMMARY: function () {
      return EM.screens.weeklySummary.render();
    },
    MORE: function () {
      return EM.screens.more.render();
    },
    SETTINGS: function () {
      // Tela de Ajustes é entregue em fase posterior; sem ela, volta a "Mais".
      return EM.screens.settings ? EM.screens.settings.render() : EM.screens.more.render();
    },
  };

  /* ---- Acessibilidade: foco estável entre re-renders ---------------------
     A tela inteira é redesenhada a cada interação, o que destruiria o elemento
     focado (teclado, switch, VoiceOver perderiam o lugar). Antes de redesenhar
     guardamos uma "chave" do controle ativo — data-focus-key, senão aria-label
     + índice entre iguais, senão texto + índice, senão posição — e depois
     devolvemos o foco ao controle equivalente. */
  var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function sameLabel(host, el) {
    var label = el.getAttribute('aria-label');
    return Array.prototype.filter.call(host.querySelectorAll(FOCUSABLE), function (n) {
      return label ? n.getAttribute('aria-label') === label
                   : !n.getAttribute('aria-label') && n.textContent.trim() === el.textContent.trim();
    });
  }

  function captureFocus(host) {
    var el = document.activeElement;
    if (!el || el === document.body || !host.contains(el)) return null;
    var all = Array.prototype.slice.call(host.querySelectorAll(FOCUSABLE));
    return {
      key: el.getAttribute('data-focus-key'),
      label: el.getAttribute('aria-label'),
      text: el.textContent.trim(),
      sameIndex: sameLabel(host, el).indexOf(el),
      index: all.indexOf(el),
    };
  }

  function restoreFocus(host, saved) {
    if (!saved) return;
    var target = null;
    var all = Array.prototype.slice.call(host.querySelectorAll(FOCUSABLE));
    if (saved.key) {
      target = host.querySelector('[data-focus-key="' + saved.key.replace(/"/g, '\\"') + '"]');
    }
    if (!target && saved.sameIndex >= 0) {
      var peers = all.filter(function (n) {
        return saved.label ? n.getAttribute('aria-label') === saved.label
                           : !n.getAttribute('aria-label') && n.textContent.trim() === saved.text;
      });
      target = peers[saved.sameIndex] || peers[peers.length - 1] || null;
    }
    // O controle sumiu (ex.: "Iniciar" virou "Pausar"): mantém a mesma posição.
    if (!target && all.length) target = all[Math.min(Math.max(saved.index, 0), all.length - 1)];
    if (target && target !== document.activeElement) target.focus({ preventScroll: true });
  }

  function setDocumentTitle() {
    var name = EM.SCREEN_TITLES[app.currentScreen] || 'everMind';
    document.title = name + ' — everMind';
  }

  /** Barra "Voltar" das subtelas de "Mais". */
  function buildBackRow() {
    return h(
      'div',
      { class: 'back-row' },
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn-sm btn-v-outline back-btn',
          dataset: { focusKey: 'back-to-more' },
          'aria-label': 'Voltar para Mais',
          onClick: function () {
            app.navigate('MORE');
          },
        },
        '← Voltar'
      )
    );
  }

  var FALLBACK_SCREEN = function () {
    return EM.screens.home.render();
  };

  /**
   * Redesenha a tela ativa e sincroniza o estado visual das abas.
   *
   * ⚠️ `main` (o container de rolagem) fica fora da árvore redesenhada, então
   *    a posição do scroll é preservada — como o `ScrollView` do React Native,
   *    que mantinha o conteúdo a mount.
   */
  app.render = function (options) {
    if (!screenHost) return;

    app.today(); // atualiza a data local a cada render (virada à meia-noite)

    var keepFocus = !(options && options.restoreFocus === false);
    var saved = keepFocus ? captureFocus(screenHost) : null;

    var renderer = SCREEN_RENDERERS[app.currentScreen] || FALLBACK_SCREEN;
    var isSubScreen = Object.prototype.hasOwnProperty.call(EM.MORE_ROUTES, app.currentScreen);
    dom.mount(screenHost, [isSubScreen ? buildBackRow() : null, renderer()]);
    restoreFocus(screenHost, saved);
    setDocumentTitle();
    announceStorageNotices();

    if (tabHost) {
      var activeTab = EM.tabForScreen(app.currentScreen);
      Array.prototype.forEach.call(tabHost.children, function (tab) {
        if (tab.dataset.screenId === activeTab) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
      });
    }
  };

  /* Parâmetros de rota por tela: `navigate('BRAIN_GYM', { game: 'SEQUENCE' })`
     abre direto o jogo que a rota do desafio da Tríade nomeia. Navegar não
     conclui nada: só a atividade real conclui o desafio. */
  var PARAM_HANDLERS = {
    BRAIN_GYM: function (params) {
      if (params.game && EM.screens.brainGym.openGame) EM.screens.brainGym.openGame(params.game);
    },
  };

  app.navigate = function (screenId, params) {
    var hasParams = Boolean(params) && Object.keys(params).length > 0;

    if (app.currentScreen === screenId && !hasParams) {
      // Reentrar na mesma aba leva ao topo, como puxar para baixo faria.
      screenHost.scrollTop = 0;
      return;
    }
    app.currentScreen = screenId;
    if (hasParams && PARAM_HANDLERS[screenId]) PARAM_HANDLERS[screenId](params);
    app.render({ restoreFocus: false });
    screenHost.scrollTop = 0;

    // Acessibilidade: anuncia a tela e move o foco para o seu <h1>.
    EM.announce(EM.SCREEN_TITLES[screenId] || '');
    var heading = screenHost.querySelector('h1') || screenHost.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  };

  /* ------------------------------------------------------------------------
     BARRA INFERIOR DE ABAS
     Portagem literal do tab bar do RootNavigator.
     ---------------------------------------------------------------------- */
  function buildTabBar() {
    var tabs = EM.NAV_TABS.map(function (tab) {
      var isActive = EM.tabForScreen(app.currentScreen) === tab.id;

      return h(
        'button',
        {
          type: 'button',
          class: 'tab',
          id: 'tab-' + tab.id,
          dataset: { screenId: tab.id },
          'aria-current': isActive ? 'page' : null,
          onClick: function () {
            app.navigate(tab.id);
          },
        },
        h('span', { class: 'tab-icon', 'aria-hidden': 'true' }, tab.icon),
        h('span', { class: 'tab-label' }, tab.label)
      );
    });

    /* Atalhos de teclado entre as abas (← → Home End). Todas as abas são
       botões comuns na ordem do Tab; as setas são um extra. */
    tabHost.addEventListener('keydown', function (event) {
      var focused = event.target && event.target.closest ? event.target.closest('.tab') : null;
      var index = EM.NAV_TABS.findIndex(function (tab) {
        return focused ? tab.id === focused.dataset.screenId : tab.id === EM.tabForScreen(app.currentScreen);
      });
      if (index < 0) return;

      var nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % EM.NAV_TABS.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + EM.NAV_TABS.length) % EM.NAV_TABS.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = EM.NAV_TABS.length - 1;

      if (nextIndex === null) return;

      event.preventDefault();
      var nextId = EM.NAV_TABS[nextIndex].id;
      app.navigate(nextId);
      var nextTab = tabHost.querySelector('[data-screen-id="' + nextId + '"]');
      if (nextTab) nextTab.focus();
    });

    dom.mount(tabHost, tabs);
  }

  /* ------------------------------------------------------------------------
     BOOT
     ---------------------------------------------------------------------- */
  function boot() {
    screenHost = document.getElementById('screen');
    tabHost = document.getElementById('tabbar');
    if (!screenHost || !tabHost) return;

    app.userProgress = app.loadUserProgress();
    EM.domain.progressTracker.setProgressListener(onProgressRecorded);

    buildTabBar();
    app.render({ restoreFocus: false });

    // Se o app passar a noite em aberto, a data local muda. Redesenhamos para
    // que a Tríade do Dia e os hábitos correspondam ao novo dia (cada tela
    // relê a data local a cada render, então os hábitos viram à meia-noite).
    function refreshIfDayChanged() {
      var nowLocal = EM.domain.types.todayLocalDateString(new Date());
      if (nowLocal !== app.todayLocal) app.render();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') refreshIfDayChanged();
    });

    // App aberto na virada do dia: confere a cada minuto (barato e robusto
    // contra suspensão do aparelho e ajustes de relógio).
    global.setInterval(refreshIfDayChanged, 60 * 1000);

    /* Service worker: habilita o modo offline da PWA.
       Só funciona sob http(s) — em `file://` o app segue funcionando, apenas
       sem cache offline. */
    if ('serviceWorker' in global.navigator && global.location.protocol.indexOf('http') === 0) {
      global.addEventListener('load', function () {
        global.navigator.serviceWorker.register('sw.js').catch(function () {
          /* Sem service worker não há offline, mas o app continua ok. */
        });
      });
    }
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
