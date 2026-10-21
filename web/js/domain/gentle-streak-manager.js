/* ============================================================================
   everMind Web — js/domain/gentle-streak-manager.js
   Portagem literal de `src/modules/gamification/GentleStreakManager.ts`.

   Este arquivo materializa a REGRA DE OURO DO DOMÍNIO (CONTEXT.md §4.3):

     ⛔ TERMINANTEMENTE PROIBIDO: notificar perda de sequência, usar cor
        vermelha de penalidade ou dizer "você perdeu seu streak de 6 dias!".
     ✅ OBRIGATÓRIO: acolher, validar o ritmo próprio e convidar para o presente.

   Por isso `evaluateDailyStreak` NUNCA retorna decremento de sequência e
   `sanitizeMessage` existe como rede de segurança que troca qualquer termo
   punitivo por "recomeço gentil".

   Mais abaixo, o PROGRESS TRACKER (`recordActivity`, ADR-0009) persiste a
   sequência, os dias ativos, o log de conclusões e as conquistas.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /* Termos proibidos — lista literal do original (9 entradas).
     Inclui tanto 'punicao' quanto 'punição'. */
  var PROHIBITED_WORDS = [
    'perdeu',
    'falhou',
    'zerou',
    'atrasado',
    'atrasada',
    'punicao',
    'punição',
    'perda',
    'falta',
  ];

  /**
   * Diferença em dias de CALENDÁRIO entre duas datas.
   * Trunca ambas para a meia-noite local antes de subtrair, o que torna o
   * cálculo consciente de horário de verão (23h/25h ainda arredondam para 1).
   */
  function getCalendarDayDifference(fromDate, toDate) {
    var d1 = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    var d2 = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    var msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
  }

  /**
   * Interpreta uma data "YYYY-MM-DD" como MEIA-NOITE LOCAL.
   *
   * ⚠️ CORREÇÃO INTENCIONAL EM RELAÇÃO AO APP ORIGINAL
   *
   * O original fazia `new Date(lastActiveDate)`. Pela especificação do
   * ECMA-262, uma string apenas-de-data ("2026-09-30") é interpretada como
   * MEIA-NOITE **UTC**. Em seguida, `getCalendarDayDifference` a trunca de
   * volta para a meia-noite local — e como o Brasil é UTC-3, isso recua a
   * data em um dia.
   *
   * Efeito observável no app original: um usuário cujo `lastActiveDate` era o
   * dia de HOJE recebia `diffDays === 1`, caía no ramo "acesso consecutivo" e
   * via "🔥 Que alegria! Você está há N+1 dias" em vez do correto
   * "🔥 Você está firme hoje!". O número exibido estava sempre inflado em 1.
   *
   * Aqui interpretamos a string como data local, de modo que
   * `lastActiveDate === hoje` produz `diffDays === 0`. TODA a lógica de
   * ramificação, as mensagens e as constantes permanecem idênticas — muda
   * apenas a interpretação da data, que é o que estava errado.
   */
  function parseLocalDate(dateString) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateString));
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    // Formatos que não são "YYYY-MM-DD" mantêm o comportamento nativo de Date.
    return new Date(dateString);
  }

  /**
   * Calcula a avaliação de sequência para hoje.
   * @param {string|null} lastActiveDate
   * @param {number} currentStreak
   * @param {number} totalActiveDays
   * @param {Date}   [today]
   * @returns {{currentStreak:number, totalActiveDays:number, encouragementMessage:string, isNewDay:boolean}}
   */
  function evaluateDailyStreak(lastActiveDate, currentStreak, totalActiveDays, today) {
    var referenceDate = today || new Date();

    // ── Primeiro dia de uso ────────────────────────────────────────────────
    if (lastActiveDate == null) {
      return {
        currentStreak: 1,
        totalActiveDays: 1,
        isNewDay: true,
        encouragementMessage:
          '🌱 Bem-vindo! Hoje é um ótimo dia para começar a cuidar de você no seu próprio ritmo.',
      };
    }

    var lastDate = parseLocalDate(lastActiveDate);
    var diffDays = getCalendarDayDifference(lastDate, referenceDate);

    // ── Já ativo hoje (ou data no futuro: tratado como "mesmo dia") ─────────
    if (diffDays <= 0) {
      return {
        currentStreak: Math.max(1, currentStreak),
        totalActiveDays: Math.max(1, totalActiveDays),
        isNewDay: false,
        encouragementMessage: '🔥 Você está firme hoje! Continue aproveitando o seu dia.',
      };
    }

    // ── Acesso consecutivo (Dia + 1): incrementa e celebra ─────────────────
    if (diffDays === 1) {
      var nextStreak = currentStreak + 1;
      return {
        currentStreak: nextStreak,
        totalActiveDays: totalActiveDays + 1,
        isNewDay: true,
        encouragementMessage:
          '🔥 Que alegria! Você está há ' + nextStreak + ' dias cultivando seus hábitos com carinho!',
      };
    }

    // ── Lacuna >= 2 dias: GENTLE FALLBACK ─────────────────────────────────
    // A sequência volta a 1, mas o total acumulado é PRESERVADO e a
    // mensagem é de acolhimento. Nunca há penalidade, cor vermelha ou
    // qualquer menção a "perda".
    return {
      currentStreak: 1,
      totalActiveDays: totalActiveDays + 1,
      isNewDay: true,
      encouragementMessage:
        '🌱 Tudo bem! Cada dia tem seu próprio ritmo. Hoje é uma nova oportunidade para cuidar de você.',
    };
  }

  /**
   * Rede de segurança anti-culpa: substitui qualquer termo punitivo por
   * "recomeço gentil".
   *
   * ⚠️ Detalhe de portagem preservado: o RegExp é CONSTRUÍDO DENTRO do laço a
   * cada chamada. Isso é intencional — com a flag `g`, `.test()` avança o
   * `lastIndex`; se os regexes fossem cacheados em nível de módulo, o
   * `lastIndex` vazaria entre chamadas e o filtro falharia de forma
   * intermitente. Manter a construção por chamada é o comportamento correto.
   */
  function sanitizeMessage(inputText) {
    var cleanText = inputText;

    for (var i = 0; i < PROHIBITED_WORDS.length; i++) {
      var word = PROHIBITED_WORDS[i];
      var regex = new RegExp('\\b' + word + '\\b', 'gi');
      if (regex.test(cleanText)) {
        cleanText = cleanText.replace(regex, 'recomeço gentil');
      }
    }

    return cleanText;
  }

  /* =========================================================================
     PROGRESS TRACKER — persistência honesta de sequência, dias ativos, log de
     conclusões, tríade por data e conquistas (ADR-0009).

     ⚠️ NÃO existe novo arquivo de propósito: o index.html e o precache do
        service worker listam os scripts um a um. A lógica mora aqui porque é
        a continuação natural da Sequência Acolhedora.

     UMA única função (`recordActivity`) é chamada por QUALQUER atividade
     concluída — jogos, caminhada, meta de água, fruta, sono, ligação,
     descoberta. Ela, de forma atômica (lê → altera → grava):
       1. atualiza currentStreak / totalActiveDays / lastActiveDate (+ lista
          das últimas 60 datas ativas);
       2. soma +1 desafio e +pontos (nunca subtrai nada);
       3. grava o evento no log de conclusões (últimos 60 dias, por pilar);
       4. marca, para a DATA do evento, os desafios da Tríade cujo
          `activityKey` coincide (nunca desfeito, nunca levado a outro dia);
       5. reavalia conquistas e persiste as novas com `unlockedAt`.
     ======================================================================= */
  var HISTORY_DAYS = 60;
  var WEEK_WINDOW_DAYS = 7;
  /* ADR-0009: "Semana Ativa" = atividade em >= 5 dos últimos 7 dias. */
  var ACTIVE_WEEK_MIN_DAYS = 5;

  var PILLAR_KEYS = ['MIND', 'MOVEMENT', 'SELFCARE', 'CONNECTION', 'DISCOVERY'];

  var progressListener = null;

  function types() {
    return EM.domain.types;
  }

  function formatLocalDate(date) {
    return types().todayLocalDateString(date);
  }

  /** Soma `days` (pode ser negativo) a uma data "YYYY-MM-DD" local. */
  function addDays(dateString, days) {
    var d = parseLocalDate(dateString);
    return formatLocalDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
  }

  function copyArray(value) {
    return Array.isArray(value) ? value.slice() : [];
  }

  /** Completa campos ausentes (dados de versões antigas) sem tocar nos existentes. */
  function normalizeProgress(raw) {
    var base = types().createInitialUserProgress();
    var out = Object.assign({}, base, raw);
    out.activeDates = copyArray(raw.activeDates).filter(function (d) {
      return typeof d === 'string';
    });
    out.completionLog = copyArray(raw.completionLog).filter(function (e) {
      return e && typeof e.d === 'string' && typeof e.p === 'string';
    });
    out.badges = copyArray(raw.badges).filter(function (b) {
      return b && typeof b.id === 'string';
    });
    out.triadCompletions =
      raw.triadCompletions && typeof raw.triadCompletions === 'object' && !Array.isArray(raw.triadCompletions)
        ? Object.assign({}, raw.triadCompletions)
        : {};
    out.pillarTotals = Object.assign({}, base.pillarTotals, raw.pillarTotals);
    out.completedChallengeIds = copyArray(raw.completedChallengeIds);
    out.triadChallengeIds = copyArray(raw.triadChallengeIds);
    return out;
  }

  function isValidProgress(raw) {
    return (
      raw &&
      typeof raw === 'object' &&
      !Array.isArray(raw) &&
      typeof raw.totalCompletedChallenges === 'number' &&
      isFinite(raw.totalCompletedChallenges) &&
      raw.totalCompletedChallenges >= 0 &&
      EM.domain.types.BRAIN_STAGE_ORDER.indexOf(raw.highestBrainStageAchieved) >= 0
    );
  }

  /** Assinatura exata do antigo perfil de demonstração ("Maria"). */
  function isLegacyDemoSeed(raw) {
    return (
      raw.totalCompletedChallenges === 14 &&
      raw.highestBrainStageAchieved === 'KID' &&
      raw.currentStreak === 4 &&
      raw.totalActiveDays === 12 &&
      raw.growthPoints === 140 &&
      !raw.activeDates &&
      JSON.stringify(raw.completedChallengeIds) === '["movement_walk_10min"]'
    );
  }

  /**
   * Lê o progresso global. Nunca sobrescreve dados reais ilegíveis: o valor
   * problemático vai para `<chave>_backup` (via gateway.quarantine) e só então
   * um estado zerado é criado. Sempre devolve um objeto normalizado.
   */
  function loadProgress(storage) {
    var key = types().STORAGE_KEY_USER_PROGRESS;
    var raw = storage.get(key); // JSON inválido já foi posto em quarentena pelo gateway

    if (raw == null) {
      var fresh = types().createInitialUserProgress();
      storage.set(key, fresh);
      return fresh;
    }

    if (!isValidProgress(raw) || isLegacyDemoSeed(raw)) {
      if (typeof storage.quarantine === 'function') {
        storage.quarantine(key, JSON.stringify(raw));
      }
      var reset = types().createInitialUserProgress();
      storage.set(key, reset);
      return reset;
    }

    return normalizeProgress(raw);
  }

  function windowStart(today, days) {
    return addDays(today, -((days || WEEK_WINDOW_DAYS) - 1));
  }

  /** Dias distintos com atividade em [hoje-6, hoje]. */
  function activeDaysInWindow(progress, today, days) {
    var start = windowStart(today, days);
    var seen = {};
    var count = 0;
    function consider(d) {
      if (d >= start && d <= today && !seen[d]) {
        seen[d] = true;
        count += 1;
      }
    }
    (progress.activeDates || []).forEach(consider);
    (progress.completionLog || []).forEach(function (e) {
      consider(e.d);
    });
    return count;
  }

  /** Totais por pilar na janela rolante de 7 dias, a partir do log real. */
  function weeklyTotals(progress, today) {
    var start = windowStart(today, WEEK_WINDOW_DAYS);
    var totals = { MIND: 0, MOVEMENT: 0, SELFCARE: 0, CONNECTION: 0, DISCOVERY: 0, total: 0 };
    (progress.completionLog || []).forEach(function (event) {
      if (event.d < start || event.d > today) return;
      if (totals[event.p] === undefined) return;
      totals[event.p] += 1;
      totals.total += 1;
    });
    totals.activeDays = activeDaysInWindow(progress, today, WEEK_WINDOW_DAYS);
    totals.weekStartDate = start;
    totals.weekEndDate = today;
    return totals;
  }

  /**
   * Prévia HONESTA da sequência para a Home (não grava nada).
   *   · nunca ativo           → 0 dias, boas-vindas;
   *   · ativo hoje            → sequência atual;
   *   · ativo ontem           → sequência atual, convite para continuar;
   *   · 2+ dias sem atividade → recomeço gentil (1), sem lamento.
   */
  function previewStreak(progress, today) {
    var last = progress.lastActiveDate;
    if (last == null) {
      return {
        currentStreak: 0,
        encouragementMessage:
          '🌱 Bem-vindo! Hoje é um ótimo dia para começar a cuidar de você no seu próprio ritmo.',
      };
    }
    var diff = getCalendarDayDifference(parseLocalDate(last), parseLocalDate(today));
    if (diff <= 0) {
      return {
        currentStreak: Math.max(1, progress.currentStreak),
        encouragementMessage: '🔥 Você está firme hoje! Continue aproveitando o seu dia.',
      };
    }
    if (diff === 1) {
      return {
        currentStreak: Math.max(1, progress.currentStreak),
        encouragementMessage:
          '☀️ Que bom ver você de novo! Qualquer atividade de hoje continua a sua sequência de ' +
          Math.max(1, progress.currentStreak) +
          (Math.max(1, progress.currentStreak) === 1 ? ' dia.' : ' dias.'),
      };
    }
    return {
      currentStreak: 1,
      encouragementMessage:
        '🌱 Tudo bem! Cada dia tem seu próprio ritmo. Hoje é uma nova oportunidade para cuidar de você.',
    };
  }

  function pruneHistory(next, today) {
    var cutoff = addDays(today, -(HISTORY_DAYS - 1));
    next.activeDates = next.activeDates
      .filter(function (d) {
        return d >= cutoff;
      })
      .sort();
    next.completionLog = next.completionLog.filter(function (e) {
      return e.d >= cutoff;
    });
    Object.keys(next.triadCompletions).forEach(function (d) {
      if (d < cutoff) delete next.triadCompletions[d];
    });
  }

  /**
   * Registra UMA atividade concluída. Veja o cabeçalho da seção.
   *
   * @param {object} storage  IStorageGateway
   * @param {object} opts
   * @param {string} opts.pillar       'MIND'|'MOVEMENT'|'SELFCARE'|'CONNECTION'|'DISCOVERY'
   * @param {string} opts.kind         ex.: 'game:memory', 'walk', 'water', 'fruit', 'sleep', 'call', 'discovery'
   * @param {string} [opts.activityKey] chave que conclui desafios da Tríade (padrão = kind)
   * @param {string} [opts.date]       "YYYY-MM-DD" local (padrão: hoje)
   * @param {number} [opts.points]     padrão 10
   * @returns {{progress:object, previousStage:string, nextStage:string, stageConfig:object,
   *            newBadges:Array, triadJustCompleted:boolean}}
   */
  function recordActivity(storage, opts) {
    var options = opts || {};
    var date = options.date || formatLocalDate(new Date());
    var points = typeof options.points === 'number' ? options.points : 10;
    var engine = EM.domain.brainEvolutionEngine;

    var current = loadProgress(storage);
    var next = normalizeProgress(current);
    var previousStage = current.highestBrainStageAchieved;

    // 1) Sequência acolhedora + dias ativos (nunca diminuem).
    var alreadyActiveToday = next.activeDates.indexOf(date) >= 0;
    if (!alreadyActiveToday) {
      if (next.lastActiveDate == null || date >= next.lastActiveDate) {
        var evaluation = evaluateDailyStreak(
          next.lastActiveDate,
          next.currentStreak,
          next.totalActiveDays,
          parseLocalDate(date)
        );
        next.currentStreak = evaluation.currentStreak;
        next.totalActiveDays = evaluation.totalActiveDays;
        next.lastActiveDate = date;
      } else {
        // Data anterior ao último dia ativo (relógio ajustado): só soma o dia.
        next.totalActiveDays += 1;
      }
      next.activeDates.push(date);
    }

    // 2) Totais e Cérebro Virtual (monotônico).
    next.totalCompletedChallenges += 1;
    next.growthPoints += points;
    var stageConfig = engine.evaluateStage(next.totalCompletedChallenges, previousStage);
    next.highestBrainStageAchieved =
      engine.STAGE_ORDER.indexOf(stageConfig.stage) > engine.STAGE_ORDER.indexOf(previousStage)
        ? stageConfig.stage
        : previousStage;

    // 3) Log de conclusões por pilar.
    if (PILLAR_KEYS.indexOf(options.pillar) >= 0) {
      next.pillarTotals[options.pillar] = (next.pillarTotals[options.pillar] || 0) + 1;
      next.completionLog.push({ d: date, p: options.pillar, k: options.kind || '' });
    }

    // 4) Tríade do dia: marca desafios cujo `activityKey` coincide.
    var triadJustCompleted = false;
    var activityKey = options.activityKey || options.kind;
    if (activityKey) {
      var triad = EM.domain.dailyTriadCoordinator.generateTriadForDate(date, []);
      var done = copyArray(next.triadCompletions[date]);
      var before = triad.filter(function (c) {
        return done.indexOf(c.id) >= 0;
      }).length;
      triad.forEach(function (challenge) {
        if (challenge.activityKey === activityKey && done.indexOf(challenge.id) < 0) {
          done.push(challenge.id);
        }
      });
      next.triadCompletions[date] = done;
      var after = triad.filter(function (c) {
        return done.indexOf(c.id) >= 0;
      }).length;
      triadJustCompleted = before < 3 && after === 3;
    }

    pruneHistory(next, date);

    // 5) Conquistas: avalia com os números reais e persiste as novas.
    var badgeResult = EM.domain.badgeEvaluator.evaluateBadges({
      totalCompletedChallenges: next.totalCompletedChallenges,
      activeDaysInWeek: activeDaysInWindow(next, date, WEEK_WINDOW_DAYS),
      mindCount: next.pillarTotals.MIND,
      movementCount: next.pillarTotals.MOVEMENT,
      connectionCount: next.pillarTotals.CONNECTION,
      currentBadges: next.badges,
      currentDate: new Date().toISOString(),
    });
    next.badges = badgeResult.updatedBadges
      .filter(function (b) {
        return b.unlockedAt;
      })
      .map(function (b) {
        return { id: b.id, unlockedAt: b.unlockedAt };
      });

    storage.set(types().STORAGE_KEY_USER_PROGRESS, next);

    var result = {
      progress: next,
      previousStage: previousStage,
      nextStage: next.highestBrainStageAchieved,
      stageConfig: stageConfig,
      newBadges: badgeResult.newlyUnlocked,
      triadJustCompleted: triadJustCompleted,
    };

    if (typeof progressListener === 'function') {
      try {
        progressListener(result);
      } catch (error) {
        /* A interface nunca deve impedir o registro do progresso. */
      }
    }
    return result;
  }

  /** A interface registra aqui o aviso gentil de estágio/conquista/tríade. */
  function setProgressListener(listener) {
    progressListener = listener;
  }

  EM.domain = EM.domain || {};
  EM.domain.gentleStreakManager = {
    PROHIBITED_WORDS: PROHIBITED_WORDS,
    getCalendarDayDifference: getCalendarDayDifference,
    parseLocalDate: parseLocalDate,
    evaluateDailyStreak: evaluateDailyStreak,
    sanitizeMessage: sanitizeMessage,
    // ── Persistência honesta (ADR-0009) ──
    HISTORY_DAYS: HISTORY_DAYS,
    WEEK_WINDOW_DAYS: WEEK_WINDOW_DAYS,
    ACTIVE_WEEK_MIN_DAYS: ACTIVE_WEEK_MIN_DAYS,
    addDays: addDays,
    loadProgress: loadProgress,
    normalizeProgress: normalizeProgress,
    recordActivity: recordActivity,
    previewStreak: previewStreak,
    weeklyTotals: weeklyTotals,
    activeDaysInWindow: activeDaysInWindow,
    setProgressListener: setProgressListener,
  };
  EM.domain.progressTracker = EM.domain.gentleStreakManager;
})(window);
