/* ============================================================================
   everMind Web — js/domain/habits-coordinator.js
   Derivado de `src/modules/habits/HabitsCoordinator.ts`, com as correções da
   auditoria (ADR-0009):

   Coordena os Pilares Movimento e Autocuidado:
     Movimento  → sessão de caminhada (targetMinutes: 10)
     Autocuidado→ água (meta 4 copos), fruta/vegetal, higiene do sono

   Regras de recompensa (todas IDEMPOTENTES por dia local):
     • caminhada  → UMA recompensa por dia;
     • água       → conta como UM desafio quando a meta diária é atingida;
                    cada copo aparece na tela, mas os pontos só vêm na meta;
     • fruta/sono → uma vez por dia.
   Cada recompensa passa por `progressTracker.recordActivity`, que atualiza
   sequência, log semanal, tríade e conquistas de uma só vez.

   Estado salvo é SEMPRE relido do storage antes de gravar: duas telas
   (Corpo e Cuidado) gravam o mesmo registro e uma cópia velha em memória
   nunca pode sobrescrever o que a outra gravou.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var types = EM.domain.types;

  var STORAGE_KEY_HABITS = 'evermind_habits_state_v1';
  var STORAGE_KEY_USER_PROGRESS = types.STORAGE_KEY_USER_PROGRESS;

  var TARGET_MINUTES = 10;
  var WATER_GOAL = 4;
  var GROWTH_POINTS_PER_ACTION = 10;

  function todayOrNow(todayDateStr) {
    return todayDateStr || types.todayLocalDateString(new Date());
  }

  function getInitialState(todayDateStr) {
    var today = todayOrNow(todayDateStr);
    return {
      movement: {
        todayWalkCompleted: false,
        totalWalkSessions: 0,
        lastWalkDate: null,
        targetMinutes: TARGET_MINUTES,
      },
      selfCare: {
        todayDate: today,
        waterGlassesCount: 0,
        isWaterGoalMet: false,
        fruitVeggieConfirmed: false,
        sleepRoutineConfirmed: false,
        totalSelfCareActions: 0,
      },
    };
  }

  function isValidState(saved) {
    return (
      saved &&
      typeof saved === 'object' &&
      saved.movement &&
      typeof saved.movement === 'object' &&
      saved.selfCare &&
      typeof saved.selfCare === 'object'
    );
  }

  /**
   * Carrega o estado, aplicando a "virada do dia" (data LOCAL) quando preciso.
   * Na virada: contadores diários zeram, mas os ACUMULADOS são preservados.
   * Dado ilegível vai para `..._backup` e só então um estado limpo é criado.
   */
  function loadState(storage, todayDateStr) {
    var today = todayOrNow(todayDateStr);
    var saved = storage.get(STORAGE_KEY_HABITS);

    if (saved != null && !isValidState(saved)) {
      if (typeof storage.quarantine === 'function') storage.quarantine(STORAGE_KEY_HABITS, JSON.stringify(saved));
      saved = null;
    }

    if (!saved) {
      var initial = getInitialState(today);
      storage.set(STORAGE_KEY_HABITS, initial);
      return initial;
    }

    var movementDoneToday = saved.movement.lastWalkDate === today;

    if (saved.selfCare.todayDate !== today) {
      var refreshed = {
        movement: Object.assign({}, saved.movement, { todayWalkCompleted: movementDoneToday }),
        selfCare: {
          todayDate: today,
          waterGlassesCount: 0,
          isWaterGoalMet: false,
          fruitVeggieConfirmed: false,
          sleepRoutineConfirmed: false,
          totalSelfCareActions: saved.selfCare.totalSelfCareActions || 0, // acumulado preservado
          totalWaterGlasses: saved.selfCare.totalWaterGlasses || 0,
        },
      };
      storage.set(STORAGE_KEY_HABITS, refreshed);
      return refreshed;
    }

    if (saved.movement.todayWalkCompleted !== movementDoneToday) {
      saved = Object.assign({}, saved, {
        movement: Object.assign({}, saved.movement, { todayWalkCompleted: movementDoneToday }),
      });
      storage.set(STORAGE_KEY_HABITS, saved);
    }

    return saved;
  }

  /** Estado mais recente do storage (ou, sem nada gravado, o recebido). */
  function freshest(storage, currentState, today) {
    var stored = storage.get(STORAGE_KEY_HABITS);
    if (isValidState(stored)) return loadState(storage, today);
    return currentState && isValidState(currentState) ? currentState : loadState(storage, today);
  }

  function sameState(a, b) {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (error) {
      return false;
    }
  }

  /** Devolve `currentState` quando nada mudou (mesma referência = "no-op"). */
  function noop(currentState, base) {
    return currentState && sameState(currentState, base) ? currentState : base;
  }

  function reward(storage, today, pillar, kind) {
    return EM.domain.progressTracker.recordActivity(storage, {
      date: today,
      pillar: pillar,
      kind: kind,
      activityKey: kind,
      points: GROWTH_POINTS_PER_ACTION,
    });
  }

  /** Registra a caminhada de HOJE. Idempotente: uma recompensa por dia. */
  function completeMovementSession(storage, currentState, todayDateStr) {
    var today = todayOrNow(todayDateStr);
    var base = freshest(storage, currentState, today);
    if (base.movement.lastWalkDate === today) return noop(currentState, base);

    var nextState = Object.assign({}, base, {
      movement: Object.assign({}, base.movement, {
        todayWalkCompleted: true,
        totalWalkSessions: base.movement.totalWalkSessions + 1,
        lastWalkDate: today,
      }),
    });

    storage.set(STORAGE_KEY_HABITS, nextState);
    reward(storage, today, 'MOVEMENT', 'walk');
    return nextState;
  }

  /**
   * Adiciona um copo. Cada copo é mostrado, mas a recompensa (+pontos, +1
   * desafio) só vem UMA vez por dia, quando a meta de 4 copos é atingida.
   */
  function addWaterGlass(storage, currentState, todayDateStr) {
    var today = todayOrNow(todayDateStr || (currentState && currentState.selfCare && currentState.selfCare.todayDate));
    var base = freshest(storage, currentState, today);
    var nextGlasses = base.selfCare.waterGlassesCount + 1;
    var reachesGoalNow = !base.selfCare.isWaterGoalMet && nextGlasses >= WATER_GOAL;

    var nextState = Object.assign({}, base, {
      selfCare: Object.assign({}, base.selfCare, {
        waterGlassesCount: nextGlasses,
        isWaterGoalMet: base.selfCare.isWaterGoalMet || nextGlasses >= WATER_GOAL,
        totalWaterGlasses: (base.selfCare.totalWaterGlasses || 0) + 1,
        totalSelfCareActions: base.selfCare.totalSelfCareActions + (reachesGoalNow ? 1 : 0),
      }),
    });

    storage.set(STORAGE_KEY_HABITS, nextState);
    if (reachesGoalNow) reward(storage, today, 'SELFCARE', 'water');
    return nextState;
  }

  /** Idempotente: se já confirmado hoje, não grava nem recompensa. */
  function confirmFruitVeggie(storage, currentState, todayDateStr) {
    var today = todayOrNow(todayDateStr || (currentState && currentState.selfCare && currentState.selfCare.todayDate));
    var base = freshest(storage, currentState, today);
    if (base.selfCare.fruitVeggieConfirmed) return noop(currentState, base);

    var nextState = Object.assign({}, base, {
      selfCare: Object.assign({}, base.selfCare, {
        fruitVeggieConfirmed: true,
        totalSelfCareActions: base.selfCare.totalSelfCareActions + 1,
      }),
    });

    storage.set(STORAGE_KEY_HABITS, nextState);
    reward(storage, today, 'SELFCARE', 'fruit');
    return nextState;
  }

  /** Idempotente, como `confirmFruitVeggie`. */
  function confirmSleepRoutine(storage, currentState, todayDateStr) {
    var today = todayOrNow(todayDateStr || (currentState && currentState.selfCare && currentState.selfCare.todayDate));
    var base = freshest(storage, currentState, today);
    if (base.selfCare.sleepRoutineConfirmed) return noop(currentState, base);

    var nextState = Object.assign({}, base, {
      selfCare: Object.assign({}, base.selfCare, {
        sleepRoutineConfirmed: true,
        totalSelfCareActions: base.selfCare.totalSelfCareActions + 1,
      }),
    });

    storage.set(STORAGE_KEY_HABITS, nextState);
    reward(storage, today, 'SELFCARE', 'sleep');
    return nextState;
  }

  EM.domain = EM.domain || {};
  EM.domain.habitsCoordinator = {
    STORAGE_KEY_HABITS: STORAGE_KEY_HABITS,
    STORAGE_KEY_USER_PROGRESS: STORAGE_KEY_USER_PROGRESS,
    TARGET_MINUTES: TARGET_MINUTES,
    WATER_GOAL: WATER_GOAL,
    GROWTH_POINTS_PER_ACTION: GROWTH_POINTS_PER_ACTION,
    getInitialState: getInitialState,
    loadState: loadState,
    completeMovementSession: completeMovementSession,
    addWaterGlass: addWaterGlass,
    confirmFruitVeggie: confirmFruitVeggie,
    confirmSleepRoutine: confirmSleepRoutine,
  };
})(window);
