/* ============================================================================
   everMind Web — js/domain/social-coordinator.js
   Portagem literal de `src/modules/social/SocialCoordinator.ts`.
   Pilar Conexão: mitiga o isolamento e celebra os laços afetivos com
   amigos, vizinhos e familiares.

   A recompensa passa por `progressTracker.recordActivity` (ADR-0009).
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var types = EM.domain.types;

  var STORAGE_KEY_SOCIAL = 'evermind_social_state_v1';
  var STORAGE_KEY_USER_PROGRESS = types.STORAGE_KEY_USER_PROGRESS;

  function todayOrNow(todayDateStr) {
    return todayDateStr || types.todayLocalDateString(new Date());
  }

  function getInitialState(todayDateStr) {
    return {
      todayDate: todayOrNow(todayDateStr),
      isConnectionCompletedToday: false,
      totalSocialConnections: 0,
      lastConnectionDate: null,
      reminderScheduledTime: null,
    };
  }

  function isValidState(saved) {
    return saved && typeof saved === 'object' && typeof saved.totalSocialConnections === 'number';
  }

  /** Carrega o estado (virada do dia pela data LOCAL). Dado ilegível → backup. */
  function loadState(storage, todayDateStr) {
    var today = todayOrNow(todayDateStr);
    var saved = storage.get(STORAGE_KEY_SOCIAL);

    if (saved != null && !isValidState(saved)) {
      if (typeof storage.quarantine === 'function') storage.quarantine(STORAGE_KEY_SOCIAL, JSON.stringify(saved));
      saved = null;
    }

    if (!saved) {
      var initial = getInitialState(today);
      storage.set(STORAGE_KEY_SOCIAL, initial);
      return initial;
    }

    var doneToday = saved.lastConnectionDate === today;

    if (saved.todayDate !== today) {
      var refreshed = {
        todayDate: today,
        isConnectionCompletedToday: doneToday,
        totalSocialConnections: saved.totalSocialConnections, // acumulado preservado
        lastConnectionDate: saved.lastConnectionDate,
        reminderScheduledTime: null, // lembretes não sobrevivem à virada do dia
      };
      storage.set(STORAGE_KEY_SOCIAL, refreshed);
      return refreshed;
    }

    if (saved.isConnectionCompletedToday !== doneToday) {
      saved = Object.assign({}, saved, { isConnectionCompletedToday: doneToday });
      storage.set(STORAGE_KEY_SOCIAL, saved);
    }

    return saved;
  }

  /**
   * Registra a ligação de HOJE. Idempotente: uma recompensa por dia. O estado
   * é relido do storage, então uma cópia velha nunca sobrescreve dados novos.
   */
  function completeSocialConnection(storage, currentState, todayDateStr) {
    var today = todayOrNow(todayDateStr);
    var base = loadState(storage, today);
    if (base.lastConnectionDate === today) {
      return currentState && JSON.stringify(currentState) === JSON.stringify(base) ? currentState : base;
    }

    var nextState = Object.assign({}, base, {
      isConnectionCompletedToday: true,
      totalSocialConnections: base.totalSocialConnections + 1,
      lastConnectionDate: today,
      reminderScheduledTime: null,
    });

    storage.set(STORAGE_KEY_SOCIAL, nextState);
    EM.domain.progressTracker.recordActivity(storage, {
      date: today,
      pillar: 'CONNECTION',
      kind: 'call',
      activityKey: 'call',
      points: 10,
    });
    return nextState;
  }

  /**
   * Agenda um lembrete. No app original isso NÃO dispara notificação real:
   * apenas grava a string ("16:00") no storage e o botão troca de rótulo.
   * Mantivemos essa semântica. O app é offline-first e sem permissões.
   */
  function scheduleReminder(storage, currentState, reminderTime) {
    var base = loadState(storage, currentState && currentState.todayDate);
    var nextState = Object.assign({}, base, {
      reminderScheduledTime: reminderTime,
    });

    storage.set(STORAGE_KEY_SOCIAL, nextState);
    return nextState;
  }

  EM.domain = EM.domain || {};
  EM.domain.socialCoordinator = {
    STORAGE_KEY_SOCIAL: STORAGE_KEY_SOCIAL,
    STORAGE_KEY_USER_PROGRESS: STORAGE_KEY_USER_PROGRESS,
    getInitialState: getInitialState,
    loadState: loadState,
    completeSocialConnection: completeSocialConnection,
    scheduleReminder: scheduleReminder,
  };
})(window);
