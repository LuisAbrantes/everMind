/* ============================================================================
   everMind Web — js/domain/types.js
   Portagem literal de `src/modules/domain/types.ts`.

   Contém: PillarType, BrainStage, BRAIN_STAGES_CONFIG e as "chaves" de data
   que o app inteiro compartilha. Nenhuma lógica aqui — só dados canônicos.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /* ------------------------------------------------------------------------
     BRAIN_STAGES_CONFIG — Cérebro Virtual, 4 estágios contínuos.
     Regra do domínio: o cérebro NUNCA involui (garantida em BrainEvolutionEngine).
     ---------------------------------------------------------------------- */
  var BRAIN_STAGES_CONFIG = {
    /* `shortLabel` é o nome em português mostrado ao usuário no selo de estágio
       (Bebê · Criança · Jovem · Mestre). O código do estágio (BABY/KID/…) é
       interno e NUNCA deve aparecer na tela. */
    BABY: { stage: 'BABY', label: 'Brain Baby', shortLabel: 'Bebê',    emoji: '🌱', minCompleted: 1, maxCompleted: 5 },
    KID:  { stage: 'KID',  label: 'Brain Kid',  shortLabel: 'Criança', emoji: '✨', minCompleted: 6, maxCompleted: 20 },
    TEEN: { stage: 'TEEN', label: 'Brain Teen', shortLabel: 'Jovem',   emoji: '⚡', minCompleted: 21, maxCompleted: 50 },
    MEGA: { stage: 'MEGA', label: 'Mega Brain', shortLabel: 'Mestre',  emoji: '👑', minCompleted: 51, maxCompleted: Infinity },
  };

  var BRAIN_STAGE_ORDER = ['BABY', 'KID', 'TEEN', 'MEGA'];

  var PILLAR_TYPES = ['MIND', 'MOVEMENT', 'SELFCARE', 'CONNECTION'];

  /* ------------------------------------------------------------------------
     DATAS — SEMPRE LOCAIS (ADR-0009 / auditoria 2026-10)

     Toda string "YYYY-MM-DD" do app (tríade, hábitos, streak, resumo semanal,
     log de conclusões) é montada com getFullYear/getMonth/getDate, ou seja, no
     fuso do aparelho. A antiga convenção UTC (toISOString().slice(0,10)) foi
     removida: perto da meia-noite ela fazia os hábitos "virarem o dia" às 21h
     no Brasil. `todayUtcDateString` permanece só como ALIAS DEPRECADO que
     devolve a data local.
     ---------------------------------------------------------------------- */
  function todayLocalDateString(date) {
    var d = date || new Date();
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  /** @deprecated Alias de `todayLocalDateString` (a convenção UTC foi removida). */
  function todayUtcDateString(date) {
    return todayLocalDateString(date);
  }

  /* Chave de storage do progresso global. */
  var STORAGE_KEY_USER_PROGRESS = 'evermind_user_progress_v1';

  /** Chave opcional com o nome do usuário (uma fase futura pede o nome). */
  var STORAGE_KEY_USER_NAME = 'evermind_user_name';

  /* ------------------------------------------------------------------------
     Estado inicial do progresso: TUDO ZERO. Não existe mais perfil de
     demonstração ("Maria"): a primeira execução é Brain Baby, 0 desafios,
     sequência 0.
     ---------------------------------------------------------------------- */
  function createInitialUserProgress() {
    return {
      schemaVersion: 2,
      totalCompletedChallenges: 0,
      highestBrainStageAchieved: 'BABY',
      currentStreak: 0,
      totalActiveDays: 0,
      lastActiveDate: null,
      growthPoints: 0,
      completedChallengeIds: [], // legado (não usado): a conclusão da tríade vive em triadCompletions
      triadDate: null,
      triadChallengeIds: [],
      activeDates: [], // últimas 60 datas ativas (YYYY-MM-DD, local, ordenadas)
      triadCompletions: {}, // { 'YYYY-MM-DD': ['mind_sequence_easy', ...] } — por data, nunca desfeito
      completionLog: [], // [{ d: 'YYYY-MM-DD', p: 'MIND'|..., k: 'walk' }] — últimos 60 dias
      pillarTotals: { MIND: 0, MOVEMENT: 0, SELFCARE: 0, CONNECTION: 0, DISCOVERY: 0 },
      badges: [], // só as desbloqueadas: [{ id, unlockedAt }]
    };
  }

  EM.domain = EM.domain || {};
  EM.domain.types = {
    BRAIN_STAGES_CONFIG: BRAIN_STAGES_CONFIG,
    BRAIN_STAGE_ORDER: BRAIN_STAGE_ORDER,
    PILLAR_TYPES: PILLAR_TYPES,
    STORAGE_KEY_USER_PROGRESS: STORAGE_KEY_USER_PROGRESS,
    STORAGE_KEY_USER_NAME: STORAGE_KEY_USER_NAME,
    todayLocalDateString: todayLocalDateString,
    todayUtcDateString: todayUtcDateString,
    createInitialUserProgress: createInitialUserProgress,
  };
})(window);
