/* ============================================================================
   everMind Web — js/domain/badge-evaluator.js
   Portagem literal de `src/modules/gamification/BadgeEvaluator.ts`.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /** ADR-0009: engajamento distribuído = pelo menos 5 dos últimos 7 dias. */
  var ACTIVE_WEEK_MIN_DAYS = 5;

  /** Catálogo oficial de conquistas — 5 entradas, ordem canônica preservada. */
  var CANONICAL_BADGES = [
    {
      id: 'BADGE_FIRST_STEPS',
      name: 'Primeiros Passos',
      description: 'Concluiu os primeiros 5 desafios de bem-estar.',
      icon: '🥉',
      pillarReward: 'GLOBAL',
      unlockedAt: null,
    },
    {
      id: 'BADGE_ACTIVE_WEEK',
      name: 'Semana Ativa',
      description: 'Cultivou seus hábitos em pelo menos 5 dos últimos 7 dias.',
      icon: '🥈',
      pillarReward: 'GLOBAL',
      unlockedAt: null,
    },
    {
      id: 'BADGE_MIND_IN_MOTION',
      name: 'Mente em Movimento',
      description: 'Concluiu 30 atividades cognitivas no Pilar Mente.',
      icon: '🥇',
      pillarReward: 'MIND',
      unlockedAt: null,
    },
    {
      id: 'BADGE_PRESENT_FRIEND',
      name: 'Amigo Presente',
      description: 'Concluiu 10 desafios de socialização no Pilar Conexão.',
      icon: '❤️',
      pillarReward: 'CONNECTION',
      unlockedAt: null,
    },
    {
      id: 'BADGE_WALKER',
      name: 'Caminhante',
      description: 'Concluiu 20 sessões de caminhada no Pilar Movimento.',
      icon: '🚶',
      pillarReward: 'MOVEMENT',
      unlockedAt: null,
    },
  ];

  /**
   * Avalia quais badges devem ser desbloqueados.
   *
   * @param {object} input
   * @param {number} input.totalCompletedChallenges
   * @param {number} input.activeDaysInWeek  dias DISTINTOS com atividade na janela
   *        rolante de 7 dias (ADR-0009: >= 5 desbloqueia a Semana Ativa).
   *        `consecutiveActiveDays` continua aceito como apelido legado.
   * @param {number} input.mindCount
   * @param {number} input.movementCount
   * @param {number} input.connectionCount
   * @param {Array}  input.currentBadges
   * @param {string} [input.currentDate]  ISO completo; quando o chamador passa
   *        uma data "YYYY-MM-DD" (como o WeeklySummaryCalculator), o valor é
   *        usado literalmente — comportamento preservado.
   * @returns {{updatedBadges: Array, newlyUnlocked: Array}}
   */
  function evaluateBadges(input) {
    var now = input.currentDate || new Date().toISOString();

    var currentBadges = input.currentBadges || [];
    var existingUnlockedIds = new Set(
      currentBadges
        .filter(function (badge) {
          return badge.unlockedAt !== null && badge.unlockedAt !== undefined;
        })
        .map(function (badge) {
          return badge.id;
        })
    );

    var newlyUnlocked = [];

    var updatedBadges = CANONICAL_BADGES.map(function (badge) {
      var existing = currentBadges.find(function (item) {
        return item.id === badge.id;
      });

      // (A) Já desbloqueado: devolve o MESMO objeto, preservando o
      //     `unlockedAt` original do storage. Nunca entra em newlyUnlocked.
      if (existing && existing.unlockedAt) return existing;

      var shouldUnlock = false;

      switch (badge.id) {
        case 'BADGE_FIRST_STEPS':
          shouldUnlock = input.totalCompletedChallenges >= 5;
          break;
        case 'BADGE_ACTIVE_WEEK':
          shouldUnlock =
            (input.activeDaysInWeek != null ? input.activeDaysInWeek : input.consecutiveActiveDays) >=
            ACTIVE_WEEK_MIN_DAYS;
          break;
        case 'BADGE_MIND_IN_MOTION':
          shouldUnlock = input.mindCount >= 30;
          break;
        case 'BADGE_WALKER':
          shouldUnlock = input.movementCount >= 20;
          break;
        case 'BADGE_PRESENT_FRIEND':
          shouldUnlock = input.connectionCount >= 10;
          break;
        default:
          shouldUnlock = false;
          break;
      }

      if (shouldUnlock && !existingUnlockedIds.has(badge.id)) {
        var unlockedBadge = Object.assign({}, badge, { unlockedAt: now });
        newlyUnlocked.push(unlockedBadge);
        return unlockedBadge;
      }

      // (B) Mantém o objeto pré-existente (mesmo que com unlockedAt null)
      //     para não perder campos extras que o chamador tenha guardado.
      return existing || badge;
    });

    return { updatedBadges: updatedBadges, newlyUnlocked: newlyUnlocked };
  }

  EM.domain = EM.domain || {};
  EM.domain.badgeEvaluator = {
    CANONICAL_BADGES: CANONICAL_BADGES,
    ACTIVE_WEEK_MIN_DAYS: ACTIVE_WEEK_MIN_DAYS,
    evaluateBadges: evaluateBadges,
  };
})(window);
