/* ============================================================================
   everMind Web — js/ui/components.js
   Portagem 1:1 de `src/ui/components/*` do projeto React Native.

     AccessibleText → Text(variant, className)
     Button          → Button(props)
     Card            → Card(props)
     Badge           → Badge(props)
     Avatar          → Avatar(props)
     Progress        → Progress(props)

   Todos os `accessibilityLabel` do original foram convertidos para
   `aria-label`, mantendo as MESMAS strings em português.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var h = EM.dom.h;
  var view = EM.dom.view;
  var row = EM.dom.row;

  /* =========================================================================
     AccessibleText
     ────────────────
     O `variant` entra como classe base e o `className` é aplicado DEPOIS,
     exatamente como o template do componente original:
        className={`${styleClasses} ${className}`}
     ======================================================================= */
  var TEXT_VARIANTS = {
    body: 'text-body',
    'body-lead': 'text-body-lead',
    'title-lg': 'text-title-lg',
    'title-md': 'text-title-md',
    caption: 'text-caption',
    'mono-stat': 'text-mono-stat',
  };

  /**
   * @param {object} props
   * @param {string} props.variant
   * @param {string} [props.className]
   * @param {string} [props.as]  tag HTML (padrão 'p'; h2 para title-*)
   * @param {number} [props.level] 2 | 3 — nível do título para title-lg/md
   * @param {*} ...children
   */
  function Text(props) {
    var args = Array.prototype.slice.call(arguments);
    var config = args[0] || {};
    /* Títulos semânticos: title-lg / title-md viram <h2> (ou <h3> com
       `level: 3`) por padrão; `as` sempre vence (ex.: o único <h1> da tela).
       Para um título puramente decorativo use `as: 'p'`. */
    var tag = config.as;
    if (!tag) {
      if (config.variant === 'title-lg' || config.variant === 'title-md') {
        tag = config.level === 3 ? 'h3' : config.level === 1 ? 'h1' : 'h2';
      } else {
        tag = 'p';
      }
    }

    var merged = {
      class: EM.dom.cls([TEXT_VARIANTS[config.variant] || TEXT_VARIANTS.body, config.className || config.class]),
    };

    if (config.accessibilityLabel) merged['aria-label'] = config.accessibilityLabel;
    if (config.accessibilityRole) merged['aria-label'] = merged['aria-label'] || config.accessibilityRole;
    if (config.id) merged.id = config.id;
    if (config.style) merged.style = config.style;

    // `args[0]` foi substituído por `merged`, então precisa ser repassado
    // JUNTO com a tag. Sem isso, `h()` receberia o primeiro filho no lugar do
    // objeto de props e todas as classes seriam perdidas.
    return h.apply(null, [tag, merged].concat(args.slice(1)));
  }

  /* =========================================================================
     Button
     ───────
     variants: default | outline | secondary | ghost
     sizes:    default | lg | sm        (default → .btn-md)
     ======================================================================= */
  var BUTTON_VARIANTS = {
    default: 'btn-v-default',
    outline: 'btn-v-outline',
    secondary: 'btn-v-secondary',
    ghost: 'btn-v-ghost',
  };

  var BUTTON_SIZES = {
    default: 'btn-md',
    lg: 'btn-lg',
    sm: 'btn-sm',
  };

  function Button(props) {
    var config = props || {};
    var variant = config.variant || 'default';
    var size = config.size || 'default';
    var isLoading = Boolean(config.isLoading);
    var disabled = Boolean(config.disabled) || isLoading;

    var classes = EM.dom.cls([
      'btn',
      BUTTON_SIZES[size] || BUTTON_SIZES.default,
      BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.default,
      config.className || config.class,
      config.fullWidth ? 'btn-full' : null,
    ]);

    var domProps = {
      class: classes,
      type: 'button',
      disabled: disabled,
      'aria-label': config.accessibilityLabel,
      onClick: config.onPress || config.onClick,
    };

    if (disabled) domProps['aria-disabled'] = 'true';

    // O <ActivityIndicator> original vira um spinner com a cor da variante.
    if (isLoading) {
      return h('button', domProps, h('span', { class: 'btn-spinner', 'aria-hidden': 'true' }));
    }

    return h('button', domProps, config.label);
  }

  /* =========================================================================
     Card
     ═════
     Base: bg #121215 · border 1px #27272A · radius 24 · padding 24
     ======================================================================= */
  function Card(props) {
    var args = Array.prototype.slice.call(arguments);
    var config = args[0] || {};

    var domProps = {
      class: EM.dom.cls(['card', config.className || config.class]),
      id: config.id,
      onClick: config.onPress,
    };

    if (config.onPress) {
      domProps.role = 'button';
      domProps.tabindex = '0';
      domProps.onKeyDown = function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          config.onPress(event);
        }
      };
    }
    if (config.accessibilityLabel) domProps['aria-label'] = config.accessibilityLabel;

    // Children são variádicos, como em JSX: <Card>{a}{b}{c}</Card>
    args[0] = domProps;
    return view.apply(null, args);
  }

  /* =========================================================================
     Badge
     ══════
     `self-start` é essencial: os badges vivem dentro de containers `flex-row`.
     ======================================================================= */
  function Badge(props) {
    var config = props || {};
    return h(
      'span',
      {
        class: EM.dom.cls([
          'badge',
          'badge-v-' + (config.variant || 'default'),
          config.isMono === false ? 'font-sans' : null,
          config.className || config.class,
        ]),
        'aria-label': config.accessibilityLabel,
      },
      config.label
    );
  }

  /* =========================================================================
     Avatar
     ══════
     sizes: sm (48) · md (64) · lg (80) · xl (112)
     ======================================================================= */
  var AVATAR_SIZES = { sm: 'avatar-sm', md: 'avatar-md', lg: 'avatar-lg', xl: 'avatar-xl' };

  function Avatar(props) {
    var config = props || {};
    var emoji = config.emoji || '🧠';
    var size = AVATAR_SIZES[config.size] || AVATAR_SIZES.md;

    return h(
      'span',
      {
        class: EM.dom.cls(['avatar', size, config.className || config.class]),
        role: 'img',
        'aria-label': config.accessibilityLabel || 'Avatar do Cérebro: ' + emoji,
      },
      emoji
    );
  }

  /* =========================================================================
     Progress
     ════════
     O original usa `role="progressbar"` implícito via accessibilityValue.
     ======================================================================= */
  function Progress(props) {
    var config = props || {};
    var value = Math.max(0, Math.min(100, Number(config.value) || 0));
    var height = config.height || 14;

    return h(
      'div',
      {
        class: EM.dom.cls(['progress', config.className || config.class]),
        style: { height: height + 'px' },
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': value,
        'aria-valuetext': value + '%',
        'aria-label': config.accessibilityLabel,
      },
      h('div', { class: 'progress-fill', style: { width: value + '%' } })
    );
  }

  /* =========================================================================
     Blocos compartilhados entre telas
     (extraídos do JSX repetido, sem mudar nenhum texto ou classe)
     ======================================================================= */

  /** Cabeçalho padrão das telas: título + subtítulo + botão de volta. */
  function PageHeader(options) {
    var opts = options || {};
    return view(
      { class: 'page-header' + (opts.headerClass ? ' ' + opts.headerClass : '') },
      view(
        { class: 'flex-1' },
        Text({ variant: 'title-lg', className: 't-fg fw-extrabold', as: 'h1' }, opts.title),
        Text({ variant: 'caption', className: 't-muted' }, opts.subtitle)
      ),
      opts.action
        ? Button({
            variant: 'outline',
            size: 'sm',
            accessibilityLabel: opts.actionLabel,
            onPress: opts.onAction,
            label: opts.action,
          })
        : null
    );
  }

  /** Citação de encerramento das telas. */
  function ClosingQuote(quote) {
    return view(
      { class: 'closing-quote' },
      Text({ variant: 'caption', className: 't-center italic' }, '"' + quote + '"')
    );
  }

  /** Painel de celebração compartilhado pelos 5 jogos. */
  function Celebration(title, description) {
    return view(
      { class: 'celebration' },
      Text({ variant: 'title-md', className: 't-center mb-1' }, title),
      Text({ variant: 'body', className: 't-muted t-center' }, description)
    );
  }

  /** Card de "contador global + recompensa" (Mind Gym, Autocuidado, Afeto, Descoberta). */
  function StatsBanner(options) {
    var opts = options || {};
    return view(
      { class: 'card mb-6 b-card br-subtle p-4' },
      row(
        // Em telas estreitas a badge quebra para baixo do texto em vez de
        // sobrepô-lo (fontes >= 16px não cabem lado a lado em 320px).
        { class: 'items-center justify-between flex-wrap gap-3' },
        row(
          { class: 'items-center stats-main' },
          Text({ variant: 'body', className: 't-2xl mr-2 shrink-none' }, opts.icon),
          view(
            { class: 'flex-1' },
            Text(
              { variant: 'caption', className: 'font-mono fw-bold uppercase t-muted' },
              opts.eyebrow
            ),
            Text({ variant: 'body', className: 'fw-bold t-fg' }, opts.value)
          )
        ),
        opts.badge ? Badge({ variant: 'secondary', label: opts.badge }) : null
      )
    );
  }

  EM.ui = EM.ui || {};
  EM.ui.components = {
    Text: Text,
    Button: Button,
    Card: Card,
    Badge: Badge,
    Avatar: Avatar,
    Progress: Progress,
    PageHeader: PageHeader,
    ClosingQuote: ClosingQuote,
    Celebration: Celebration,
    StatsBanner: StatsBanner,
    TEXT_VARIANTS: TEXT_VARIANTS,
  };
})(window);
