/* ============================================================================
   everMind Web — js/core/dom.js
   Camada mínima de construção de DOM que substitui o JSX/React.

   Objetivo: reproduzir a árvore de componentes do React Native com o mínimo
   de mágica possível, mantendo os mesmos textos, a mesma ordem dos elementos e
   as mesmas classes utilitárias.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /** Normaliza className: string, array ou objeto { cls: cond } */
  function cls(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return value
        .map(cls)
        .filter(Boolean)
        .join(' ');
    }
    var out = [];
    for (var key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key) && value[key]) out.push(key);
    }
    return out.join(' ');
  }

  /** Escapa texto para uso em atributos (aria-label, title). */
  function escapeAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * h('div', { class: 'card' }, 'texto', filhoNode)
   *
   * Propriedades especiais:
   *   class / className  → className
   *   style              → objeto de estilos inline
   *   onClick, onPress   → addEventListener('click', fn)
   *   onKeyDown          → addEventListener('keydown', fn)
   *   dataset            → objeto → data-*
   *   ref                → função receives(node)
   *   <qualquer outra>   → setAttribute(kebab-case, valor)
   */
  function h(tag, props) {
    var node = document.createElement(tag);
    var i;

    if (props && typeof props === 'object' && !(props instanceof Node) && !Array.isArray(props)) {
      for (var key in props) {
        if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
        var value = props[key];

        if (value == null || value === false) continue;

        if (key === 'class' || key === 'className') {
          node.className = cls(value);
        } else if (key === 'style') {
          if (typeof value === 'string') {
            node.setAttribute('style', value);
          } else {
            for (var styleKey in value) {
              if (Object.prototype.hasOwnProperty.call(value, styleKey)) {
                node.style[styleKey] = value[styleKey];
              }
            }
          }
        } else if (key === 'dataset') {
          for (var dataKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, dataKey)) {
              node.dataset[dataKey] = value[dataKey];
            }
          }
        } else if (key === 'onClick' || key === 'onPress') {
          node.addEventListener('click', value);
        } else if (key.indexOf('on') === 0 && typeof value === 'function') {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'ref' && typeof value === 'function') {
          value(node);
        } else if (key === 'dangerouslySetInnerHTML') {
          node.innerHTML = value.__html;
        } else if (value === true) {
          node.setAttribute(toKebab(key), '');
        } else {
          node.setAttribute(toKebab(key), String(value));
        }
      }
    } else if (props != null) {
      // Segundo argumento que já é filho: h('br'), h('div', 'texto')
      appendChild(node, props);
    }

    for (i = 2; i < arguments.length; i++) {
      appendChild(node, arguments[i]);
    }

    return node;
  }

  function toKebab(key) {
    if (key === 'htmlFor') return 'for';
    if (key === 'readOnly') return 'readonly';
    if (key === 'tabIndex') return 'tabindex';
    if (key === 'maxLength') return 'maxlength';
    return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function appendChild(parent, child) {
    if (child == null || child === false || child === true) return;
    if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++) appendChild(parent, child[i]);
      return;
    }
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  /** <div> — equivale ao <View> do React Native (flex column) */
  function view(props) {
    var args = Array.prototype.slice.call(arguments);
    if (args[0] == null || typeof args[0] === 'string' || args[0] instanceof Node) {
      args.unshift({ class: 'v' });
    } else {
      var p = args[0];
      p.class = cls(['v', p.class || p.className]);
    }
    return h.apply(null, ['div'].concat(args));
  }

  /** <div class="v row"> — equivale ao <View className="flex-row"> */
  function row(props) {
    var args = Array.prototype.slice.call(arguments);
    if (args[0] == null || typeof args[0] === 'string' || args[0] instanceof Node) {
      args.unshift({ class: 'v row' });
    } else {
      var p = args[0];
      p.class = cls(['v', 'row', p.class || p.className]);
    }
    return h.apply(null, ['div'].concat(args));
  }

  /** Texto puro — equivale ao <Text> "solto" dentro de um Pressable. */
  function text(value) {
    return document.createTextNode(String(value == null ? '' : value));
  }

  /** Limpa um nó de forma performática. */
  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  /** Substitui todo o conteúdo de `host` por `children`. */
  function mount(host, children) {
    clear(host);
    appendChild(host, children);
    return host;
  }

  /** Mostra/oculta. */
  function toggle(node, visible) {
    if (node) node.hidden = !visible;
  }

  EM.dom = {
    h: h,
    view: view,
    row: row,
    text: text,
    cls: cls,
    clear: clear,
    mount: mount,
    toggle: toggle,
    escapeAttr: escapeAttr,
    escapeHtml: escapeAttr,
  };
})(window);
