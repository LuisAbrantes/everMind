-- ============================================================================
-- everMind: PostgreSQL & Supabase Consolidated Schema
-- File: supabase/schema.sql
-- Domain: 4 Pilares da Longevidade (Mente, Movimento, Autocuidado, Conexão)
-- ADRs: ADR-0002 (Offline-First), ADR-0003 (Gentle Fallback), ADR-0008 (Supabase)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & CUSTOM TYPES (ENUMS)
-- ----------------------------------------------------------------------------

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Type for the 4 canonical pillars of healthy longevity
DO $$ BEGIN
  CREATE TYPE challenge_pillar_type AS ENUM (
    'mind',        -- Pilar Mente (Neurocognição e memória)
    'movement',    -- Pilar Movimento (Caminhadas e mobilidade)
    'selfcare',    -- Pilar Autocuidado (Hidratação, nutrição e sono)
    'connection'   -- Pilar Conexão (Laços afetivos e comunitários)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Type for the 4 evolutionary stages of the Virtual Brain (Monotonic growth)
DO $$ BEGIN
  CREATE TYPE brain_stage_type AS ENUM (
    'baby',        -- 1 a 5 desafios concluídos (🌱 Brain Baby)
    'kid',         -- 6 a 20 desafios concluídos (✨ Brain Kid)
    'teen',        -- 21 a 50 desafios concluídos (⚡ Brain Teen)
    'mega_brain'   -- 50+ desafios concluídos (👑 Mega Brain)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Type for the official catalog of badges / honor achievements
DO $$ BEGIN
  CREATE TYPE badge_key_type AS ENUM (
    'first_steps',     -- Primeiros Passos (5 desafios globais)
    'active_week',     -- Semana Ativa (Engajamento em 7 dias da semana)
    'moving_mind',     -- Mente em Movimento (30 atividades cognitivas)
    'present_friend',  -- Amigo Presente (10 desafios de socialização)
    'walker'           -- Caminhante (20 sessões de caminhada)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 2. TABLES DEFINITIONS
-- ----------------------------------------------------------------------------

-- Table: profiles
-- Stores user identity and display settings, linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do everMind sincronizados com auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'Identificador único do usuário, correspondente a auth.users.id.';
COMMENT ON COLUMN public.profiles.display_name IS 'Nome de exibição acolhedor para saudações na interface.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL opcional de foto de perfil ou avatar.';

-- Table: daily_triads
-- Stores daily selection of 3 challenges per user per calendar day
CREATE TABLE IF NOT EXISTS public.daily_triads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  challenge_ids TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_daily_triad UNIQUE (user_id, date)
);

COMMENT ON TABLE public.daily_triads IS 'Tríade do Dia: seleção diária de 3 desafios equilibrados entre os 4 pilares.';
COMMENT ON COLUMN public.daily_triads.date IS 'Data de vigência da tríade (YYYY-MM-DD).';
COMMENT ON COLUMN public.daily_triads.challenge_ids IS 'Array com os 3 identificadores de desafio selecionados para o dia.';

-- Table: challenge_completions
-- Atomic log of completed challenges across the 4 pillars
CREATE TABLE IF NOT EXISTS public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type challenge_pillar_type NOT NULL,
  challenge_id TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

COMMENT ON TABLE public.challenge_completions IS 'Registro atômico de conclusões de desafios nos 4 pilares.';
COMMENT ON COLUMN public.challenge_completions.challenge_type IS 'Pilar associado ao desafio (mind, movement, selfcare, connection).';
COMMENT ON COLUMN public.challenge_completions.completed_at IS 'Data/hora exata UTC de conclusão da atividade.';
COMMENT ON COLUMN public.challenge_completions.date IS 'Data do calendário local referente à atividade (YYYY-MM-DD).';

-- Table: virtual_brain_state
-- Tracks cumulative growth, points, and current non-regressive stage
CREATE TABLE IF NOT EXISTS public.virtual_brain_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage brain_stage_type NOT NULL DEFAULT 'baby'::brain_stage_type,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_virtual_brain UNIQUE (user_id)
);

COMMENT ON TABLE public.virtual_brain_state IS 'Estado do Cérebro Virtual e progresso cumulativo (Monotonicidade: nunca involui).';
COMMENT ON COLUMN public.virtual_brain_state.current_stage IS 'Estágio atual de evolução do Cérebro Virtual (baby, kid, teen, mega_brain).';
COMMENT ON COLUMN public.virtual_brain_state.total_points IS 'Pontos cumulativos de energia cognitiva (+10 por desafio).';

-- Table: user_achievements
-- Badges and milestones unlocked by the user
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key badge_key_type NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_key)
);

COMMENT ON TABLE public.user_achievements IS 'Emblemas de honra e conquistas alcançadas pelo usuário.';
COMMENT ON COLUMN public.user_achievements.badge_key IS 'Chave identificadora da conquista desbloqueada.';
COMMENT ON COLUMN public.user_achievements.unlocked_at IS 'Data/hora de desbloqueio da conquista.';

-- ----------------------------------------------------------------------------
-- 3. FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Function to handle updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_virtual_brain_state_updated_at ON public.virtual_brain_state;
CREATE TRIGGER set_virtual_brain_state_updated_at
  BEFORE UPDATE ON public.virtual_brain_state
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile and initial brain state on user signup
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
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      'Amigo everMind'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.virtual_brain_state (user_id, current_stage, total_points)
  VALUES (
    NEW.id,
    'baby'::brain_stage_type,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. HIGH PERFORMANCE INDEXES (Screen 7 Retrospective & Daily Queries)
-- ----------------------------------------------------------------------------

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Indexes for daily_triads
CREATE INDEX IF NOT EXISTS idx_daily_triads_user_id_date ON public.daily_triads(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_triads_user_id_date_desc ON public.daily_triads(user_id, date DESC);

-- Indexes for challenge_completions (Ultra-fast for Screen 7 Weekly Retrospective)
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id_date ON public.challenge_completions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id_completed_at ON public.challenge_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_pillar_date ON public.challenge_completions(user_id, challenge_type, date);

-- Indexes for virtual_brain_state
CREATE INDEX IF NOT EXISTS idx_virtual_brain_state_user_id ON public.virtual_brain_state(user_id);

-- Indexes for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_badge_key ON public.user_achievements(user_id, badge_key);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_unlocked_at ON public.user_achievements(user_id, unlocked_at DESC);

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES — STRICT SECURITY
-- Rules:
--  • Enable RLS on ALL public tables
--  • Never use deprecated auth.role(), use TO authenticated
--  • Wrap (select auth.uid()) for query optimization and subquery caching
--  • UPDATE & INSERT include USING and WITH CHECK to prevent BOLA / IDOR
-- ----------------------------------------------------------------------------

-- 5.1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

-- 5.2. Daily Triads RLS
ALTER TABLE public.daily_triads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_triads_select_own" ON public.daily_triads;
CREATE POLICY "daily_triads_select_own"
  ON public.daily_triads
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "daily_triads_insert_own" ON public.daily_triads;
CREATE POLICY "daily_triads_insert_own"
  ON public.daily_triads
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "daily_triads_update_own" ON public.daily_triads;
CREATE POLICY "daily_triads_update_own"
  ON public.daily_triads
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "daily_triads_delete_own" ON public.daily_triads;
CREATE POLICY "daily_triads_delete_own"
  ON public.daily_triads
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 5.3. Challenge Completions RLS
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "challenge_completions_select_own" ON public.challenge_completions;
CREATE POLICY "challenge_completions_select_own"
  ON public.challenge_completions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "challenge_completions_insert_own" ON public.challenge_completions;
CREATE POLICY "challenge_completions_insert_own"
  ON public.challenge_completions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "challenge_completions_update_own" ON public.challenge_completions;
CREATE POLICY "challenge_completions_update_own"
  ON public.challenge_completions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "challenge_completions_delete_own" ON public.challenge_completions;
CREATE POLICY "challenge_completions_delete_own"
  ON public.challenge_completions
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 5.4. Virtual Brain State RLS
ALTER TABLE public.virtual_brain_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "virtual_brain_state_select_own" ON public.virtual_brain_state;
CREATE POLICY "virtual_brain_state_select_own"
  ON public.virtual_brain_state
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "virtual_brain_state_insert_own" ON public.virtual_brain_state;
CREATE POLICY "virtual_brain_state_insert_own"
  ON public.virtual_brain_state
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "virtual_brain_state_update_own" ON public.virtual_brain_state;
CREATE POLICY "virtual_brain_state_update_own"
  ON public.virtual_brain_state
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "virtual_brain_state_delete_own" ON public.virtual_brain_state;
CREATE POLICY "virtual_brain_state_delete_own"
  ON public.virtual_brain_state
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 5.5. User Achievements RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_achievements_select_own" ON public.user_achievements;
CREATE POLICY "user_achievements_select_own"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_achievements_insert_own" ON public.user_achievements;
CREATE POLICY "user_achievements_insert_own"
  ON public.user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_achievements_update_own" ON public.user_achievements;
CREATE POLICY "user_achievements_update_own"
  ON public.user_achievements
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_achievements_delete_own" ON public.user_achievements;
CREATE POLICY "user_achievements_delete_own"
  ON public.user_achievements
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
