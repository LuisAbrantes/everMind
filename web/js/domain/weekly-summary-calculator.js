/* ============================================================================
   everMind Web — js/domain/weekly-summary-calculator.js
   Portagem literal de `src/modules/summary/WeeklySummaryCalculator.ts`.

   REGRA DE DOMÍNIO (CONTEXT.md §3.5): a Retrospectiva Semanal apresenta
   EXCLUSIVAMENTE métricas afirmativas. Não existe menção a dias não
   preenchidos, faltas ou ausências.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var badgeEvaluator = EM.domain.badgeEvaluator;

  var CANONICAL_BADGES = badgeEvaluator.CANONICAL_BADGES;

  /** Mensagem afirmativa conforme o total de atividades da semana. */
  function generateAffirmativeMessage(totalActivities) {
    if (totalActivities === 0) {
      return '🌱 Que alegria ter você aqui! Hoje é uma linda oportunidade para começar a cuidar de você no seu ritmo.';
    }
    if (totalActivities <= 4) {
      return '🌿 Que ótimo! Você realizou momentos preciosos de cuidado nesta semana. Cada pequeno passo conta e faz bem!';
    }
    if (totalActivities <= 14) {
      return '✨ Muito bem! Você cultivou uma constância acolhedora e equilibrada ao longo de todos os seus pilares de longevidade!';
    }
    return '🎉 Sensacional! Sua semana foi repleta de vitalidade, afeto e carinho pela sua mente e corpo!';
  }

  /** Mescla o catálogo canônico com as conquistas persistidas ({id, unlockedAt}). */
  function mergePersistedBadges(persisted) {
    return CANONICAL_BADGES.map(function (badge) {
      var saved = (persisted || []).filter(function (item) {
        return item && item.id === badge.id && item.unlockedAt;
      })[0];
      return saved ? Object.assign({}, badge, { unlockedAt: saved.unlockedAt }) : badge;
    });
  }

  /**
   * Monta o relatório da semana.
   *
   * A janela é uma ROLAGEM de 7 dias [hoje-6, hoje] em data LOCAL (ADR-0009),
   * e NÃO uma semana ISO alinhada na segunda-feira.
   *
   * Entradas (totais já calculados a partir do log real de conclusões):
   *   mindPillarTotal · movementPillarTotal · selfCarePillarTotal ·
   *   connectionPillarTotal · activeDaysInWeek (apelido legado: consecutiveDays)
   *   · unlockedBadges (opcional: conquistas persistidas {id, unlockedAt}; quando
   *   ausente, o avaliador decide com os números da semana — uso legado).
   */
  function calculateReport(input, currentDate) {
    var now = currentDate || new Date();
    var types = EM.domain.types;

    var totalActivities =
      input.mindPillarTotal +
      input.movementPillarTotal +
      input.selfCarePillarTotal +
      input.connectionPillarTotal;

    var activeDays = input.activeDaysInWeek != null ? input.activeDaysInWeek : input.consecutiveDays || 0;
    var isPerfectActiveWeek = activeDays >= badgeEvaluator.ACTIVE_WEEK_MIN_DAYS;
    var affirmativeMessage = generateAffirmativeMessage(totalActivities);

    var endDate = types.todayLocalDateString(now);
    var startDate = types.todayLocalDateString(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
    );

    var badges;
    if (input.unlockedBadges) {
      badges = mergePersistedBadges(input.unlockedBadges);
    } else {
      badges = badgeEvaluator.evaluateBadges({
        totalCompletedChallenges: totalActivities,
        activeDaysInWeek: activeDays,
        mindCount: input.mindPillarTotal,
        movementCount: input.movementPillarTotal,
        connectionCount: input.connectionPillarTotal,
        currentBadges: CANONICAL_BADGES,
        currentDate: endDate,
      }).updatedBadges;
    }

    return {
      weekStartDate: startDate,
      weekEndDate: endDate,
      mindPillarTotal: input.mindPillarTotal,
      movementPillarTotal: input.movementPillarTotal,
      selfCarePillarTotal: input.selfCarePillarTotal,
      connectionPillarTotal: input.connectionPillarTotal,
      totalActivitiesCompleted: totalActivities,
      activeDaysInWeek: activeDays,
      affirmativeMessage: affirmativeMessage,
      isPerfectActiveWeek: isPerfectActiveWeek,
      badges: badges,
    };
  }

  EM.domain = EM.domain || {};
  EM.domain.weeklySummaryCalculator = {
    calculateReport: calculateReport,
    mergePersistedBadges: mergePersistedBadges,
    generateAffirmativeMessage: generateAffirmativeMessage,
  };
})(window);
