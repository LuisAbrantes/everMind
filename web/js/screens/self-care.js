/* ============================================================================
   everMind Web — js/screens/self-care.js
   Tela 4 — "Cuidado" / Cuide de Você.

   Portagem 1:1 de `src/screens/SelfCareScreen/`:
     index.tsx + useSelfCare.ts + SelfCareView.tsx

   Pilar Autocuidado com 3 hábitos:
     1. Hora da Água      (meta: 4 copos)
     2. Prato Colorido    (fruta ou vegetal)
     3. Sono Restaurador  (higiene do sono)
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var view = EM.dom.view;
  var row = EM.dom.row;
  var C = EM.ui.components;

  var habits = EM.domain.habitsCoordinator;

  var state = null;

  function ensureState() {
    var app = EM.app;
    // Data LOCAL recalculada a cada render (os hábitos viram à meia-noite local).
    var todayStr = app.today();
    if (state) {
      // Corpo grava no mesmo estado de hábitos: relê para não sobrescrever.
      state.todayStr = todayStr;
      state.habitsState = habits.loadState(app.storage, todayStr);
      return state;
    }
    state = { todayStr: todayStr, habitsState: habits.loadState(app.storage, todayStr) };
    return state;
  }

  /** Cada copo aparece na tela; os pontos só vêm UMA vez, na meta do dia. */
  function handleAddWater() {
    var s = ensureState();
    var wasMet = s.habitsState.selfCare.isWaterGoalMet;
    s.habitsState = habits.addWaterGlass(EM.app.storage, s.habitsState, s.todayStr);
    EM.app.refreshUserProgress();
    if (!wasMet && s.habitsState.selfCare.isWaterGoalMet) {
      EM.app.feedback.triggerSuccessFeedback();
      EM.showToast('Meta de água de hoje alcançada! +10 pontos de crescimento 💧');
    } else {
      EM.app.feedback.triggerSelectFeedback();
    }
    EM.app.render();
  }

  function handleConfirmFruitVeggie() {
    var s = ensureState();
    var wasConfirmed = s.habitsState.selfCare.fruitVeggieConfirmed;
    s.habitsState = habits.confirmFruitVeggie(EM.app.storage, s.habitsState, s.todayStr);
    // O confirmador é idempotente: só há feedback real quando o estado muda.
    if (!wasConfirmed && s.habitsState.selfCare.fruitVeggieConfirmed) {
      EM.app.refreshUserProgress();
      EM.app.feedback.triggerSuccessFeedback();
    }
    EM.app.render();
  }

  function handleConfirmSleepRoutine() {
    var s = ensureState();
    var wasConfirmed = s.habitsState.selfCare.sleepRoutineConfirmed;
    s.habitsState = habits.confirmSleepRoutine(EM.app.storage, s.habitsState, s.todayStr);
    if (!wasConfirmed && s.habitsState.selfCare.sleepRoutineConfirmed) {
      EM.app.refreshUserProgress();
      EM.app.feedback.triggerSuccessFeedback();
    }
    EM.app.render();
  }

  /* =========================================================================
     SelfCareView.tsx
     ======================================================================= */
  function render() {
    var s = ensureState();
    var app = EM.app;
    var selfCare = s.habitsState.selfCare;

    /* Sempre mostra pelo menos 4 copos; cresce conforme o usuário bebe mais. */
    var glassCount = Math.max(4, selfCare.waterGlassesCount);
    var glasses = [];
    for (var i = 0; i < glassCount; i++) {
      var isFilled = i < selfCare.waterGlassesCount;
      glasses.push(
        view(
          {
            class: 'glass',
            dataset: { filled: isFilled ? 'true' : 'false' },
            role: 'img',
            'aria-label':
              'Copo ' + (i + 1) + (isFilled ? ', consumido' : ', ainda não consumido'),
          },
          isFilled ? '🥤' : '🥛'
        )
      );
    }

    return view(
      {},
      C.PageHeader({
        title: 'Cuide de Você',
        subtitle: 'Pilar Autocuidado & Bem-Estar Diário',
        action: '🏠 INÍCIO',
        onAction: function () {
          app.navigate('HOME');
        },
      }),

      /* Contador global */
      C.StatsBanner({
        icon: '🌿',
        eyebrow: 'HÁBITOS CULTIVADOS',
        value: selfCare.totalSelfCareActions + ' momentos de autocuidado',
        badge: '+10 PONTOS / HÁBITO',
      }),

      /* --- 1. Hora da Água ---------------------------------------------- */
      C.Card(
        { className: 'mb-5 b-card border-2 br-subtle p-5' },
        row(
          { class: 'items-center justify-between mb-2' },
          row(
            { class: 'items-center flex-1' },
            C.Text({ variant: 'body', className: 't-2xl mr-2' }, '💧'),
            C.Text({ variant: 'title-md' }, '1. Hora da Água')
          ),
          C.Badge({
            variant: selfCare.isWaterGoalMet ? 'success' : 'outline',
            label:
              selfCare.waterGlassesCount +
              ' ' +
              (selfCare.waterGlassesCount === 1 ? 'COPO' : 'COPOS'),
          })
        ),
        C.Text(
          { variant: 'body', className: 't-muted mb-4' },
          'A hidratação regular mantém suas células, articulações e cérebro ativos e saudáveis.'
        ),
        view({ class: 'glass-row' }, glasses),
        selfCare.isWaterGoalMet
          ? C.Text(
              { variant: 'body', className: 't-fg fw-semibold mb-3' },
              '🎉 Meta de água de hoje feita! Cada copo a mais continua fazendo bem.'
            )
          : null,
        C.Button({
          variant: 'default',
          size: 'lg',
          fullWidth: true,
          onPress: handleAddWater,
          label: '+ ADICIONAR COPO DE ÁGUA',
        })
      ),

      /* --- 2. Prato Colorido -------------------------------------------- */
      C.Card(
        { className: 'mb-5 b-card border-2 br-subtle p-5' },
        row(
          { class: 'items-center justify-between mb-2' },
          row(
            { class: 'items-center flex-1' },
            C.Text({ variant: 'body', className: 't-2xl mr-2' }, '🍎'),
            C.Text({ variant: 'title-md' }, '2. Prato Colorido')
          ),
          selfCare.fruitVeggieConfirmed
            ? C.Badge({ variant: 'success', label: '✓ INCLUÍDO' })
            : null
        ),
        C.Text(
          { variant: 'body', className: 't-muted mb-4' },
          'Você incluiu ao menos uma porção de fruta fresca ou salada/vegetal nas suas refeições hoje?'
        ),
        C.Button({
          variant: selfCare.fruitVeggieConfirmed ? 'secondary' : 'default',
          size: 'lg',
          fullWidth: true,
          disabled: selfCare.fruitVeggieConfirmed,
          onPress: handleConfirmFruitVeggie,
          label: selfCare.fruitVeggieConfirmed
            ? 'Fruta ou vegetal de hoje registrado! 🎉'
            : '✅ SIM, COMI HOJE!',
        })
      ),

      /* --- 3. Sono Restaurador ------------------------------------------ */
      C.Card(
        { className: 'mb-6 b-card border-2 br-subtle p-5' },
        row(
          { class: 'items-center justify-between mb-2' },
          row(
            { class: 'items-center flex-1' },
            C.Text({ variant: 'body', className: 't-2xl mr-2' }, '🌙'),
            C.Text({ variant: 'title-md' }, '3. Sono Restaurador')
          ),
          selfCare.sleepRoutineConfirmed
            ? C.Badge({ variant: 'success', label: '✓ RITUAL CONFIRMADO' })
            : null
        ),
        C.Text(
          { variant: 'body', className: 't-muted mb-3' },
          'Um sono regular restaura memórias. Dica carinhosa: evite telas de celular 30 minutos antes de deitar.'
        ),
        C.Button({
          variant: selfCare.sleepRoutineConfirmed ? 'secondary' : 'default',
          size: 'lg',
          fullWidth: true,
          disabled: selfCare.sleepRoutineConfirmed,
          onPress: handleConfirmSleepRoutine,
          label: selfCare.sleepRoutineConfirmed
            ? 'Preparo para dormir de hoje feito! 🎉'
            : '✅ VOU ME PREPARAR PARA DORMIR',
        })
      ),

      C.ClosingQuote(
        'Cuidar de você com pequenos gestos diários é a maior prova de amor.'
      )
    );
  }

  EM.screens = EM.screens || {};
  EM.screens.selfCare = { render: render };
})(window);
