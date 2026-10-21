/* ============================================================================
   everMind Web — js/pwa.js
   Camada PWA: atualização automática do service worker e convite gentil para
   instalar o app na tela inicial (Android/desktop via beforeinstallprompt,
   iOS via instrução manual). Nunca insiste: dispensado uma vez, não volta.
   ========================================================================== */
(function (global) {
  'use strict';

  var DISMISS_KEY = 'evermind:install_hint_dismissed';
  var deferredPrompt = null;
  var banner = null;

  function safeGet(key) {
    try { return global.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { global.localStorage.setItem(key, value); } catch (e) { /* noop */ }
  }

  function isStandalone() {
    return (
      (global.matchMedia && global.matchMedia('(display-mode: standalone)').matches) ||
      global.navigator.standalone === true
    );
  }

  function isIos() {
    var ua = global.navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && global.navigator.maxTouchPoints > 1);
  }

  function hideBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  var pending = null;

  function showBanner(text, actionLabel, onAction) {
    if (banner || isStandalone() || safeGet(DISMISS_KEY)) return;
    // Durante a boas-vindas (camada em tela cheia) o convite espera a sua vez.
    if (global.document.getElementById('onboarding')) {
      pending = [text, actionLabel, onAction];
      return;
    }

    var h = EM.dom.h;
    var close = h('button', { type: 'button', class: 'install-hint-btn', 'aria-label': 'Agora não' }, 'Agora não');
    close.addEventListener('click', function () {
      safeSet(DISMISS_KEY, '1');
      hideBanner();
    });

    var children = [h('p', { class: 'install-hint-text' }, text)];
    var actions = h('div', { class: 'install-hint-actions' });
    if (actionLabel) {
      var act = h('button', { type: 'button', class: 'install-hint-btn install-hint-primary' }, actionLabel);
      act.addEventListener('click', onAction);
      actions.appendChild(act);
    }
    actions.appendChild(close);
    children.push(actions);

    banner = h('aside', { class: 'install-hint', role: 'region', 'aria-label': 'Instalar o everMind' }, children);
    global.document.body.appendChild(banner);
  }

  global.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredPrompt = event;
    listeners.forEach(function (fn) { fn(); });
    showBanner('Quer ter o everMind na tela inicial, sempre à mão?', 'Instalar', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt = null;
      hideBanner();
    });
  });

  /* API para a boas-vindas: mesma lógica de "instalável" do convite acima. */
  var listeners = [];
  global.EM = global.EM || {};
  global.EM.pwa = {
    isStandalone: isStandalone,
    isIos: isIos,
    /** 'prompt' (Android/desktop), 'ios' (instrução manual) ou null. */
    installKind: function () {
      if (isStandalone()) return null;
      if (deferredPrompt) return 'prompt';
      if (isIos()) return 'ios';
      return null;
    },
    promptInstall: function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt = null;
      hideBanner();
      listeners.forEach(function (fn) { fn(); });
    },
    onChange: function (fn) { listeners.push(fn); },
    offChange: function (fn) { listeners = listeners.filter(function (f) { return f !== fn; }); },
    /** Chamado quando a boas-vindas fecha: mostra o convite que ficou à espera. */
    resume: function () {
      if (pending) { var p = pending; pending = null; showBanner(p[0], p[1], p[2]); }
    },
  };

  global.addEventListener('appinstalled', function () {
    safeSet(DISMISS_KEY, '1');
    hideBanner();
  });

  if (isIos() && !isStandalone()) {
    global.setTimeout(function () {
      showBanner('Para ter o everMind na tela inicial: toque em Compartilhar e depois em “Adicionar à Tela de Início”.', null, null);
    }, 4000);
  }

  /* ---- Estado offline ---------------------------------------------------
     Pílula calma (sem vermelho, sem alarme) só enquanto estiver sem internet.
     O app é offline-first: a mensagem tranquiliza em vez de alertar. */
  var OFFLINE_TEXT = 'Sem internet — tudo continua funcionando';
  var pill = null;
  var lastOnline = null;

  function syncOnlineState(announce) {
    pill = pill || global.document.getElementById('offline-pill');
    var online = global.navigator.onLine !== false;
    if (pill) pill.hidden = online;
    if (announce && lastOnline !== null && lastOnline !== online && EM.announce) {
      EM.announce(online ? 'Internet de volta' : OFFLINE_TEXT);
    }
    lastOnline = online;
  }
  global.addEventListener('online', function () { syncOnlineState(true); });
  global.addEventListener('offline', function () { syncOnlineState(true); });
  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', function () { syncOnlineState(false); });
  } else {
    syncOnlineState(false);
  }

  /* Nova versão: ativa sozinha (skipWaiting) e recarregamos quando o app sai
     de vista, para nunca interromper um jogo em andamento.
     Primeira vez que o SW assume o controle: aviso único de "pronto offline". */
  var READY_KEY = 'evermind:offline_ready_shown';
  if ('serviceWorker' in global.navigator) {
    var hadController = !!global.navigator.serviceWorker.controller;
    global.navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController) {
        hadController = true;
        if (!safeGet(READY_KEY)) {
          safeSet(READY_KEY, '1');
          if (EM.showToast) EM.showToast('Pronto para usar sem internet', 4000);
        }
        return;
      }
      global.document.addEventListener('visibilitychange', function onHide() {
        if (global.document.visibilityState === 'hidden') global.location.reload();
      });
    });
  }
})(window);
