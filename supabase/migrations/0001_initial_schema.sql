-- Balkanski initial schema.
-- English-as-anchor content model (concept + variant) plus user-state tables
-- (users, user_settings, review_items, streak_log, study_sessions,
-- placement_test_results). Matches the zod schemas in src/data/schemas/.

-- =============================================================================
-- Content tables (shared, immutable to clients)
-- =============================================================================

CREATE TABLE public.concept (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  english_lemma text NOT NULL,
  english_translation text NOT NULL,
  part_of_speech text NOT NULL CHECK (part_of_speech IN (
    'noun', 'verb', 'adjective', 'adverb', 'preposition',
    'pronoun', 'conjunction', 'interjection', 'numeral',
    'phrase', 'particle'
  )),
  sense_disambiguator text,
  topic_tags text[] NOT NULL DEFAULT '{}',
  frequency_rank_aggregate int
);

CREATE TABLE public.variant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id uuid NOT NULL REFERENCES public.concept(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('hr', 'sr', 'bs')),
  regional_tag text,
  latin_spelling text NOT NULL,
  cyrillic_spelling text,
  stress_mark text,
  ipa text,
  audio_url text,
  frequency_rank_in_lang int NOT NULL,
  case_forms jsonb,
  -- Only Serbian variants may carry a Cyrillic spelling.
  -- Mirrors zod refines in src/data/schemas/variant.ts.
  CONSTRAINT variant_cyrillic_only_sr CHECK (
    language = 'sr' OR cyrillic_spelling IS NULL
  )
);

-- Pareto sequencer hot path: "next unseen variant in language X by rank".
CREATE INDEX variant_lang_rank_idx
  ON public.variant (language, frequency_rank_in_lang);

CREATE INDEX concept_freq_aggregate_idx
  ON public.concept (frequency_rank_aggregate);

-- =============================================================================
-- User-state tables
-- =============================================================================

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_language text CHECK (primary_language IN ('hr', 'sr', 'bs')),
  proficiency_estimate int,
  serbian_script_pref text NOT NULL DEFAULT 'latin'
    CHECK (serbian_script_pref IN ('latin', 'cyrillic')),
  daily_goal_minutes int NOT NULL DEFAULT 5,
  timezone text,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz
);

CREATE TABLE public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  daily_goal_minutes int NOT NULL DEFAULT 5,
  sound_enabled boolean NOT NULL DEFAULT true,
  reminder_hour int CHECK (reminder_hour IS NULL OR (reminder_hour BETWEEN 0 AND 23)),
  theme text NOT NULL DEFAULT 'system'
    CHECK (theme IN ('system', 'light', 'dark'))
);

CREATE TABLE public.review_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.variant(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN (
    'recognize', 'produce', 'audio_recognize', 'script_convert'
  )),
  stability real NOT NULL,
  difficulty real NOT NULL,
  elapsed_days real NOT NULL,
  scheduled_days real NOT NULL,
  -- FSRS v5 internal state. Mirrors src/lib/srs/sqlite.ts.
  learning_steps int NOT NULL DEFAULT 0,
  reps int NOT NULL DEFAULT 0,
  lapses int NOT NULL DEFAULT 0,
  state text NOT NULL CHECK (state IN ('new', 'learning', 'review', 'relearning')),
  last_review timestamptz,
  due_at timestamptz NOT NULL,
  UNIQUE (user_id, variant_id, direction)
);

-- FSRS due-queue scan: "items due for this user, oldest first".
CREATE INDEX review_items_due_idx
  ON public.review_items (user_id, due_at);

CREATE TABLE public.streak_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  UNIQUE (user_id, day)
);

CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  cards_seen int NOT NULL DEFAULT 0,
  cards_right int NOT NULL DEFAULT 0,
  cards_close int NOT NULL DEFAULT 0,
  cards_wrong int NOT NULL DEFAULT 0
);

CREATE TABLE public.placement_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer text NOT NULL,
  correct boolean NOT NULL,
  taken_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- Row-level security
-- =============================================================================
-- Enable RLS on every table. Without explicit policies, all access is denied -
-- so content tables get a single SELECT-only policy for authenticated users,
-- and writes go through service_role (which bypasses RLS) during seeding.
-- User-state tables get full CRUD scoped to auth.uid().

ALTER TABLE public.concept ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_test_results ENABLE ROW LEVEL SECURITY;

-- Content: read-only to authenticated clients.
CREATE POLICY "concept_select_authenticated" ON public.concept
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "variant_select_authenticated" ON public.variant
  FOR SELECT TO authenticated USING (true);

-- users: a user can only see / write their own row.
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- INSERT is handled by the auth-trigger below (SECURITY DEFINER), so no
-- client-side INSERT policy is needed.

-- user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- review_items
CREATE POLICY "review_items_select_own" ON public.review_items
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "review_items_insert_own" ON public.review_items
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "review_items_update_own" ON public.review_items
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "review_items_delete_own" ON public.review_items
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- streak_log
CREATE POLICY "streak_log_select_own" ON public.streak_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "streak_log_insert_own" ON public.streak_log
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "streak_log_update_own" ON public.streak_log
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "streak_log_delete_own" ON public.streak_log
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- study_sessions
CREATE POLICY "study_sessions_select_own" ON public.study_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "study_sessions_insert_own" ON public.study_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "study_sessions_update_own" ON public.study_sessions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "study_sessions_delete_own" ON public.study_sessions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- placement_test_results
CREATE POLICY "placement_test_results_select_own" ON public.placement_test_results
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "placement_test_results_insert_own" ON public.placement_test_results
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "placement_test_results_delete_own" ON public.placement_test_results
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- Auth trigger: provision public.users + public.user_settings on signup
-- =============================================================================
-- SECURITY DEFINER lets the function bypass RLS so it can insert into
-- public.users and public.user_settings for a freshly-created auth.users row.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id) VALUES (NEW.id);
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_auth_user() OWNER TO postgres;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
