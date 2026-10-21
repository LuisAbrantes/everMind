/* ============================================================================
   everMind Web — js/domain/sync-mapper.js
   REFERÊNCIA PARA A SINCRONIZAÇÃO COM O SUPABASE (ainda NÃO ligada ao app).

   Funções PURAS — sem rede, sem localStorage, sem DOM:
     • buildPush(snapshot)          estado local  → linhas das tabelas
     • mergePull(snapshot, remote)  linhas do banco + estado local → novo estado local

   As regras de merge são as mesmas dos triggers do banco
   (supabase/migrations/20261021000100_pwa_persistence.sql): contadores só
   crescem, estágio nunca regride, booleans só viram true, conjuntos se unem.
   Documentação completa: docs/SUPABASE_HANDOFF.md.

   Para ligar: adicionar <script src="js/domain/sync-mapper.js"> ao index.html e
   './js/domain/sync-mapper.js' ao APP_SHELL do sw.js (e subir o CACHE_NAME).
   Testes: cd supabase/tests && npm test
   ========================================================================== */
(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  EM.domain = EM.domain || {};

  var STAGE_TO_DB = { BABY: 'baby', KID: 'kid', TEEN: 'teen', MEGA: 'mega_brain' };
  var STAGE_FROM_DB = { baby: 'BABY', kid: 'KID', teen: 'TEEN', mega_brain: 'MEGA' };
  var STAGE_ORDER = ['BABY', 'KID', 'TEEN', 'MEGA'];

  var BADGE_TO_DB = {
    BADGE_FIRST_STEPS: 'first_steps',
    BADGE_ACTIVE_WEEK: 'active_week',
    BADGE_MIND_IN_MOTION: 'moving_mind',
    BADGE_PRESENT_FRIEND: 'present_friend',
    BADGE_WALKER: 'walker',
  };
  var BADGE_FROM_DB = {};
  Object.keys(BADGE_TO_DB).forEach(function (k) { BADGE_FROM_DB[BADGE_TO_DB[k]] = k; });

  var KEEP_DAYS = 60; // o app local guarda só os 60 últimos dias de log/atividade

  function num(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }
  function max(a, b) { return Math.max(num(a), num(b)); }
  function stageMax(a, b) {
    return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b) ? a : b;
  }
  function uniqSorted(list) {
    var seen = {};
    return list.filter(function (x) { if (seen[x]) return false; seen[x] = true; return true; }).sort();
  }
  /** "YYYY-MM-DD" mais antigo ainda dentro da janela, relativo ao maior dia visto. */
  function cutoffFor(dates) {
    if (!dates.length) return '0000-00-00';
    var latest = dates.slice().sort().pop();
    var d = new Date(latest + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - (KEEP_DAYS - 1));
    return d.toISOString().slice(0, 10);
  }

  /** Chave de idempotência determinística: "<data>|<atividade>|<nº de ordem no dia>". */
  function eventKeys(log) {
    var counters = {};
    return (log || []).map(function (e) {
      var base = e.d + '|' + e.k;
      counters[base] = (counters[base] || 0) + 1;
      return base + '|' + counters[base];
    });
  }

  /* -------------------------------------------------------------------------
     PUSH: estado local → linhas (sem user_id: o banco preenche com auth.uid()).
     snapshot = {
       progress, habits, social,            // objetos já parseados do localStorage
       mindCount, discoveriesCount,         // números
       discoveryHistory,                    // [{id,date,completed?}]
       name,                                // string | null
       settings: { onboardingDone, textSizePct, sound, vibration },
       timezone                             // opcional
     }
     ----------------------------------------------------------------------- */
  function buildPush(s) {
    var p = s.progress || {};
    var h = s.habits || { movement: {}, selfCare: {} };
    var soc = s.social || {};
    var set = s.settings || {};
    var totals = p.pillarTotals || {};
    var log = p.completionLog || [];
    var keys = eventKeys(log);

    var rows = {
      profile: {
        display_name: s.name ? String(s.name).slice(0, 60) : null,
        onboarding_done: !!set.onboardingDone,
        text_size_pct: [100, 115, 130].indexOf(set.textSizePct) >= 0 ? set.textSizePct : 100,
        sound_enabled: set.sound !== false,
        vibration_enabled: set.vibration !== false,
        timezone: s.timezone || 'America/Sao_Paulo',
      },
      virtual_brain_state: {
        current_stage: STAGE_TO_DB[p.highestBrainStageAchieved] || 'baby',
        total_points: num(p.growthPoints),
        total_completed_challenges: num(p.totalCompletedChallenges),
      },
      user_stats: {
        current_streak: num(p.currentStreak),
        total_active_days: num(p.totalActiveDays),
        last_active_date: p.lastActiveDate || null,
        total_mind: num(totals.MIND),
        total_movement: num(totals.MOVEMENT),
        total_selfcare: num(totals.SELFCARE),
        total_connection: num(totals.CONNECTION),
        total_discovery: num(totals.DISCOVERY),
        mind_activities_count: num(s.mindCount),
        completed_discoveries_count: num(s.discoveriesCount),
        total_walk_sessions: num(h.movement && h.movement.totalWalkSessions),
        total_selfcare_actions: num(h.selfCare && h.selfCare.totalSelfCareActions),
        total_water_glasses: num(h.selfCare && h.selfCare.totalWaterGlasses),
        total_social_connections: num(soc.totalSocialConnections),
      },
      active_days: (p.activeDates || []).map(function (d) { return { date: d }; }),
      challenge_completions: log.map(function (e, i) {
        return { challenge_type: String(e.p).toLowerCase(), challenge_id: e.k, date: e.d, event_key: keys[i] };
      }),
      daily_triads: Object.keys(p.triadCompletions || {}).map(function (d) {
        return { date: d, completed_challenge_ids: p.triadCompletions[d].slice() };
      }),
      daily_habits: [],
      discovery_history: (s.discoveryHistory || []).map(function (e) {
        return { discovery_id: e.id, shown_on: e.date, completed_at: e.completed ? (e.completedAt || e.date + 'T12:00:00Z') : null };
      }),
      user_achievements: (p.badges || []).filter(function (b) { return b.unlockedAt && BADGE_TO_DB[b.id]; }).map(function (b) {
        return { badge_key: BADGE_TO_DB[b.id], unlocked_at: b.unlockedAt };
      }),
    };

    // O app só guarda os hábitos do DIA ATUAL (a data vem do próprio estado).
    var day = (h.selfCare && h.selfCare.todayDate) || (soc && soc.todayDate) || null;
    if (day) {
      rows.daily_habits.push({
        date: day,
        walk_completed: !!(h.movement && h.movement.todayWalkCompleted && h.movement.lastWalkDate === day),
        water_glasses: Math.min(50, num(h.selfCare && h.selfCare.waterGlassesCount)),
        water_goal_met: !!(h.selfCare && h.selfCare.isWaterGoalMet),
        fruit_veggie_confirmed: !!(h.selfCare && h.selfCare.fruitVeggieConfirmed),
        sleep_routine_confirmed: !!(h.selfCare && h.selfCare.sleepRoutineConfirmed),
        social_call_completed: !!(soc.isConnectionCompletedToday && soc.todayDate === day),
        reminder_time: soc.reminderScheduledTime || null,
      });
    }
    return rows;
  }

  /* -------------------------------------------------------------------------
     PULL: junta o que veio do banco com o estado local. Nunca regride nada.
     remote = { profile, virtual_brain_state, user_stats, active_days[],
                challenge_completions[], daily_triads[], daily_habits[],
                discovery_history[], user_achievements[] }   (linhas como no banco)
     Retorna o mesmo formato de `snapshot` (novo objeto; o original não é alterado).
     ----------------------------------------------------------------------- */
  function mergePull(s, r) {
    r = r || {};
    var p = JSON.parse(JSON.stringify(s.progress || {}));
    var h = JSON.parse(JSON.stringify(s.habits || { movement: {}, selfCare: {} }));
    var soc = JSON.parse(JSON.stringify(s.social || {}));
    var out = {
      progress: p, habits: h, social: soc,
      mindCount: num(s.mindCount), discoveriesCount: num(s.discoveriesCount),
      discoveryHistory: (s.discoveryHistory || []).slice(),
      name: s.name || null,
      settings: Object.assign({ onboardingDone: false, textSizePct: 100, sound: true, vibration: true }, s.settings),
      timezone: s.timezone,
    };
    h.movement = h.movement || {}; h.selfCare = h.selfCare || {};

    var b = r.virtual_brain_state;
    if (b) {
      p.highestBrainStageAchieved = stageMax(p.highestBrainStageAchieved || 'BABY', STAGE_FROM_DB[b.current_stage] || 'BABY');
      p.growthPoints = max(p.growthPoints, b.total_points);
      p.totalCompletedChallenges = max(p.totalCompletedChallenges, b.total_completed_challenges);
    }

    var st = r.user_stats;
    if (st) {
      p.totalActiveDays = max(p.totalActiveDays, st.total_active_days);
      // Sequência: vale o snapshot do dia mais recente (ISO compara como texto).
      var localDay = p.lastActiveDate || null, remoteDay = st.last_active_date || null;
      if (remoteDay && (!localDay || remoteDay > localDay)) {
        p.lastActiveDate = remoteDay; p.currentStreak = num(st.current_streak);
      } else if (remoteDay && remoteDay === localDay) {
        p.currentStreak = max(p.currentStreak, st.current_streak);
      }
      p.pillarTotals = Object.assign({ MIND: 0, MOVEMENT: 0, SELFCARE: 0, CONNECTION: 0, DISCOVERY: 0 }, p.pillarTotals);
      p.pillarTotals.MIND = max(p.pillarTotals.MIND, st.total_mind);
      p.pillarTotals.MOVEMENT = max(p.pillarTotals.MOVEMENT, st.total_movement);
      p.pillarTotals.SELFCARE = max(p.pillarTotals.SELFCARE, st.total_selfcare);
      p.pillarTotals.CONNECTION = max(p.pillarTotals.CONNECTION, st.total_connection);
      p.pillarTotals.DISCOVERY = max(p.pillarTotals.DISCOVERY, st.total_discovery);
      out.mindCount = max(out.mindCount, st.mind_activities_count);
      out.discoveriesCount = max(out.discoveriesCount, st.completed_discoveries_count);
      h.movement.totalWalkSessions = max(h.movement.totalWalkSessions, st.total_walk_sessions);
      h.selfCare.totalSelfCareActions = max(h.selfCare.totalSelfCareActions, st.total_selfcare_actions);
      h.selfCare.totalWaterGlasses = max(h.selfCare.totalWaterGlasses, st.total_water_glasses);
      soc.totalSocialConnections = max(soc.totalSocialConnections, st.total_social_connections);
    }

    // Dias ativos: união, mantendo só a janela local de 60 dias.
    var days = uniqSorted((p.activeDates || []).concat((r.active_days || []).map(function (x) { return x.date; })));
    var cut = cutoffFor(days);
    p.activeDates = days.filter(function (d) { return d >= cut; });

    // Log de atividades: união por event_key.
    var localKeys = eventKeys(p.completionLog || []);
    var byKey = {};
    (p.completionLog || []).forEach(function (e, i) { byKey[localKeys[i]] = e; });
    (r.challenge_completions || []).forEach(function (row) {
      if (!row.event_key || byKey[row.event_key]) return;
      byKey[row.event_key] = { d: row.date, p: String(row.challenge_type).toUpperCase(), k: row.challenge_id };
    });
    var logCut = cutoffFor(Object.keys(byKey).map(function (k) { return byKey[k].d; }));
    p.completionLog = Object.keys(byKey).map(function (k) { return { key: k, e: byKey[k] }; })
      .sort(function (x, y) {
        if (x.e.d !== y.e.d) return x.e.d < y.e.d ? -1 : 1;
        var nx = Number(x.key.split('|').pop()), ny = Number(y.key.split('|').pop());
        return x.e.k === y.e.k ? nx - ny : (x.e.k < y.e.k ? -1 : 1);
      })
      .map(function (x) { return x.e; })
      .filter(function (e) { return e.d >= logCut; });

    // Tríade: união por dia.
    p.triadCompletions = p.triadCompletions || {};
    (r.daily_triads || []).forEach(function (row) {
      p.triadCompletions[row.date] = uniqSorted((p.triadCompletions[row.date] || []).concat(row.completed_challenge_ids || []));
    });

    // Conquistas: união; vale a data mais antiga.
    var badges = {};
    (p.badges || []).forEach(function (x) { badges[x.id] = x; });
    (r.user_achievements || []).forEach(function (row) {
      var id = BADGE_FROM_DB[row.badge_key];
      if (!id) return;
      var iso = new Date(row.unlocked_at).toISOString();
      if (!badges[id] || iso < badges[id].unlockedAt) badges[id] = { id: id, unlockedAt: iso };
    });
    p.badges = Object.keys(badges).map(function (k) { return badges[k]; });

    // Hábitos do dia: só se o dia do banco for o mesmo dia do estado local.
    var today = h.selfCare.todayDate;
    (r.daily_habits || []).forEach(function (row) {
      if (!today || row.date !== today) return;
      h.selfCare.waterGlassesCount = max(h.selfCare.waterGlassesCount, row.water_glasses);
      h.selfCare.isWaterGoalMet = !!(h.selfCare.isWaterGoalMet || row.water_goal_met);
      h.selfCare.fruitVeggieConfirmed = !!(h.selfCare.fruitVeggieConfirmed || row.fruit_veggie_confirmed);
      h.selfCare.sleepRoutineConfirmed = !!(h.selfCare.sleepRoutineConfirmed || row.sleep_routine_confirmed);
      if (row.walk_completed) { h.movement.todayWalkCompleted = true; h.movement.lastWalkDate = today; }
      if (row.social_call_completed && soc.todayDate === today) soc.isConnectionCompletedToday = true;
      if (row.reminder_time && !soc.reminderScheduledTime) soc.reminderScheduledTime = String(row.reminder_time).slice(0, 5);
    });

    // Descobertas: união por (id, data); concluída nunca volta a "não concluída".
    var hist = {};
    out.discoveryHistory.forEach(function (e) { hist[e.id + '|' + e.date] = Object.assign({}, e); });
    (r.discovery_history || []).forEach(function (row) {
      var k = row.discovery_id + '|' + row.shown_on;
      var done = !!row.completed_at;
      if (!hist[k]) hist[k] = { id: row.discovery_id, date: row.shown_on };
      if (done) { hist[k].completed = true; hist[k].completedAt = new Date(row.completed_at).toISOString(); }
    });
    out.discoveryHistory = Object.keys(hist).map(function (k) { return hist[k]; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    // Perfil: nome local tem prioridade; "boas-vindas já vistas" vale em qualquer aparelho;
    // preferências de tamanho/som/vibração são do aparelho e ficam como estão.
    var pr = r.profile;
    if (pr) {
      if (!out.name && pr.display_name) out.name = pr.display_name;
      if (pr.onboarding_done) out.settings.onboardingDone = true;
    }
    return out;
  }

  EM.domain.syncMapper = {
    buildPush: buildPush,
    mergePull: mergePull,
    eventKeys: eventKeys,
    STAGE_TO_DB: STAGE_TO_DB,
    BADGE_TO_DB: BADGE_TO_DB,
  };
})(window);
