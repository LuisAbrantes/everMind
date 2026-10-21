/* ============================================================================
   everMind Web — js/core/store.js
   Substitui o ciclo `useState` + re-render do React por um store observável.

   Estratégia de renderização
   ──────────────────────────
   O projeto React Native NÃO usa animações: cada interação é uma troca
   instantânea de estado seguida de re-render. Portanto a estratégia mais
   fiel — e mais simples — é redesenhar a tela inteira a cada mudança de
   estado, exatamente como o React faria.

   Dois cuidados necessários:
     1. O container de rolagem (`.screen-scroll`) fica FORA da árvore
        redesenhada, então a posição do scroll nunca é perdida.
     2. Efeitos com ciclo de vida (o único `useEffect` do app original é o
        `setInterval` de 1s do cronômetro) ficam no "controlador", fora do
        caminho de render, para não recriar o intervalo a cada redesenho.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /* ------------------------------------------------------------------------
     Store observável minimalista.
     ---------------------------------------------------------------------- */
  function createStore(initialState) {
    var state = initialState || {};
    var listeners = [];

    return {
      get: function () {
        return state;
      },

      /** Substitui o estado (shallow merge opcional) e notifica. */
      set: function (patch) {
        var next = patch;
        if (patch && typeof patch === 'object' && !Array.isArray(patch)) {
          next = {};
          for (var key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) next[key] = state[key];
          }
          for (var patchKey in patch) {
            if (Object.prototype.hasOwnProperty.call(patch, patchKey)) next[patchKey] = patch[patchKey];
          }
        }
        var changed = next !== state;
        state = next;
        if (changed) {
          for (var i = 0; i < listeners.length; i++) listeners[i](state);
        }
        return state;
      },

      /** Atualiza sem notificar (para evitar renders dentro de render). */
      patch: function (patch) {
        if (!patch) return state;
        for (var key in patch) {
          if (Object.prototype.hasOwnProperty.call(patch, key)) state[key] = patch[key];
        }
        return state;
      },

      subscribe: function (listener) {
        listeners.push(listener);
        return function unsubscribe() {
          var index = listeners.indexOf(listener);
          if (index >= 0) listeners.splice(index, 1);
        };
      },

      getListenerCount: function () {
        return listeners.length;
      },
    };
  }

  /* ------------------------------------------------------------------------
     Roteador de telas — portagem do RootNavigator.tsx

     O RootNavigator original é um `useState<RootScreenName>` + um `switch`
     que renderiza a tela ativa, mais um tab bar (agora 5 abas; Afeto/Descobrir/Semana vivem em "Mais"). Aqui o estado é
     global e a renderização acontece em `app.js`.
     ---------------------------------------------------------------------- */
  var NAV_TABS = [
    { id: 'HOME', label: 'Hoje', icon: '☀️' },
    { id: 'BRAIN_GYM', label: 'Mente', icon: '🧠' },
    { id: 'BODY_MOVEMENT', label: 'Corpo', icon: '🚶' },
    { id: 'SELF_CARE', label: 'Cuidado', icon: '🌿' },
    { id: 'MORE', label: 'Mais', icon: '⋯' },
  ];

  /* Telas alcançadas a partir da aba "Mais". Enquanto o usuário estiver em
     uma delas a aba "Mais" fica marcada como atual e a tela ganha "Voltar". */
  var MORE_ROUTES = {
    SOCIAL_CONNECTION: { label: 'Afeto', icon: '❤️', desc: 'Ligações e carinho com quem você ama' },
    DISCOVERY: { label: 'Descobrir', icon: '🎲', desc: 'Uma surpresa curiosa para o seu dia' },
    WEEKLY_SUMMARY: { label: 'Semana', icon: '🌟', desc: 'Suas conquistas dos últimos 7 dias' },
    SETTINGS: { label: 'Ajustes', icon: '⚙️', desc: 'Deixe o everMind do seu jeito' },
  };

  /** Título curto de cada tela (document.title e anúncio para leitores de tela). */
  var SCREEN_TITLES = {
    HOME: 'Hoje',
    BRAIN_GYM: 'Mente',
    BODY_MOVEMENT: 'Corpo',
    SELF_CARE: 'Cuidado',
    MORE: 'Mais',
    SOCIAL_CONNECTION: 'Afeto',
    DISCOVERY: 'Descobrir',
    WEEKLY_SUMMARY: 'Semana',
    SETTINGS: 'Ajustes',
  };

  /** Aba que deve ficar marcada para a tela `id`. */
  function tabForScreen(id) {
    return Object.prototype.hasOwnProperty.call(MORE_ROUTES, id) ? 'MORE' : id;
  }

  var router = createStore({ screen: 'HOME' });

  /** Portagem literal de `handleNavigateFromHomeChallenge`. */
  function routeForChallenge(route) {
    if (!route) return 'HOME';
    if (route.indexOf('brain-gym') >= 0) return 'BRAIN_GYM';
    if (route.indexOf('movement') >= 0) return 'BODY_MOVEMENT';
    if (route.indexOf('selfcare') >= 0) return 'SELF_CARE';
    if (route.indexOf('connection') >= 0) return 'SOCIAL_CONNECTION';
    return 'HOME';
  }

  /* ------------------------------------------------------------------------
     Camada de avisos (toast) + háptica real.
     Substitui o MockFeedbackService, que no app original só incrementava
     contadores e não produzia nenhum efeito perceptível.
     ---------------------------------------------------------------------- */
  var toastLayer = null;
  var toastSeq = 0;

  function getToastLayer() {
    if (toastLayer) return toastLayer;
    toastLayer = document.getElementById('toast-layer');
    return toastLayer;
  }

  var srTimer = null;

  /** Anuncia `message` de forma educada (polite) para leitores de tela. */
  function announce(message) {
    var region = global.document.getElementById('sr-status');
    if (!region || !message) return;
    region.textContent = '';
    if (srTimer) global.clearTimeout(srTimer);
    // Limpar e preencher em seguida garante que a mesma frase seja relida.
    srTimer = global.setTimeout(function () {
      region.textContent = String(message);
    }, 60);
  }

  function showToast(message, duration) {
    var layer = getToastLayer();
    if (!layer || !message) return;

    var dom = EM.dom;
    /* O aviso visual é ocultado da árvore de acessibilidade: o anúncio é feito
       UMA vez pela região #sr-status (sem aria-live aninhado/assertivo). */
    var node = dom.h(
      'div',
      { class: 'toast', 'aria-hidden': 'true', dataset: { toastId: String(++toastSeq) } },
      String(message)
    );
    announce(message);

    layer.appendChild(node);

    var life = duration || 2600;
    global.setTimeout(function () {
      node.classList.add('toast-fading');
      global.setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 320);
    }, life);

    // Nunca deixa mais de 3 avisos empilhados.
    while (layer.children.length > 3) {
      layer.removeChild(layer.firstChild);
    }
  }

  /** Respeita prefers-reduced-motion e a ausência de suporte a vibração. */
  function vibrate(pattern) {
    try {
      if (global.navigator && typeof global.navigator.vibrate === 'function') {
        global.navigator.vibrate(pattern);
      }
    } catch (error) {
      /* noop */
    }
  }

  EM.store = createStore;
  EM.router = router;
  EM.NAV_TABS = NAV_TABS;
  EM.MORE_ROUTES = MORE_ROUTES;
  EM.SCREEN_TITLES = SCREEN_TITLES;
  EM.tabForScreen = tabForScreen;
  EM.announce = announce;
  EM.routeForChallenge = routeForChallenge;
  EM.showToast = showToast;
  EM.vibrate = vibrate;
})(window);
