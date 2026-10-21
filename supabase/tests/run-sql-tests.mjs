// Aplica TODAS as migrations de supabase/migrations/ num Postgres real (PGlite)
// com um esboço mínimo do esquema `auth` e dos roles do Supabase, e testa:
// RLS, merge monotônico, idempotência, cascata de exclusão e privilégios.
//
//   cd supabase/tests && npm install && npm test
//
// NÃO substitui um teste contra o projeto Supabase real (veja docs/SUPABASE_HANDOFF.md §9).
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', 'migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

const db = new PGlite({ extensions: { uuid_ossp } });

let passed = 0, failed = 0;
const ok = (name) => { passed++; console.log('  ✓', name); };
const bad = (name, e) => { failed++; console.log('  ✗', name, '\n     ', String(e && e.message || e).split('\n')[0]); };
async function test(name, fn) { try { await fn(); ok(name); } catch (e) { bad(name, e); } }
const eq = (a, b, msg) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg || 'valor'}: esperado ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); };
async function rejects(promise, re, msg) {
  try { await promise; } catch (e) { if (!re || re.test(e.message)) return; throw new Error(`${msg}: erro inesperado: ${e.message}`); }
  throw new Error(`${msg}: deveria ter falhado`);
}

// --- esboço do Supabase -----------------------------------------------------
await db.exec(`
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_user_meta_data jsonb,
    is_anonymous boolean NOT NULL DEFAULT false
  );
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
    $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
  GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
`);

// Como um "aparelho": executa como `authenticated` com o JWT do usuário.
async function as(userId, fn) {
  await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${userId}', false);`);
  try { return await fn(); } finally { await db.exec(`RESET ROLE; SELECT set_config('request.jwt.claim.sub', '', false);`); }
}
const q = async (sql, params) => (await db.query(sql, params)).rows;

console.log('Migrations:', files.join(', '));

// 1) esquema v1 + um usuário "antigo" (antes das novas migrations)
await db.exec(readFileSync(join(migrationsDir, files[0]), 'utf8'));
const [{ id: OLD }] = await q(`INSERT INTO auth.users (raw_user_meta_data) VALUES ('{"display_name":"Dona Rosa"}') RETURNING id`);
// 2) novas migrations, em ordem
for (const f of files.slice(1)) await db.exec(readFileSync(join(migrationsDir, f), 'utf8'));

const [{ id: A }] = await q(`INSERT INTO auth.users (is_anonymous) VALUES (true) RETURNING id`);
const [{ id: B }] = await q(`INSERT INTO auth.users (is_anonymous) VALUES (true) RETURNING id`);

console.log('\nCriação de usuário');
await test('novo usuário ganha profile, cérebro e stats; anônimo fica sem nome', async () => {
  eq((await q(`SELECT display_name FROM profiles WHERE id=$1`, [A]))[0].display_name, null, 'display_name');
  eq((await q(`SELECT current_stage, total_points, total_completed_challenges FROM virtual_brain_state WHERE user_id=$1`, [A]))[0], { current_stage: 'baby', total_points: 0, total_completed_challenges: 0 }, 'cérebro');
  eq((await q(`SELECT current_streak, total_active_days FROM user_stats WHERE user_id=$1`, [A]))[0], { current_streak: 0, total_active_days: 0 }, 'stats');
});
await test('usuário que já existia antes da migration recebe user_stats (backfill) e mantém o nome', async () => {
  eq((await q(`SELECT count(*)::int n FROM user_stats WHERE user_id=$1`, [OLD]))[0].n, 1, 'backfill');
  eq((await q(`SELECT display_name FROM profiles WHERE id=$1`, [OLD]))[0].display_name, 'Dona Rosa', 'nome');
});
await test('migrations são idempotentes (rodar de novo não quebra)', async () => {
  for (const f of files.slice(1)) await db.exec(readFileSync(join(migrationsDir, f), 'utf8'));
});

console.log('\nRLS e privilégios');
await test('usuário só vê as próprias linhas', async () => {
  await as(A, () => db.query(`INSERT INTO daily_habits (date, water_glasses) VALUES ('2026-10-21', 2)`));
  eq(await as(B, () => q(`SELECT * FROM daily_habits`)), [], 'B não deve ver nada de A');
  eq((await as(A, () => q(`SELECT count(*)::int n FROM daily_habits`)))[0].n, 1, 'A vê a sua');
});
await test('user_id é preenchido automaticamente com auth.uid()', async () => {
  eq((await q(`SELECT user_id FROM daily_habits LIMIT 1`))[0].user_id, A, 'user_id');
});
await test('não dá para inserir linha em nome de outro usuário (WITH CHECK)', async () => {
  await rejects(as(B, () => db.query(`INSERT INTO daily_habits (user_id, date) VALUES ($1, '2026-10-22')`, [A])), /row-level security/i, 'insert cruzado');
});
await test('não dá para alterar nem apagar linhas de outro usuário', async () => {
  const r = await as(B, () => db.query(`UPDATE daily_habits SET water_glasses = 50 WHERE user_id=$1`, [A]));
  eq(r.affectedRows, 0, 'update cruzado');
  const d = await as(B, () => db.query(`DELETE FROM user_stats WHERE user_id=$1`, [A]));
  eq(d.affectedRows, 0, 'delete cruzado');
});
await test('role anon não acessa nada', async () => {
  await db.exec(`SET ROLE anon`);
  try {
    for (const t of ['user_stats', 'daily_habits', 'active_days', 'discovery_history', 'profiles', 'challenge_completions'])
      await rejects(db.query(`SELECT * FROM ${t}`), /permission denied/i, `anon em ${t}`);
  } finally { await db.exec(`RESET ROLE`); }
});
await test('CHECKs recusam valores inválidos', async () => {
  await rejects(as(A, () => db.query(`UPDATE profiles SET text_size_pct = 120 WHERE id=$1`, [A])), /check/i, 'text_size_pct');
  await rejects(as(A, () => db.query(`UPDATE daily_habits SET water_glasses = 60`)), /check/i, 'water_glasses');
  await rejects(as(A, () => db.query(`UPDATE profiles SET display_name = repeat('x', 61) WHERE id=$1`, [A])), /check/i, 'display_name');
});

console.log('\nMerge monotônico (progresso nunca regride)');
await test('user_stats: contadores só crescem', async () => {
  await as(A, () => db.query(`UPDATE user_stats SET total_mind=5, total_water_glasses=8, total_active_days=3, last_active_date='2026-10-21', current_streak=3`));
  await as(A, () => db.query(`UPDATE user_stats SET total_mind=2, total_water_glasses=1, total_active_days=1, last_active_date='2026-10-21', current_streak=3`));
  eq((await q(`SELECT total_mind, total_water_glasses, total_active_days FROM user_stats WHERE user_id=$1`, [A]))[0], { total_mind: 5, total_water_glasses: 8, total_active_days: 3 }, 'contadores');
});
await test('sequência: aparelho atrasado (data mais antiga) não sobrescreve o mais novo', async () => {
  await as(A, () => db.query(`UPDATE user_stats SET last_active_date='2026-10-10', current_streak=1`));
  eq((await q(`SELECT to_char(last_active_date,'YYYY-MM-DD') d, current_streak s FROM user_stats WHERE user_id=$1`, [A]))[0], { d: '2026-10-21', s: 3 }, 'streak');
});
await test('sequência: após uma pausa o snapshot mais novo pode recomeçar em 1 (sem culpa)', async () => {
  await as(A, () => db.query(`UPDATE user_stats SET last_active_date='2026-11-05', current_streak=1`));
  eq((await q(`SELECT to_char(last_active_date,'YYYY-MM-DD') d, current_streak s, total_active_days n FROM user_stats WHERE user_id=$1`, [A]))[0], { d: '2026-11-05', s: 1, n: 3 }, 'streak');
});
await test('cérebro: estágio e pontos nunca regridem', async () => {
  await as(A, () => db.query(`UPDATE virtual_brain_state SET current_stage='kid', total_points=120, total_completed_challenges=12`));
  await as(A, () => db.query(`UPDATE virtual_brain_state SET current_stage='baby', total_points=10, total_completed_challenges=1`));
  eq((await q(`SELECT current_stage, total_points, total_completed_challenges FROM virtual_brain_state WHERE user_id=$1`, [A]))[0], { current_stage: 'kid', total_points: 120, total_completed_challenges: 12 }, 'cérebro');
  await as(A, () => db.query(`UPDATE virtual_brain_state SET current_stage='mega_brain'`));
  eq((await q(`SELECT current_stage FROM virtual_brain_state WHERE user_id=$1`, [A]))[0].current_stage, 'mega_brain', 'sobe');
});
await test('hábitos do dia: booleans só viram true, copos só aumentam, lembrete é mantido', async () => {
  await as(A, () => db.query(`UPDATE daily_habits SET walk_completed=true, water_glasses=4, water_goal_met=true, reminder_time='16:00'`));
  await as(A, () => db.query(`UPDATE daily_habits SET walk_completed=false, water_glasses=1, water_goal_met=false, reminder_time=NULL`));
  eq((await q(`SELECT walk_completed w, water_glasses g, water_goal_met m, reminder_time::text r FROM daily_habits WHERE user_id=$1`, [A]))[0], { w: true, g: 4, m: true, r: '16:00:00' }, 'hábitos');
});
await test('descobertas: concluída nunca volta a "não concluída"', async () => {
  await as(A, () => db.query(`INSERT INTO discovery_history (discovery_id, shown_on, completed_at) VALUES ('d1', '2026-10-21', '2026-10-21T10:00:00Z')`));
  await as(A, () => db.query(`INSERT INTO discovery_history (discovery_id, shown_on) VALUES ('d1', '2026-10-21') ON CONFLICT (user_id, discovery_id, shown_on) DO UPDATE SET completed_at = EXCLUDED.completed_at`));
  eq((await q(`SELECT completed_at IS NOT NULL c FROM discovery_history WHERE user_id=$1`, [A]))[0].c, true, 'completed_at');
});
await test('tríade: ids concluídos são unidos, nunca perdidos', async () => {
  await as(A, () => db.query(`INSERT INTO daily_triads (date, challenge_ids, completed_challenge_ids) VALUES ('2026-10-21', '{a,b,c}', '{a}')`));
  await as(A, () => db.query(`UPDATE daily_triads SET completed_challenge_ids='{c}' WHERE date='2026-10-21'`));
  eq((await q(`SELECT completed_challenge_ids c FROM daily_triads WHERE user_id=$1`, [A]))[0].c, ['a', 'c'], 'união');
});
await test('conquistas: vale a data do primeiro desbloqueio', async () => {
  await as(A, () => db.query(`INSERT INTO user_achievements (badge_key, unlocked_at) VALUES ('first_steps', '2026-10-01T00:00:00Z')`));
  await as(A, () => db.query(`UPDATE user_achievements SET unlocked_at='2026-12-01T00:00:00Z' WHERE badge_key='first_steps'`));
  eq((await q(`SELECT to_char(unlocked_at AT TIME ZONE 'UTC','YYYY-MM-DD') d FROM user_achievements WHERE user_id=$1`, [A]))[0].d, '2026-10-01', 'unlocked_at');
});

console.log('\nLog de atividades (idempotência)');
await test('mesmo lote enviado duas vezes não duplica (event_key) e aceita pilar "discovery"', async () => {
  const send = () => as(A, async () => {
    await db.query(`INSERT INTO challenge_completions (challenge_type, challenge_id, date, event_key) VALUES
      ('mind','game:memory','2026-10-21','2026-10-21|game:memory|1'),
      ('mind','game:memory','2026-10-21','2026-10-21|game:memory|2'),
      ('discovery','discovery','2026-10-21','2026-10-21|discovery|1')
      ON CONFLICT (user_id, event_key) DO NOTHING`);
  });
  await send(); await send();
  eq((await q(`SELECT count(*)::int n FROM challenge_completions WHERE user_id=$1`, [A]))[0].n, 3, 'linhas');
});
await test('dias ativos: reenvio é idempotente', async () => {
  for (let i = 0; i < 2; i++) await as(A, () => db.query(`INSERT INTO active_days (date) VALUES ('2026-10-21'), ('2026-10-22') ON CONFLICT DO NOTHING`));
  eq((await q(`SELECT count(*)::int n FROM active_days WHERE user_id=$1`, [A]))[0].n, 2, 'dias');
});

console.log('\nExclusão de conta (LGPD)');
await test('delete_my_account apaga o usuário e TODOS os dados dele, e só dele', async () => {
  await as(B, () => db.query(`INSERT INTO daily_habits (date) VALUES ('2026-10-21')`));
  await as(A, () => db.query(`SELECT public.delete_my_account()`));
  for (const t of ['profiles:id', 'virtual_brain_state:user_id', 'user_stats:user_id', 'daily_habits:user_id', 'active_days:user_id', 'discovery_history:user_id', 'daily_triads:user_id', 'challenge_completions:user_id', 'user_achievements:user_id']) {
    const [tbl, col] = t.split(':');
    eq((await q(`SELECT count(*)::int n FROM ${tbl} WHERE ${col}=$1`, [A]))[0].n, 0, `${tbl} de A`);
  }
  eq((await q(`SELECT count(*)::int n FROM daily_habits WHERE user_id=$1`, [B]))[0].n, 1, 'dados de B intactos');
});
await test('anon não consegue executar delete_my_account', async () => {
  await db.exec(`SET ROLE anon`);
  try { await rejects(db.query(`SELECT public.delete_my_account()`), /permission denied/i, 'anon'); } finally { await db.exec(`RESET ROLE`); }
});


// ============================================================================
// Mapeador do cliente (web/js/domain/sync-mapper.js) contra o banco real
// ============================================================================
import vm from 'node:vm';
const win = { EM: {} }; win.window = win;
vm.runInNewContext(readFileSync(join(here, '..', '..', 'web', 'js', 'domain', 'sync-mapper.js'), 'utf8'), win);
const M = win.EM.domain.syncMapper;

const [{ id: C }] = await q(`INSERT INTO auth.users (is_anonymous) VALUES (true) RETURNING id`);
const [{ id: D }] = await q(`INSERT INTO auth.users (is_anonymous) VALUES (true) RETURNING id`);

const SNAP = {
  progress: {
    totalCompletedChallenges: 7, highestBrainStageAchieved: 'KID', currentStreak: 3, totalActiveDays: 4,
    lastActiveDate: '2026-10-21', growthPoints: 70,
    activeDates: ['2026-10-19', '2026-10-20', '2026-10-21'],
    triadCompletions: { '2026-10-21': ['movement_walk_10min', 'mind_memory_pairs'] },
    completionLog: [
      { d: '2026-10-20', p: 'MIND', k: 'game:memory' },
      { d: '2026-10-21', p: 'MIND', k: 'game:memory' },
      { d: '2026-10-21', p: 'MIND', k: 'game:memory' },
      { d: '2026-10-21', p: 'MOVEMENT', k: 'walk' },
      { d: '2026-10-21', p: 'SELFCARE', k: 'water' },
      { d: '2026-10-21', p: 'CONNECTION', k: 'call' },
      { d: '2026-10-21', p: 'DISCOVERY', k: 'discovery' },
    ],
    pillarTotals: { MIND: 3, MOVEMENT: 1, SELFCARE: 1, CONNECTION: 1, DISCOVERY: 1 },
    badges: [{ id: 'BADGE_FIRST_STEPS', unlockedAt: '2026-10-20T15:00:00.000Z' }],
  },
  habits: {
    movement: { todayWalkCompleted: true, totalWalkSessions: 2, lastWalkDate: '2026-10-21', targetMinutes: 10 },
    selfCare: { todayDate: '2026-10-21', waterGlassesCount: 4, isWaterGoalMet: true, fruitVeggieConfirmed: true, sleepRoutineConfirmed: false, totalSelfCareActions: 3, totalWaterGlasses: 9 },
  },
  social: { todayDate: '2026-10-21', isConnectionCompletedToday: true, totalSocialConnections: 5, lastConnectionDate: '2026-10-21', reminderScheduledTime: '16:00' },
  mindCount: 3, discoveriesCount: 1,
  discoveryHistory: [{ id: 'd_music_1', date: '2026-10-21', completed: true }],
  name: 'Ana',
  settings: { onboardingDone: true, textSizePct: 115, sound: false, vibration: true },
};
const EMPTY = { progress: { totalCompletedChallenges: 0, highestBrainStageAchieved: 'BABY', currentStreak: 0, totalActiveDays: 0, lastActiveDate: null, growthPoints: 0, activeDates: [], triadCompletions: {}, completionLog: [], pillarTotals: { MIND: 0, MOVEMENT: 0, SELFCARE: 0, CONNECTION: 0, DISCOVERY: 0 }, badges: [] },
  habits: { movement: { todayWalkCompleted: false, totalWalkSessions: 0, lastWalkDate: null }, selfCare: { todayDate: '2026-10-21', waterGlassesCount: 0, isWaterGoalMet: false, fruitVeggieConfirmed: false, sleepRoutineConfirmed: false, totalSelfCareActions: 0, totalWaterGlasses: 0 } },
  social: { todayDate: '2026-10-21', isConnectionCompletedToday: false, totalSocialConnections: 0, reminderScheduledTime: null },
  mindCount: 0, discoveriesCount: 0, discoveryHistory: [], name: null, settings: { onboardingDone: false, textSizePct: 100, sound: true, vibration: true } };

// Equivalente ao que o cliente faria via PostgREST (PATCH / upsert), como o usuário `uid`.
async function push(uid, rows) {
  await as(uid, async () => {
    const upd = async (table, key, row) => {
      const cols = Object.keys(row);
      await db.query(`UPDATE ${table} SET ${cols.map((c, i) => `${c}=$${i + 1}`).join(', ')} WHERE ${key}=auth.uid()`, cols.map((c) => row[c]));
    };
    const ups = async (table, list, conflict, action) => {
      for (const row of list) {
        const cols = Object.keys(row);
        const set = cols.filter((c) => !conflict.includes(c)).map((c) => `${c}=EXCLUDED.${c}`).join(', ');
        const on = action === 'nothing' || !set ? 'DO NOTHING' : `DO UPDATE SET ${set}`;
        await db.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (${conflict.join(',')}) ${on}`, cols.map((c) => row[c]));
      }
    };
    await upd('profiles', 'id', rows.profile);
    await upd('virtual_brain_state', 'user_id', rows.virtual_brain_state);
    await upd('user_stats', 'user_id', rows.user_stats);
    await ups('active_days', rows.active_days, ['user_id', 'date'], 'nothing');
    await ups('challenge_completions', rows.challenge_completions, ['user_id', 'event_key'], 'nothing');
    await ups('daily_triads', rows.daily_triads, ['user_id', 'date']);
    await ups('daily_habits', rows.daily_habits, ['user_id', 'date']);
    await ups('discovery_history', rows.discovery_history, ['user_id', 'discovery_id', 'shown_on']);
    await ups('user_achievements', rows.user_achievements, ['user_id', 'badge_key']);
  });
}
// to_jsonb: datas/horas chegam como TEXTO, exatamente como o PostgREST entrega.
async function pull(uid) {
  return as(uid, async () => {
    const all = async (t) => (await q(`SELECT to_jsonb(t) AS r FROM ${t} t`)).map((x) => x.r);
    return {
      profile: (await all('profiles'))[0], virtual_brain_state: (await all('virtual_brain_state'))[0], user_stats: (await all('user_stats'))[0],
      active_days: await all('active_days'), challenge_completions: await all('challenge_completions'), daily_triads: await all('daily_triads'),
      daily_habits: await all('daily_habits'), discovery_history: await all('discovery_history'), user_achievements: await all('user_achievements'),
    };
  });
}
const norm = (list) => list.map((x) => JSON.stringify(x)).sort();

console.log('\nMapeador do cliente × banco real');
await test('buildPush gera event_keys determinísticos (data|atividade|nº)', async () => {
  eq(M.eventKeys(SNAP.progress.completionLog).slice(0, 4), ['2026-10-20|game:memory|1', '2026-10-21|game:memory|1', '2026-10-21|game:memory|2', '2026-10-21|walk|1'], 'keys');
});
await test('ciclo completo: estado local → banco → aparelho novo recupera TUDO', async () => {
  await push(C, M.buildPush(SNAP));
  const back = M.mergePull(EMPTY, await pull(C));
  eq(back.progress.totalCompletedChallenges, 7, 'desafios'); eq(back.progress.highestBrainStageAchieved, 'KID', 'estágio');
  eq(back.progress.growthPoints, 70, 'pontos'); eq(back.progress.currentStreak, 3, 'sequência');
  eq(back.progress.lastActiveDate, '2026-10-21', 'último dia'); eq(back.progress.totalActiveDays, 4, 'dias ativos');
  eq(back.progress.activeDates, SNAP.progress.activeDates, 'activeDates'); eq(back.progress.pillarTotals, SNAP.progress.pillarTotals, 'pilares');
  eq(norm(back.progress.completionLog), norm(SNAP.progress.completionLog), 'completionLog');
  eq(back.progress.triadCompletions['2026-10-21'].slice().sort(), SNAP.progress.triadCompletions['2026-10-21'].slice().sort(), 'tríade (como conjunto)');
  eq(back.progress.badges, SNAP.progress.badges, 'conquistas');
  eq(back.habits.selfCare.waterGlassesCount, 4, 'copos'); eq(back.habits.selfCare.fruitVeggieConfirmed, true, 'fruta');
  eq(back.habits.movement.todayWalkCompleted, true, 'caminhada'); eq(back.habits.movement.totalWalkSessions, 2, 'sessões');
  eq(back.social.isConnectionCompletedToday, true, 'ligação'); eq(back.social.reminderScheduledTime, '16:00', 'lembrete'); eq(back.social.totalSocialConnections, 5, 'ligações');
  eq(back.mindCount, 3, 'mente'); eq(back.discoveriesCount, 1, 'descobertas');
  eq(back.discoveryHistory.map((e) => [e.id, e.date, !!e.completed]), [['d_music_1', '2026-10-21', true]], 'histórico');
  eq(back.name, 'Ana', 'nome'); eq(back.settings.onboardingDone, true, 'boas-vindas já vistas');
  eq(back.settings.textSizePct, 100, 'preferência de tamanho continua do aparelho');
});
await test('reenviar o mesmo estado várias vezes não duplica nada', async () => {
  await push(C, M.buildPush(SNAP)); await push(C, M.buildPush(SNAP));
  const r = await pull(C);
  eq(r.challenge_completions.length, 7, 'completions'); eq(r.active_days.length, 3, 'dias'); eq(r.user_achievements.length, 1, 'conquistas');
});
await test('aparelho atrasado envia estado velho: o banco não regride', async () => {
  const stale = JSON.parse(JSON.stringify(SNAP));
  Object.assign(stale.progress, { totalCompletedChallenges: 2, highestBrainStageAchieved: 'BABY', growthPoints: 20, currentStreak: 1, lastActiveDate: '2026-10-19', totalActiveDays: 1 });
  stale.habits.selfCare.waterGlassesCount = 1; stale.habits.selfCare.isWaterGoalMet = false; stale.habits.movement.todayWalkCompleted = false;
  await push(C, M.buildPush(stale));
  const r = await pull(C);
  eq([r.virtual_brain_state.current_stage, r.virtual_brain_state.total_points, r.virtual_brain_state.total_completed_challenges], ['kid', 70, 7], 'cérebro');
  eq([r.user_stats.current_streak, r.user_stats.last_active_date, r.user_stats.total_active_days], [3, '2026-10-21', 4], 'stats');
  eq([r.daily_habits[0].water_glasses, r.daily_habits[0].water_goal_met, r.daily_habits[0].walk_completed], [4, true, true], 'hábitos');
});
await test('dois aparelhos com atividades diferentes convergem para a união', async () => {
  const dev1 = JSON.parse(JSON.stringify(EMPTY)); dev1.progress.completionLog = [{ d: '2026-10-21', p: 'MIND', k: 'game:words' }];
  dev1.progress.totalCompletedChallenges = 1; dev1.progress.pillarTotals.MIND = 1; dev1.progress.activeDates = ['2026-10-21']; dev1.progress.lastActiveDate = '2026-10-21'; dev1.progress.currentStreak = 1; dev1.progress.totalActiveDays = 1;
  const dev2 = JSON.parse(JSON.stringify(dev1)); dev2.progress.completionLog = [{ d: '2026-10-21', p: 'MIND', k: 'game:music' }];
  await push(D, M.buildPush(dev1)); await push(D, M.buildPush(dev2));
  const merged = M.mergePull(dev1, await pull(D));
  eq(norm(merged.progress.completionLog), norm([{ d: '2026-10-21', p: 'MIND', k: 'game:words' }, { d: '2026-10-21', p: 'MIND', k: 'game:music' }]), 'log unido');
});

console.log(`\n${passed} passaram, ${failed} falharam`);
process.exit(failed ? 1 : 0);
