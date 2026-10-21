/* ============================================================================
   everMind Web — js/domain/brain-evolution-engine.js
   Portagem literal de `src/modules/gamification/BrainEvolutionEngine.ts`.

   Três estruturas puras:
     • evaluateStage      — máquina de estados MONOTÔNICA (nunca involui)
     • calculateProgress  — porcentagem GLOBAL (não relativa ao estágio)
     • calculateGrowthPoints
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var types = EM.domain.types;
  var BRAIN_STAGES_CONFIG = types.BRAIN_STAGES_CONFIG;
  var STAGE_ORDER = types.BRAIN_STAGE_ORDER;

  /**
   * Avalia qual estágio o total de desafios concluídos coloca o usuário.
   * @param {number} totalCompletedChallenges
   * @param {string} previousHighestStage  estágio máximo já alcançado
   */
  function evaluateStage(totalCompletedChallenges, previousHighestStage) {
    var calculatedStage;

    if (totalCompletedChallenges >= 51) calculatedStage = 'MEGA';
    else if (totalCompletedChallenges >= 21) calculatedStage = 'TEEN';
    else if (totalCompletedChallenges >= 6) calculatedStage = 'KID';
    else calculatedStage = 'BABY';

    // ── MONOTONICIDADE ESTRITA (regra de ouro do domínio) ──────────────────
    // Uma vez alcançado um estágio, o usuário permanece nele. O Cérebro
    // Virtual nunca perde níveis por falta de uso.
    var prevIndex = STAGE_ORDER.indexOf(previousHighestStage || 'BABY');
    var currIndex = STAGE_ORDER.indexOf(calculatedStage);
    var effectiveStage = currIndex >= prevIndex ? calculatedStage : previousHighestStage;

    return BRAIN_STAGES_CONFIG[effectiveStage];
  }

  /**
   * Progresso dentro do estágio atual.
   *
   * ⚠️ Comportamento intencionalmente preservado do original: a porcentagem é
   * calculada sobre o TOTAL ABSOLUTO, não sobre um offset relativo ao estágio.
   *   → Brain Kid com total 6  ⇒ { current: 6,  target: 20, percentage: 30 }
   * "Corrigir" isso para 6% mudaria a leitura do Cérebro Virtual e quebraria a
   * paridade com o app original, então mantemos como está.
   */
  function calculateProgress(totalCompletedChallenges, currentStage) {
    var total = totalCompletedChallenges;
    var current;
    var target;

    switch (currentStage) {
      case 'BABY':
        current = Math.min(total, 5);
        target = 5;
        break;
      case 'KID':
        current = Math.min(total, 20);
        target = 20;
        break;
      case 'TEEN':
        current = Math.min(total, 50);
        target = 50;
        break;
      case 'MEGA':
        current = total;
        target = total;
        break;
      default:
        current = 0;
        target = 1;
        break;
    }

    var percentage = Math.min(100, Math.round((current / target) * 100));

    return { current: current, target: target, percentage: percentage };
  }

  /** +10 pontos de energia cognitiva por desafio concluído. */
  function calculateGrowthPoints(completedChallengesCount) {
    return completedChallengesCount * 10;
  }

  EM.domain = EM.domain || {};
  EM.domain.brainEvolutionEngine = {
    STAGE_ORDER: STAGE_ORDER,
    evaluateStage: evaluateStage,
    calculateProgress: calculateProgress,
    calculateGrowthPoints: calculateGrowthPoints,
  };
})(window);
