-- Known Words: self-marked replacement for the placement test.
-- Authoritative design: docs/decisions/0002-known-words-vs-placement-test.md
--
-- This migration:
--   1. Adds public.known_variants (user_id, variant_id, marked_at) as the
--      input to the Pareto sequencer's "skip what the user already knows" filter.
--   2. Drops public.placement_test_results (table + RLS policies cascade together).
--   3. Drops public.users.proficiency_estimate (no longer load-bearing; UI
--      derives "you know N words" from a COUNT against known_variants).

-- =============================================================================
-- 1. Create known_variants
-- =============================================================================
-- FK choices mirror review_items after 0002:
--   * user_id -> auth.users(id) ON DELETE CASCADE  (deleting an auth row wipes
--     their known-set; matches review_items.user_id)
--   * variant_id -> variant(id) ON DELETE RESTRICT (a content edit cannot
--     silently erase a user's known-mark; same reasoning as review_items.variant_id)
-- Composite PRIMARY KEY (user_id, variant_id) is the natural key for set
-- membership -- no surrogate id, can't get duplicate (user, variant) pairs.

CREATE TABLE public.known_variants (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.variant(id) ON DELETE RESTRICT,
  marked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, variant_id)
);

-- Hot path: "get every variant_id this user has marked known" for the sequencer.
-- The PK's leading column covers this, but a narrower single-column index lets
-- the planner pick it for SELECT variant_id WHERE user_id = $1 scans.
CREATE INDEX known_variants_user_idx
  ON public.known_variants (user_id);

-- =============================================================================
-- 2. Row-level security: own-rows only
-- =============================================================================
-- Three policies (select / insert / delete) -- no UPDATE, because the only
-- mutation is "toggle marked", which we model as delete-then-reinsert.

ALTER TABLE public.known_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "known_variants_select_own" ON public.known_variants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "known_variants_insert_own" ON public.known_variants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "known_variants_delete_own" ON public.known_variants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =============================================================================
-- 3. Drop placement_test_results
-- =============================================================================
-- The table's RLS policies and the placement_test_results_user_id_idx index
-- (added in 0002) are dropped automatically with the table. No production
-- users exist yet, so there is no data to migrate.

DROP TABLE public.placement_test_results;

-- =============================================================================
-- 4. Drop users.proficiency_estimate
-- =============================================================================
-- The Pareto sequencer no longer needs a single proficiency number -- the
-- known_variants set is the per-variant truth. UI shows "you know N words"
-- from SELECT count(*) FROM known_variants WHERE user_id = auth.uid().

ALTER TABLE public.users
  DROP COLUMN proficiency_estimate;
