-- ============================================================================
-- everMind: PWA persistence — passo 2 de 2
-- Migration: 20261021000100_pwa_persistence.sql
--
-- Objetivo: guardar, POR USUÁRIO, tudo o que o PWA (web/) hoje mantém só no
-- localStorage do aparelho. Veja docs/SUPABASE_HANDOFF.md para o mapeamento
-- chave-a-chave e o protocolo de sincronização.
--
-- Princípios (CONTEXT.md / ADR-0003 / ADR-0002):
--   • Aditiva: não altera nem remove nada do esquema anterior.
--   • Local-first: o app continua funcionando offline; o banco é a cópia
--     durável e a ponte entre aparelhos.
--   • O progresso NUNCA regride: triggers de "merge monotônico" no banco
--     garantem isso mesmo se um aparelho antigo enviar dados velhos.
--   • Idempotente: o cliente pode reenviar o mesmo lote quantas vezes quiser.
--   • RLS estrita: cada usuário só enxerga e altera as próprias linhas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles — ajustes do usuário (antes: chaves settings_* e onboarding_done)
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS text_size_pct smallint NOT NULL DEFAULT 100
    CHECK (text_size_pct IN (100, 115, 130)),
  ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS vibration_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Sao_Paulo';

DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_display_name_len CHECK (display_name IS NULL OR char_length(display_name) <= 60);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.profiles.display_name IS 'Nome opcional para a saudação. NULL = o app mostra só "Bom dia!". (Antes: evermind:evermind_user_name)';
COMMENT ON COLUMN public.profiles.onboarding_done IS 'Boas-vindas já vistas. (Antes: evermind:onboarding_done)';
COMMENT ON COLUMN public.profiles.text_size_pct IS 'Tamanho do texto: 100 (Normal), 115 (Grande) ou 130 (Maior). (Antes: evermind:settings_text_size)';
COMMENT ON COLUMN public.profiles.sound_enabled IS 'Sons suaves ligados. (Antes: evermind:settings_sound)';
COMMENT ON COLUMN public.profiles.vibration_enabled IS 'Vibração leve ligada. (Antes: evermind:settings_vibration)';
COMMENT ON COLUMN public.profiles.timezone IS 'Fuso IANA do usuário; define o "dia" local. O app usa datas LOCAIS (ADR-0009).';

-- Usuários anônimos não têm nome: não inventar "Amigo everMind" (o app trataria
-- como se o usuário tivesse digitado esse nome). Também cria a linha de stats.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.virtual_brain_state (user_id, current_stage, total_points)
  VALUES (NEW.id, 'baby'::brain_stage_type, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. virtual_brain_state — total de desafios (base do estágio do cérebro)
-- ----------------------------------------------------------------------------

ALTER TABLE public.virtual_brain_state
  ADD COLUMN IF NOT EXISTS total_completed_challenges integer NOT NULL DEFAULT 0
    CHECK (total_completed_challenges >= 0);

COMMENT ON COLUMN public.virtual_brain_state.total_completed_challenges IS 'Total acumulado de desafios concluídos. Define o estágio (1-5 baby, 6-20 kid, 21-50 teen, 51+ mega_brain). (Antes: totalCompletedChallenges)';
COMMENT ON COLUMN public.virtual_brain_state.current_stage IS 'Maior estágio já alcançado (nunca regride). Mapeia BABY|KID|TEEN|MEGA do app para baby|kid|teen|mega_brain. (Antes: highestBrainStageAchieved)';
COMMENT ON COLUMN public.virtual_brain_state.total_points IS 'Pontos de crescimento acumulados (+10 por atividade). (Antes: growthPoints)';
COMMENT ON TYPE brain_stage_type IS 'Estágios do Cérebro Virtual: baby 1-5, kid 6-20, teen 21-50, mega_brain 51+ desafios.';

-- ----------------------------------------------------------------------------
-- 3. user_stats — sequência acolhedora e contadores vitalícios (1 linha/usuário)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Sequência acolhedora (Gentle Streak)
  current_streak integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  total_active_days integer NOT NULL DEFAULT 0 CHECK (total_active_days >= 0),
  last_active_date date,
  -- Contadores por pilar (pillarTotals do app)
  total_mind integer NOT NULL DEFAULT 0 CHECK (total_mind >= 0),
  total_movement integer NOT NULL DEFAULT 0 CHECK (total_movement >= 0),
  total_selfcare integer NOT NULL DEFAULT 0 CHECK (total_selfcare >= 0),
  total_connection integer NOT NULL DEFAULT 0 CHECK (total_connection >= 0),
  total_discovery integer NOT NULL DEFAULT 0 CHECK (total_discovery >= 0),
  -- Contadores das telas
  mind_activities_count integer NOT NULL DEFAULT 0 CHECK (mind_activities_count >= 0),
  completed_discoveries_count integer NOT NULL DEFAULT 0 CHECK (completed_discoveries_count >= 0),
  total_walk_sessions integer NOT NULL DEFAULT 0 CHECK (total_walk_sessions >= 0),
  total_selfcare_actions integer NOT NULL DEFAULT 0 CHECK (total_selfcare_actions >= 0),
  total_water_glasses integer NOT NULL DEFAULT 0 CHECK (total_water_glasses >= 0),
  total_social_connections integer NOT NULL DEFAULT 0 CHECK (total_social_connections >= 0),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.user_stats IS 'Sequência acolhedora e contadores vitalícios. Só crescem (merge monotônico no trigger).';
COMMENT ON COLUMN public.user_stats.current_streak IS 'Sequência atual. Única coluna que pode voltar a 1 após uma pausa (nunca é exibida como perda). (Antes: currentStreak)';
COMMENT ON COLUMN public.user_stats.last_active_date IS 'Último dia local com atividade. (Antes: lastActiveDate)';
COMMENT ON COLUMN public.user_stats.mind_activities_count IS '(Antes: evermind:evermind_mind_activities_count)';
COMMENT ON COLUMN public.user_stats.completed_discoveries_count IS '(Antes: evermind:evermind_completed_discoveries_count)';
COMMENT ON COLUMN public.user_stats.total_walk_sessions IS '(Antes: habits.movement.totalWalkSessions)';
COMMENT ON COLUMN public.user_stats.total_selfcare_actions IS '(Antes: habits.selfCare.totalSelfCareActions)';
COMMENT ON COLUMN public.user_stats.total_water_glasses IS '(Antes: habits.selfCare.totalWaterGlasses)';
COMMENT ON COLUMN public.user_stats.total_social_connections IS '(Antes: social.totalSocialConnections)';

-- Linha de stats para usuários que já existiam antes desta migration.
INSERT INTO public.user_stats (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. active_days — dias com atividade (activeDates; base da "Semana Ativa")
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.active_days (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  PRIMARY KEY (user_id, date)
);

COMMENT ON TABLE public.active_days IS 'Dias locais com ao menos uma atividade. Só inserção (o app guarda os 60 últimos; aqui fica o histórico completo). (Antes: activeDates)';

-- ----------------------------------------------------------------------------
-- 5. challenge_completions — chave de idempotência do log de atividades
-- ----------------------------------------------------------------------------

ALTER TABLE public.challenge_completions
  ADD COLUMN IF NOT EXISTS event_key text;

DO $$ BEGIN
  ALTER TABLE public.challenge_completions
    ADD CONSTRAINT challenge_completions_event_key_len CHECK (event_key IS NULL OR char_length(event_key) <= 80);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Índice único NÃO parcial: permite `on_conflict=user_id,event_key` no PostgREST.
-- (NULLs não colidem entre si, então linhas antigas sem event_key continuam válidas.)
CREATE UNIQUE INDEX IF NOT EXISTS uq_challenge_completions_user_event
  ON public.challenge_completions (user_id, event_key);

COMMENT ON COLUMN public.challenge_completions.challenge_type IS 'Pilar: mind, movement, selfcare, connection ou discovery. Mapeia o "p" do completionLog do app (MIND|MOVEMENT|SELFCARE|CONNECTION|DISCOVERY) em minúsculas.';
COMMENT ON COLUMN public.challenge_completions.challenge_id IS 'Atividade: o "k" do completionLog (walk, water, fruit, sleep, call, discovery, game:memory, game:sequence, game:words, game:attention, game:music).';
COMMENT ON COLUMN public.challenge_completions.event_key IS 'Chave determinística de idempotência: "<date>|<k>|<n>", com n = nº de ordem (1, 2, ...) dessa atividade nesse dia. Reenviar o mesmo lote não duplica.';

-- ----------------------------------------------------------------------------
-- 6. daily_triads — o que foi concluído da Tríade de cada dia
-- ----------------------------------------------------------------------------

ALTER TABLE public.daily_triads
  ADD COLUMN IF NOT EXISTS completed_challenge_ids text[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.daily_triads.completed_challenge_ids IS 'Ids da Tríade já concluídos naquele dia (só crescem; união no merge). (Antes: triadCompletions[date])';

-- ----------------------------------------------------------------------------
-- 7. daily_habits — hábitos do dia (caminhada, água, fruta, sono, ligação)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.daily_habits (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  walk_completed boolean NOT NULL DEFAULT false,
  water_glasses smallint NOT NULL DEFAULT 0 CHECK (water_glasses BETWEEN 0 AND 50),
  water_goal_met boolean NOT NULL DEFAULT false,
  fruit_veggie_confirmed boolean NOT NULL DEFAULT false,
  sleep_routine_confirmed boolean NOT NULL DEFAULT false,
  social_call_completed boolean NOT NULL DEFAULT false,
  reminder_time time,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, date)
);

COMMENT ON TABLE public.daily_habits IS 'Um registro por usuário e dia local. Booleans só passam de false para true; copos só aumentam (merge monotônico).';
COMMENT ON COLUMN public.daily_habits.walk_completed IS '(Antes: habits.movement.todayWalkCompleted)';
COMMENT ON COLUMN public.daily_habits.water_glasses IS '(Antes: habits.selfCare.waterGlassesCount)';
COMMENT ON COLUMN public.daily_habits.water_goal_met IS 'Meta de 4 copos atingida. (Antes: habits.selfCare.isWaterGoalMet)';
COMMENT ON COLUMN public.daily_habits.fruit_veggie_confirmed IS '(Antes: habits.selfCare.fruitVeggieConfirmed)';
COMMENT ON COLUMN public.daily_habits.sleep_routine_confirmed IS '(Antes: habits.selfCare.sleepRoutineConfirmed)';
COMMENT ON COLUMN public.daily_habits.social_call_completed IS '(Antes: social.isConnectionCompletedToday)';
COMMENT ON COLUMN public.daily_habits.reminder_time IS 'Horário do lembrete de ligação, se houver. (Antes: social.reminderScheduledTime)';

-- ----------------------------------------------------------------------------
-- 8. discovery_history — o que já foi sorteado/concluído em "Descubra Algo Novo"
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.discovery_history (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_id text NOT NULL CHECK (char_length(discovery_id) BETWEEN 1 AND 80),
  shown_on date NOT NULL,
  completed_at timestamptz,
  PRIMARY KEY (user_id, discovery_id, shown_on)
);

COMMENT ON TABLE public.discovery_history IS 'Histórico de descobertas: base da regra "não repetir em 7 dias" e do "uma conclusão por descoberta por dia". (Antes: evermind_discovery_history_v1 + evermind_discoveries_done_today_v1)';
COMMENT ON COLUMN public.discovery_history.completed_at IS 'NULL = só sorteada; preenchido = concluída (nunca volta a NULL).';

-- ----------------------------------------------------------------------------
-- 9. MERGE MONOTÔNICO — o progresso nunca regride, mesmo com dado velho
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.merge_user_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Contadores: só crescem.
  NEW.total_active_days := GREATEST(OLD.total_active_days, NEW.total_active_days);
  NEW.total_mind := GREATEST(OLD.total_mind, NEW.total_mind);
  NEW.total_movement := GREATEST(OLD.total_movement, NEW.total_movement);
  NEW.total_selfcare := GREATEST(OLD.total_selfcare, NEW.total_selfcare);
  NEW.total_connection := GREATEST(OLD.total_connection, NEW.total_connection);
  NEW.total_discovery := GREATEST(OLD.total_discovery, NEW.total_discovery);
  NEW.mind_activities_count := GREATEST(OLD.mind_activities_count, NEW.mind_activities_count);
  NEW.completed_discoveries_count := GREATEST(OLD.completed_discoveries_count, NEW.completed_discoveries_count);
  NEW.total_walk_sessions := GREATEST(OLD.total_walk_sessions, NEW.total_walk_sessions);
  NEW.total_selfcare_actions := GREATEST(OLD.total_selfcare_actions, NEW.total_selfcare_actions);
  NEW.total_water_glasses := GREATEST(OLD.total_water_glasses, NEW.total_water_glasses);
  NEW.total_social_connections := GREATEST(OLD.total_social_connections, NEW.total_social_connections);

  -- Sequência: vale o snapshot do dia mais recente (a sequência pode recomeçar
  -- em 1 após uma pausa, mas um aparelho atrasado não pode sobrescrever um mais novo).
  IF NEW.last_active_date IS NULL
     OR (OLD.last_active_date IS NOT NULL AND NEW.last_active_date < OLD.last_active_date) THEN
    NEW.current_streak := OLD.current_streak;
    NEW.last_active_date := OLD.last_active_date;
  ELSIF OLD.last_active_date IS NOT NULL AND NEW.last_active_date = OLD.last_active_date THEN
    NEW.current_streak := GREATEST(OLD.current_streak, NEW.current_streak);
  END IF;

  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merge_user_stats_bu ON public.user_stats;
CREATE TRIGGER merge_user_stats_bu
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.merge_user_stats();

CREATE OR REPLACE FUNCTION public.merge_virtual_brain_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.total_points := GREATEST(OLD.total_points, NEW.total_points);
  NEW.total_completed_challenges := GREATEST(OLD.total_completed_challenges, NEW.total_completed_challenges);
  -- Enum compara pela ordem de declaração: baby < kid < teen < mega_brain.
  NEW.current_stage := GREATEST(OLD.current_stage, NEW.current_stage);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merge_virtual_brain_state_bu ON public.virtual_brain_state;
CREATE TRIGGER merge_virtual_brain_state_bu
  BEFORE UPDATE ON public.virtual_brain_state
  FOR EACH ROW EXECUTE FUNCTION public.merge_virtual_brain_state();

CREATE OR REPLACE FUNCTION public.merge_daily_habits()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.walk_completed := OLD.walk_completed OR NEW.walk_completed;
  NEW.water_glasses := GREATEST(OLD.water_glasses, NEW.water_glasses);
  NEW.water_goal_met := OLD.water_goal_met OR NEW.water_goal_met;
  NEW.fruit_veggie_confirmed := OLD.fruit_veggie_confirmed OR NEW.fruit_veggie_confirmed;
  NEW.sleep_routine_confirmed := OLD.sleep_routine_confirmed OR NEW.sleep_routine_confirmed;
  NEW.social_call_completed := OLD.social_call_completed OR NEW.social_call_completed;
  NEW.reminder_time := COALESCE(NEW.reminder_time, OLD.reminder_time);
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merge_daily_habits_bu ON public.daily_habits;
CREATE TRIGGER merge_daily_habits_bu
  BEFORE UPDATE ON public.daily_habits
  FOR EACH ROW EXECUTE FUNCTION public.merge_daily_habits();

CREATE OR REPLACE FUNCTION public.merge_daily_triads()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.completed_challenge_ids := ARRAY(
    SELECT DISTINCT x FROM unnest(OLD.completed_challenge_ids || NEW.completed_challenge_ids) AS x ORDER BY x
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merge_daily_triads_bu ON public.daily_triads;
CREATE TRIGGER merge_daily_triads_bu
  BEFORE UPDATE ON public.daily_triads
  FOR EACH ROW EXECUTE FUNCTION public.merge_daily_triads();

CREATE OR REPLACE FUNCTION public.merge_discovery_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.completed_at := COALESCE(OLD.completed_at, NEW.completed_at); -- nunca "desconclui"
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merge_discovery_history_bu ON public.discovery_history;
CREATE TRIGGER merge_discovery_history_bu
  BEFORE UPDATE ON public.discovery_history
  FOR EACH ROW EXECUTE FUNCTION public.merge_discovery_history();

CREATE OR REPLACE FUNCTION public.merge_user_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.unlocked_at := LEAST(OLD.unlocked_at, NEW.unlocked_at); -- vale a 1ª conquista
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS merge_user_achievements_bu ON public.user_achievements;
CREATE TRIGGER merge_user_achievements_bu
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.merge_user_achievements();

-- updated_at automático nas tabelas novas que não têm merge próprio
-- (user_stats e daily_habits já atualizam updated_at no seu trigger de merge).

-- ----------------------------------------------------------------------------
-- 9b. user_id automático também nas tabelas do esquema original
--     (assim o cliente nunca precisa enviar user_id; o RLS continua exigindo
--     que ele seja o do usuário autenticado).
-- ----------------------------------------------------------------------------

ALTER TABLE public.daily_triads ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.challenge_completions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.virtual_brain_state ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.user_achievements ALTER COLUMN user_id SET DEFAULT auth.uid();

-- ----------------------------------------------------------------------------
-- 10. ÍNDICES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_active_days_user_date_desc ON public.active_days (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_date_desc ON public.daily_habits (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_history_user_shown_desc ON public.discovery_history (user_id, shown_on DESC);

-- ----------------------------------------------------------------------------
-- 11. RLS — cada usuário só vê e altera as PRÓPRIAS linhas
--     Mesmo padrão do esquema original: TO authenticated, (select auth.uid()),
--     USING + WITH CHECK em UPDATE/INSERT. Usuários anônimos do Supabase usam o
--     role `authenticated` (claim is_anonymous = true), então também são cobertos.
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['user_stats', 'active_days', 'daily_habits', 'discovery_history'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_own', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING ((select auth.uid()) = user_id)', t || '_select_own', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_own', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id)', t || '_insert_own', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_own', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)', t || '_update_own', t);

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_own', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING ((select auth.uid()) = user_id)', t || '_delete_own', t);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 12. PRIVILÉGIOS — explícitos (não dependem dos defaults do projeto Supabase)
--     `anon` NÃO tem acesso a nada: tudo exige um usuário (anônimo ou não).
-- ----------------------------------------------------------------------------

REVOKE ALL ON public.user_stats, public.active_days, public.daily_habits, public.discovery_history FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles,
  public.daily_triads,
  public.challenge_completions,
  public.virtual_brain_state,
  public.user_achievements,
  public.user_stats,
  public.active_days,
  public.daily_habits,
  public.discovery_history
TO authenticated;

-- ----------------------------------------------------------------------------
-- 13. EXCLUIR MINHA CONTA (direito de eliminação — LGPD)
--     Apaga o usuário em auth.users; todas as tabelas têm ON DELETE CASCADE.
--     Chamada pelo cliente: POST /rest/v1/rpc/delete_my_account (sem argumentos).
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;
  DELETE FROM auth.users WHERE id = (select auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

COMMENT ON FUNCTION public.delete_my_account() IS 'Exclui a conta do usuário autenticado e, em cascata, todos os seus dados.';
