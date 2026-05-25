-- Schema fixes from the Gemini bug review of 0001.
-- Four mechanical fixes; no data exists yet, so all changes are safe.

-- 1. Auth trigger: make the inserts idempotent so a retried signup webhook
--    never causes the auth.users insert to roll back. Previously the second
--    invocation would hit the PK constraint and lock the user out of auth.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. review_items.variant_id: CASCADE would silently wipe every user's SRS
--    progress for a word if a content edit deleted that variant. Switch to
--    RESTRICT so content edits have to explicitly migrate or null the FK.
--    Also add the standalone variant_id index that was missing -- the
--    UNIQUE (user_id, variant_id, direction) index can't service variant_id
--    lookups efficiently.
ALTER TABLE public.review_items
  DROP CONSTRAINT review_items_variant_id_fkey;

ALTER TABLE public.review_items
  ADD CONSTRAINT review_items_variant_id_fkey
  FOREIGN KEY (variant_id) REFERENCES public.variant(id) ON DELETE RESTRICT;

CREATE INDEX review_items_variant_idx
  ON public.review_items (variant_id);

-- 3. Missing FK indexes on user_id for tables that cascade from public.users.
--    Without these, deleting a user triggers a full table scan to find
--    matching rows. user_settings has user_id as PK (covered), streak_log
--    has UNIQUE (user_id, day) (covered), review_items now has the new index
--    above (covered). The remaining two need explicit indexes.
CREATE INDEX study_sessions_user_id_idx
  ON public.study_sessions (user_id);

CREATE INDEX placement_test_results_user_id_idx
  ON public.placement_test_results (user_id);

-- 4. FSRS bounds + frequency-rank positivity. zod already enforces these in
--    src/data/schemas/, but defence in depth means the DB rejects bad data
--    even if a future writer skips zod.
ALTER TABLE public.variant
  ADD CONSTRAINT variant_frequency_rank_positive
  CHECK (frequency_rank_in_lang > 0);

ALTER TABLE public.review_items
  ADD CONSTRAINT review_items_stability_nonneg
    CHECK (stability >= 0),
  ADD CONSTRAINT review_items_difficulty_range
    CHECK (difficulty BETWEEN 1 AND 10),
  ADD CONSTRAINT review_items_elapsed_days_nonneg
    CHECK (elapsed_days >= 0),
  ADD CONSTRAINT review_items_scheduled_days_nonneg
    CHECK (scheduled_days >= 0),
  ADD CONSTRAINT review_items_learning_steps_nonneg
    CHECK (learning_steps >= 0),
  ADD CONSTRAINT review_items_reps_nonneg
    CHECK (reps >= 0),
  ADD CONSTRAINT review_items_lapses_nonneg
    CHECK (lapses >= 0);
