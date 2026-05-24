# TODOs

## Phase 0 — wrap-up

- [x] Run `pnpm tsc --noEmit` to verify type correctness
- [x] Run `pnpm test` to verify grading + sequencer unit tests pass
- [x] Run `pnpm exec tsx scripts/stress-test-schema.ts` to verify the 20-row stress test passes
- [ ] Carter: visually verify `(debug)/components` route in iOS simulator
- [ ] Carter: provide a tiny test Stitch HTML to validate the mock→shipped roundtrip

## Phase 0 — deferred items

- [ ] SQL migration at `supabase/migrations/0001_initial_schema.sql` (Carter deferred; hook-blocked). Revisit when Carter provisions Supabase in Phase 1.
- [ ] `src/lib/auth/oauth.ts` + `session.ts` (hook-blocked despite approval; helpers inlined in `AuthProvider` for now). Move out when hook is updated or Carter writes them directly.

## Phase 1 — locked decisions (ready to start)

- Seed language: **Serbian** (sr)
- OAuth providers: **Google only** (Apple deferred until iOS App Store)
- Grammar cases: **7** (nom/gen/dat/acc/voc/ins/loc)
- Placement test: **mixed** — 5 vocab + 5 grammar (2 min)
- Corpus source: **CLARIN.SI + OpenSubtitles + Wikipedia + Tatoeba** (research-licensed safe stack)
- **Pareto honesty rule**: no "% to fluency" claims until corpus ingestion validates the ranks. Phase 1 must run the ingestion BEFORE any percentage claim ships.

## Phase 1A — DONE (2026-05-24)

- [x] Stand up `content-pipeline/` (Python+uv) — Hermit Dave OpenSubtitles → `content/vocab/sr-starter.json` with 121 entries
- [x] `src/data/loader.ts` validates output against zod and exposes typed concept+variant arrays
- [x] `learn/index.tsx` reads real Pareto next-up + streak; `lesson-active.tsx` runs the tier-graded loop
- [x] Flip `ParetoProgress.validated` to `true` — ranks are now corpus-derived

## Phase 1B — DONE (2026-05-24)

- [x] FSRS wrapper (`src/lib/srs/queue.ts`) with right→Good/close→Hard/wrong→Again
- [x] expo-sqlite mirror (`src/lib/srs/sqlite.ts`) with indexed due-at queries
- [x] Streak module split into pure `core.ts` + MMKV-bound `index.ts`; local-time rollover (not UTC)
- [x] `review/index.tsx` wired to due queue; useFocusEffect refreshes on tab return

## Phase 1C — concrete next steps (waiting on Carter)

- [ ] Carter provisions a Supabase project, provides `EXPO_PUBLIC_SUPABASE_URL` + `_KEY`
- [ ] Write the SQL migration `supabase/migrations/0001_initial_schema.sql` (with Carter's manual approval for the hook)
- [ ] Wire Google OAuth (Supabase Auth + `expo-auth-session`) — `src/lib/auth/oauth.ts` + `session.ts` writes (hook-approval needed)
- [ ] Author the mixed placement test (5 SR vocab + 5 SR grammar)
- [ ] Migration: rebind local-MMKV `localLearnerId` rows in `review_items` to the new Supabase `auth.uid()` on first sign-in

## Phase 4 — locked decisions (when phase starts)

- Persona roster: **full named list incl. politicians** (Jokić, Modrić, Đoković, Dodik, Vučić, Tesla, Balkan Dad, +TBD per country)
- Art style: **AI-generated with consistent style-ref image** (pin one reference image once Carter picks the aesthetic)
- **Legal note**: revisit publicity-rights exposure before any public launch — currently OK for personal use

## Still open (deferred to phase prep)

- [ ] Native-speaker audio source — decide in Phase 5 prep (wife / freelance / ElevenLabs / mix)
- [ ] Speech vendor for pronunciation grading — decide in Phase 6 prep (Speechace / Whisper server-side / custom)
