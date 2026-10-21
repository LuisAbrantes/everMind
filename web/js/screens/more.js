/* ============================================================================
   everMind Web — js/screens/more.js
   Aba "Mais": porta de entrada para Afeto, Descobrir, Semana e (quando a fase
   de Ajustes existir) Ajustes. Botões grandes (>= 64px) para seniores.
   ========================================================================== */
(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  EM.screens = EM.screens || {};

  function render() {
    var C = EM.ui.components;
    var h = EM.dom.h;
    var view = EM.dom.view;

    var order = ['SOCIAL_CONNECTION', 'DISCOVERY', 'WEEKLY_SUMMARY'];
    // "Ajustes" só aparece quando a tela existir (fase posterior).
    if (EM.screens.settings) order.push('SETTINGS');

    var items = order.map(function (id) {
      var meta = EM.MORE_ROUTES[id];
      return h(
        'button',
        {
          type: 'button',
          class: 'more-item',
          dataset: { focusKey: 'more-' + id },
          onClick: function () {
            EM.app.navigate(id);
          },
        },
        h('span', { class: 'more-item-icon', 'aria-hidden': 'true' }, meta.icon),
        h(
          'span',
          { class: 'more-item-text' },
          h('span', { class: 'more-item-title' }, meta.label),
          h('span', { class: 'more-item-desc' }, meta.desc)
        ),
        h('span', { class: 'more-item-chevron', 'aria-hidden': 'true' }, '›')
      );
    });

    return view(
      {},
      C.PageHeader({ title: 'Mais', subtitle: 'Outras áreas do everMind' }),
      h('div', { class: 'more-list' }, items)
    );
  }

  EM.screens.more = { render: render };
})(window);
