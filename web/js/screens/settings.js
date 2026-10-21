/* ============================================================================
   everMind Web — js/screens/settings.js
   Ajustes (rota SETTINGS, sub-tela de "Mais"): nome, tamanho do texto, som,
   vibração, rever boas-vindas, apagar dados (2 passos) e rodapé com versão.

   Preferências (gateway, prefixo evermind:):
     settings_text_size  → 100 | 115 | 130  (% do font-size do <html>)
     settings_sound      → boolean (padrão true)
     settings_vibration  → boolean (padrão true)
   O tamanho do texto também é aplicado por um mini-script no <head> do
   index.html, antes da primeira pintura (sem "pisca").
   ========================================================================== */
(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  EM.screens = EM.screens || {};
  EM.VERSION = '0.1.0';

  var SIZES = [
    { pct: 100, label: 'A−', name: 'texto menor (padrão)' },
    { pct: 115, label: 'A', name: 'texto médio' },
    { pct: 130, label: 'A+', name: 'texto maior' },
  ];

  var confirmingDelete = false;

  function store() { return EM.app.storage; }

  function getSize() {
    var v = store().get('settings_text_size');
    return v === 115 || v === 130 ? v : 100;
  }
  function applySize(pct) {
    global.document.documentElement.style.fontSize = pct === 100 ? '' : pct + '%';
  }
  function getFlag(key) { return store().get(key) !== false; }

  function readName() {
    var v = store().get(EM.domain.types.STORAGE_KEY_USER_NAME);
    return typeof v === 'string' ? v.trim().slice(0, 40) : '';
  }

  function saveName(value) {
    var name = String(value || '').trim().slice(0, 40);
    if (name) store().set(EM.domain.types.STORAGE_KEY_USER_NAME, name);
    else store().remove(EM.domain.types.STORAGE_KEY_USER_NAME);
    EM.showToast(name ? 'Pronto, vou te chamar de ' + name : 'Tudo bem, sem nome por aqui', 2600);
    EM.app.render();
  }

  function eraseEverything() {
    // Apaga TODAS as chaves evermind:* (progresso, nome, ajustes, avisos).
    store().clear();
    try {
      var doomed = [];
      for (var i = 0; i < global.localStorage.length; i++) {
        var k = global.localStorage.key(i);
        if (k && k.indexOf('evermind:') === 0) doomed.push(k);
      }
      doomed.forEach(function (k) { global.localStorage.removeItem(k); });
    } catch (e) { /* noop */ }
    global.location.reload();
  }

  function section(title, children) {
    var C = EM.ui.components;
    return EM.dom.h('section', { class: 'set-section', 'aria-label': title },
      C.Text({ variant: 'title-md', level: 2, className: 'set-heading' }, title),
      children);
  }

  function switchRow(opts) {
    var h = EM.dom.h;
    return h('button', {
      type: 'button', class: 'set-switch', role: 'switch',
      'aria-checked': opts.on ? 'true' : 'false',
      dataset: { focusKey: opts.key },
      onClick: function () {
        var next = !opts.on;
        store().set(opts.storageKey, next);
        EM.app.render();
        EM.announce(opts.label + (next ? ' ligado' : ' desligado'));
        if (next && opts.onTurnOn) opts.onTurnOn();
      },
    },
      h('span', { class: 'set-switch-text' },
        h('span', { class: 'set-switch-label' }, opts.label),
        h('span', { class: 'set-switch-desc' }, opts.desc)),
      h('span', { class: 'set-switch-state' + (opts.on ? ' is-on' : '') },
        h('span', { class: 'set-switch-knob', 'aria-hidden': 'true' }),
        h('span', null, opts.on ? 'Ligado' : 'Desligado')));
  }

  function render() {
    var C = EM.ui.components;
    var h = EM.dom.h;
    var view = EM.dom.view;
    var size = getSize();

    /* ---- Nome ---- */
    var nameInput = h('input', {
      id: 'set-name', class: 'ob-input', type: 'text', name: 'given-name',
      autocomplete: 'given-name', autocapitalize: 'words', maxlength: '40',
      enterkeyhint: 'done',
    });
    nameInput.value = readName();
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveName(nameInput.value); }
    });
    var nameBlock = section('Seu nome', view({ class: 'set-card' },
      h('label', { class: 'ob-label', for: 'set-name' }, 'Como posso te chamar?'),
      nameInput,
      C.Button({
        variant: 'outline', size: 'sm', label: 'Salvar nome', className: 'set-save',
        onPress: function () { saveName(nameInput.value); },
      })));

    /* ---- Tamanho do texto ---- */
    var sizeButtons = SIZES.map(function (s) {
      return h('button', {
        type: 'button', class: 'set-size' + (s.pct === size ? ' is-on' : ''),
        'aria-pressed': s.pct === size ? 'true' : 'false',
        'aria-label': s.label + ', ' + s.name,
        dataset: { focusKey: 'size-' + s.pct },
        onClick: function () {
          store().set('settings_text_size', s.pct);
          applySize(s.pct);
          EM.app.render();
          EM.announce('Tamanho do texto: ' + s.name);
        },
      }, s.label);
    });
    var sizeBlock = section('Tamanho do texto', view({ class: 'set-card' },
      h('div', { class: 'set-size-row', role: 'group', 'aria-label': 'Tamanho do texto' }, sizeButtons),
      C.Text({ variant: 'caption', className: 'set-preview' }, 'Assim fica o tamanho das letras no everMind.')));

    /* ---- Som e vibração ---- */
    var soundBlock = section('Som e vibração', view({ class: 'set-card' },
      switchRow({
        key: 'sound', label: 'Som', desc: 'Sons suaves ao acertar e ao evoluir',
        on: getFlag('settings_sound'), storageKey: 'settings_sound',
        onTurnOn: function () { if (EM.audio) EM.audio.playSuccess(); },
      }),
      switchRow({
        key: 'vibration', label: 'Vibração', desc: 'Um toque leve no aparelho',
        on: getFlag('settings_vibration'), storageKey: 'settings_vibration',
        onTurnOn: function () { EM.vibrate(12); },
      })));

    /* ---- Boas-vindas e dados ---- */
    var dataChildren = [
      C.Button({
        variant: 'outline', label: 'Rever boas-vindas', fullWidth: true,
        onPress: function () { EM.onboarding.show({ review: true }); },
      }),
    ];
    if (!confirmingDelete) {
      dataChildren.push(C.Button({
        variant: 'outline', label: 'Apagar meus dados', fullWidth: true,
        onPress: function () {
          confirmingDelete = true;
          EM.app.render({ restoreFocus: false });
          var first = global.document.querySelector('[data-focus-key="keep-data"]');
          if (first) first.focus();
          EM.announce('Confirmação: tem certeza que quer apagar seus dados?');
        },
      }));
    } else {
      dataChildren.push(h('div', { class: 'set-confirm', role: 'group', 'aria-labelledby': 'set-confirm-title' },
        h('p', { id: 'set-confirm-title', class: 'set-confirm-title' }, 'Quer mesmo começar do zero?'),
        h('p', { class: 'set-confirm-text' },
          'Vamos apagar seu progresso, conquistas e ajustes deste aparelho. Não dá para desfazer. Seus dados não estão em nenhum outro lugar.'),
        h('button', {
          type: 'button', class: 'btn btn-md btn-v-default btn-full', dataset: { focusKey: 'keep-data' },
          onClick: function () {
            confirmingDelete = false;
            EM.app.render({ restoreFocus: false });
            EM.announce('Tudo bem, seus dados continuam aqui.');
          },
        }, 'Manter meus dados'),
        h('button', {
          type: 'button', class: 'btn btn-md btn-v-outline btn-full',
          onClick: function () { eraseEverything(); },
        }, 'Sim, apagar tudo e recomeçar')));
    }
    var dataBlock = section('Boas-vindas e dados', view({ class: 'set-card' }, dataChildren));

    var footer = h('footer', { class: 'set-footer' },
      h('p', null, 'everMind versão ' + EM.VERSION),
      h('p', null, 'Seus dados ficam só neste aparelho'));

    return view({},
      C.PageHeader({ title: 'Ajustes', subtitle: 'Deixe o everMind do seu jeito' }),
      nameBlock, sizeBlock, soundBlock, dataBlock, footer);
  }

  EM.screens.settings = {
    render: render,
    applyTextSize: applySize,
  };

  // Sair da tela cancela uma confirmação em aberto.
  var origNavigate = null;
  function hook() {
    if (!EM.app || origNavigate) return;
    origNavigate = EM.app.navigate;
    EM.app.navigate = function (id, params) {
      if (id !== 'SETTINGS') confirmingDelete = false;
      return origNavigate.call(EM.app, id, params);
    };
  }
  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', hook);
  else hook();

  // Garantia: se o mini-script do <head> não rodou, aplica antes do 1º render.
  try { applySize(getSize()); } catch (e) { /* EM.app ainda não existe: o head cuida */ }
})(window);
