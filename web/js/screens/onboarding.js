/* ============================================================================
   everMind Web — js/screens/onboarding.js
   Boas-vindas de primeira execução: camada em tela cheia (NÃO é uma rota) com
   3 passos curtos. Aparece uma única vez (flag `onboarding_done`), nunca para
   quem já tem progresso, e pode ser pulada ou revista em Ajustes.

   Acessibilidade: role="dialog" aria-modal, o app por trás fica `inert`, o foco
   vai para o título de cada passo (que também é anunciado), tudo operável por
   teclado (Enter no campo de nome avança). Sem Escape: nada some por acidente.
   ========================================================================== */
(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  EM.screens = EM.screens || {};

  var DONE_KEY = 'onboarding_done';
  var TOTAL = 3;
  var layer = null;

  function storage() { return EM.app.storage; }

  function readName() {
    try {
      var v = storage().get(EM.domain.types.STORAGE_KEY_USER_NAME);
      return typeof v === 'string' ? v.trim().slice(0, 40) : '';
    } catch (e) { return ''; }
  }

  function writeName(value) {
    var name = String(value || '').trim().slice(0, 40);
    if (name) storage().set(EM.domain.types.STORAGE_KEY_USER_NAME, name);
    else storage().remove(EM.domain.types.STORAGE_KEY_USER_NAME);
  }

  function hasProgress() {
    var p = EM.app && EM.app.userProgress;
    if (!p) return false;
    return (p.totalCompletedChallenges || 0) > 0 ||
      (p.activeDates && p.activeDates.length > 0) ||
      (p.completionLog && p.completionLog.length > 0) ||
      Object.keys(p.triadCompletions || {}).length > 0;
  }

  function isDone() { return storage().get(DONE_KEY) === true; }

  function setBackgroundInert(on) {
    var appEl = global.document.getElementById('app');
    if (!appEl) return;
    if (on) {
      appEl.setAttribute('aria-hidden', 'true');
      appEl.inert = true;
    } else {
      appEl.removeAttribute('aria-hidden');
      appEl.inert = false;
    }
  }

  function close(opts) {
    if (!layer) return;
    var input = layer.querySelector('input');
    if (opts && opts.saveName && input) writeName(input.value);
    if (EM.pwa && layer.__pwaListener) EM.pwa.offChange(layer.__pwaListener);
    layer.parentNode.removeChild(layer);
    layer = null;
    setBackgroundInert(false);
    if (!(opts && opts.review)) storage().set(DONE_KEY, true);
    if (EM.pwa) EM.pwa.resume();
    EM.app.render({ restoreFocus: false });
    var heading = global.document.querySelector('#screen h1');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    if (opts && opts.announce) EM.announce(opts.announce);
  }

  function installBlock() {
    var h = EM.dom.h;
    var kind = EM.pwa ? EM.pwa.installKind() : null;
    if (kind === 'prompt') {
      return h('div', { class: 'ob-install' },
        h('p', { class: 'ob-line' }, 'Dica: coloque o everMind na tela inicial para abri-lo com um toque.'),
        h('button', {
          type: 'button', class: 'btn btn-sm btn-v-outline',
          onClick: function () { EM.pwa.promptInstall(); },
        }, 'Adicionar à tela inicial'));
    }
    if (kind === 'ios') {
      return h('p', { class: 'ob-line ob-install' },
        'Dica: toque em Compartilhar e depois em “Adicionar à Tela de Início” para abrir o everMind com um toque.');
    }
    return null;
  }

  function stepContent(n, state) {
    var h = EM.dom.h;
    if (n === 1) {
      return [
        h('p', { class: 'ob-emoji', 'aria-hidden': 'true' }, '🌱'),
        h('h1', { class: 'ob-title', tabindex: '-1' }, 'Bem-vindo ao everMind'),
        h('p', { class: 'ob-line' }, '3 passos por dia, no seu ritmo'),
      ];
    }
    if (n === 2) {
      var input = h('input', {
        id: 'ob-name', class: 'ob-input', type: 'text', name: 'given-name',
        autocomplete: 'given-name', autocapitalize: 'words', enterkeyhint: 'next',
        maxlength: '40', value: state.name || '',
      });
      input.value = state.name || '';
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); go(3); }
      });
      input.addEventListener('input', function () { state.name = input.value; });
      return [
        h('h1', { class: 'ob-title', tabindex: '-1' }, 'Como posso te chamar?'),
        h('label', { class: 'ob-label', for: 'ob-name' }, 'Seu nome (se quiser)'),
        input,
        h('p', { class: 'ob-hint' }, 'Pode deixar em branco. Você muda isso quando quiser em Ajustes.'),
      ];
    }
    return [
      h('p', { class: 'ob-emoji', 'aria-hidden': 'true' }, '🔒'),
      h('h1', { class: 'ob-title', tabindex: '-1' }, 'Tudo com tranquilidade'),
      h('p', { class: 'ob-line' }, 'Seus dados ficam só neste aparelho'),
      h('p', { class: 'ob-line' }, 'Funciona sem internet'),
      installBlock(),
    ];
  }

  var state = { name: '', step: 1, review: false };

  function go(n) {
    // guarda o que foi digitado antes de trocar de passo
    var typed = layer && layer.querySelector('input');
    if (typed) state.name = typed.value;
    state.step = n;
    draw(true);
  }

  function draw(moveFocus) {
    var h = EM.dom.h;
    var n = state.step;
    var last = n === TOTAL;

    var dots = [];
    for (var i = 1; i <= TOTAL; i++) {
      dots.push(h('span', { class: 'ob-dot' + (i === n ? ' ob-dot-on' : ''), 'aria-hidden': 'true' }));
    }

    var actions = h('div', { class: 'ob-actions' },
      h('button', {
        type: 'button', class: 'btn btn-md btn-v-default ob-next', 'data-ob': 'next',
        onClick: function () {
          if (last) {
            var input = layer.querySelector('input');
            if (input) state.name = input.value;
            writeName(state.name);
            close({ review: state.review, announce: 'Tudo pronto. Boa jornada!' });
          } else go(n + 1);
        },
      }, last ? 'Começar' : 'Continuar'),
      last ? null : h('button', {
        type: 'button', class: 'btn btn-sm btn-v-ghost ob-skip',
        onClick: function () {
          // Pular: não guarda nada digitado no passo do nome.
          close({ review: state.review, announce: 'Boas-vindas puladas.' });
        },
      }, 'Pular')
    );

    var body = h('div', { class: 'ob-card' },
      h('p', { class: 'ob-step' }, 'Passo ' + n + ' de ' + TOTAL),
      h('div', { class: 'ob-dots' }, dots),
      stepContent(n, state),
      actions
    );

    if (!layer) {
      layer = h('div', {
        id: 'onboarding', class: 'onboarding', role: 'dialog', 'aria-modal': 'true',
        'aria-label': 'Boas-vindas ao everMind',
      });
      global.document.body.appendChild(layer);
      setBackgroundInert(true);
      if (EM.pwa) {
        layer.__pwaListener = function () { if (state.step === TOTAL) draw(false); };
        EM.pwa.onChange(layer.__pwaListener);
      }
    }
    EM.dom.mount(layer, body);

    if (moveFocus) {
      var heading = layer.querySelector('h1');
      if (heading) heading.focus({ preventScroll: true });
      var title = heading ? heading.textContent : '';
      EM.announce('Passo ' + n + ' de ' + TOTAL + '. ' + title);
    }
  }

  function show(opts) {
    if (layer) return;
    state = { name: readName(), step: 1, review: !!(opts && opts.review) };
    draw(true);
  }

  function maybeShow() {
    if (!EM.app || !EM.app.storage) return;
    if (isDone()) return;
    if (hasProgress()) { storage().set(DONE_KEY, true); return; }
    show({});
  }

  EM.onboarding = { show: show, maybeShow: maybeShow, isDone: isDone };

  function start() { global.setTimeout(maybeShow, 0); }
  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
