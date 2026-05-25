---
project: balkanski
task: balkanski
session_ended: 2026-05-24T20:25:00Z
cwd: /Users/carterking/Projects/Personal/balkanski
git_branch: main
git_sha: 9a3dd2d
shape: project-container
---

# Handoff — balkanski

## Next Action

Write `supabase/migrations/0001_initial_schema.sql` with the 8-table schema (`concept`, `variant`, `users`, `user_settings`, `review_items`, `streak_log`, `study_sessions`, `placement_test_results`) + RLS policies + `auth.users` insert trigger, then deploy via `supabase db push`.

## Pointers

- Authoritative spec: `CLARIFICATIONS.md` (root)
- Stack rules + mock-conversion contract: `AGENTS.md` (root)
- Memory index: `.claude/memory/INDEX.md`
- Decisions log: `.claude/memory/decisions.md`
- Todo: `.claude/memory/todo.md`
- Roadmap: `ROADMAP.md` (Phase 1C is the current phase)
- zod source-of-truth schemas the migration must match:
  - `src/data/schemas/concept.ts` (note `partOfSpeech` enum includes `'particle'`)
  - `src/data/schemas/variant.ts` (Croatian/Bosnian variants MUST NOT carry cyrillicSpelling — add a CHECK)
  - `src/data/schemas/review-item.ts` (FSRS v5 — has `learningSteps` field; mirror as `learning_steps INT NOT NULL`)
  - `src/data/schemas/user.ts`
  - `src/data/schemas/grading.ts`
- Local SQLite mirror this needs to sync with: `src/lib/srs/sqlite.ts`
- Connectivity smoke test: `pnpm check-supabase`

## Decisions This Session

- Supabase project provisioned by Carter: ref `khbwshwghilupemmvloq` (East US Ohio), name `balkanski`, created 2026-05-24.
- `.env` written at repo root with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (new `sb_publishable_*` key format). Gitignored.
- Carter approved `.env` write through the hook verbally; same blanket approval covers the upcoming `supabase/migrations/` write for this specific migration.
- Supabase CLI upgraded `2.75.0 → 2.101.0` via `brew upgrade supabase`.
- `supabase init` + `supabase link --project-ref khbwshwghilupemmvloq` both done. `supabase/.temp/project-ref` proves link is active.
- Connectivity check passes: auth reachable, key accepted, only `email` provider enabled (Google OAuth deferred to a later step).
- `scripts/check-supabase.ts` + `pnpm check-supabase` added to package.json.

## In-Flight Work

- `supabase/migrations/0001_initial_schema.sql` — does not exist yet. **Hook-guarded path.** Carter approved this specific write in chat; if the hook still blocks, re-confirm once.

## Open Questions / Blockers

- None for the migration step itself.
- Google OAuth requires Google Cloud Console setup (separate Phase 1C sub-step, not part of this handoff).
- Seeding `concept` + `variant` from `content/vocab/sr-starter.json` (121 entries) is the step AFTER this migration deploys — not part of this handoff.
- `src/lib/auth/` write is hook-guarded — not part of this handoff (will be the OAuth-wiring step).

## Schema spec (verbatim from the parent session)

**Tables**:
- `concept` — id uuid PK, english_lemma text NOT NULL, english_translation text NOT NULL, part_of_speech text NOT NULL (CHECK in {noun, verb, adjective, adverb, preposition, pronoun, conjunction, interjection, numeral, phrase, particle}), sense_disambiguator text NULL, topic_tags text[] NOT NULL DEFAULT '{}', frequency_rank_aggregate int NULL.
- `variant` — id uuid PK, concept_id uuid FK→concept, language text NOT NULL CHECK in ('hr','sr','bs'), regional_tag text NULL, latin_spelling text NOT NULL, cyrillic_spelling text NULL CHECK (language='sr' OR cyrillic_spelling IS NULL), stress_mark text NULL, ipa text NULL, audio_url text NULL, frequency_rank_in_lang int NOT NULL, case_forms jsonb NULL.
- `users` — id uuid PK (= auth.uid()), primary_language text NULL, proficiency_estimate int NULL, serbian_script_pref text CHECK in ('latin','cyrillic') DEFAULT 'latin', daily_goal_minutes int DEFAULT 5, timezone text NULL, plan text DEFAULT 'free', created_at timestamptz DEFAULT now(), last_active_at timestamptz NULL.
- `user_settings` — user_id uuid PK FK→users, daily_goal_minutes int DEFAULT 5, sound_enabled bool DEFAULT true, reminder_hour int NULL, theme text DEFAULT 'system'.
- `review_items` — id uuid PK, user_id uuid FK→auth.users, variant_id uuid FK→variant, direction text CHECK in ('recognize','produce','audio_recognize','script_convert'), stability real NOT NULL, difficulty real NOT NULL, elapsed_days real NOT NULL, scheduled_days real NOT NULL, learning_steps int NOT NULL DEFAULT 0 (FSRS v5), reps int NOT NULL DEFAULT 0, lapses int NOT NULL DEFAULT 0, state text CHECK in ('new','learning','review','relearning'), last_review timestamptz NULL, due_at timestamptz NOT NULL; UNIQUE (user_id, variant_id, direction).
- `streak_log` — id uuid PK, user_id uuid FK, day date NOT NULL, active bool DEFAULT true; UNIQUE (user_id, day).
- `study_sessions` — id uuid PK, user_id uuid FK, started_at timestamptz NOT NULL, ended_at timestamptz NULL, cards_seen int DEFAULT 0, cards_right int DEFAULT 0, cards_close int DEFAULT 0, cards_wrong int DEFAULT 0.
- `placement_test_results` — id uuid PK, user_id uuid FK, question_id text NOT NULL, answer text NOT NULL, correct bool NOT NULL, taken_at timestamptz DEFAULT now().

**RLS**: enable on ALL tables.
- `concept`, `variant`: SELECT to `authenticated`, deny INSERT/UPDATE/DELETE from clients (seeding uses service_role).
- All user-state tables: `USING (user_id = auth.uid())` and `WITH CHECK (user_id = auth.uid())` on every CRUD policy. For the `users` row, the policy is `id = auth.uid()`.

**Trigger**: `AFTER INSERT ON auth.users` → INSERT into `public.users (id)` then `public.user_settings (user_id)`. `SECURITY DEFINER`, owned by postgres role.

**Indexes**:
- `variant (language, frequency_rank_in_lang)` — Pareto sequencer's hot path
- `review_items (user_id, due_at)` — FSRS due-queue scan
- `concept (frequency_rank_aggregate)` — global Pareto views

**Deploy + verify**:
- `supabase db push` (CLI is linked).
- `pnpm check-supabase` still ✓.
- A SELECT against an empty table from the anon client either returns `[]` (RLS allowed for content tables) or "permission denied" (RLS rejected for user-state tables) — both prove the table exists.

**DO NOT** in this handoff:
- Wire Google OAuth.
- Seed content/vocab/sr-starter.json into the tables.
- Touch `src/lib/auth/` (hook-guarded; separate step).
