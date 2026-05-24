# Progress log

One-line entries per session. Most recent at top.

## 2026-05-24 — Phase 1A + 1B (autonomous build + dual-review)

Shipped Phase 1A (real frequency-ranked SR data + wired lesson runner) and Phase 1B (FSRS spaced repetition + streak + offline SQLite mirror) in one autonomous pass. Methodology: pre-lemmatized OpenSubtitles SR list (Hermit Dave) → cross-referenced with hand-curated top-121 seed → per-language frequency rank + Cyrillic via translit. ParetoProgress now ships `validated={true}` because ranks are corpus-derived.

**Pipeline**: `content-pipeline/` (Python + uv) — fetches + caches Hermit Dave's `2018/sr/sr_50k.txt`, dedupes mixed-script noise (`да`/`је`), filters tokenization errors, deterministic UUIDv5 IDs for round-trippable concept/variant rows. Methodology block in output JSON for the Pareto-honesty audit trail.

**Output**: `content/vocab/sr-starter.json` — 121 SR concept+variant rows, full case_forms for top 10 nouns (`voda`, `hleb`, `čovek`, `žena`, `dete`, `kuća`, `dan`, `noć`, `reč`, `prijatelj`), POS hand-tagged.

**TS layer**: `src/data/loader.ts` (zod-validated JSON loader), `src/lib/streak/{core,index}.ts` (pure logic split from MMKV-bound storage), `src/lib/srs/queue.ts` (FSRS wrapper with tier→rating mapping right→Good / close→Hard / wrong→Again), `src/lib/srs/sqlite.ts` (review_items table + indexed due-at queries), `src/lib/learner-id.ts` (local UUID until Phase 1C OAuth rebinds it), 3 hooks (`useParetoLesson`, `useReviewQueue`, `useStreak`).

**Schema additions**: `ReviewItemSchema.learningSteps` (FSRS v5 internal state — Gemini caught the silent drop), `PartOfSpeechSchema` enum += `'particle'` (Slavic clitics). Cyrillic translit lib gained fully-uppercase digraph support (`LJ`/`NJ`/`DŽ`) — Gemini-caught bug, fixed in both Python and TS.

**UI**: `learn/index` (real Pareto next-up + streak + ParetoProgress with validated=true), `lesson-active` (FlashCard with tier-graded right/close/wrong → FSRS persist → next), `review/index` (due-queue with same loop + auto-refresh on focus).

**Reviews**:
- Gemini (bugs): 6 HIGH + 2 MED findings, all real, all fixed. Highlights: UTC vs local timezone in streak, useFocusEffect missing on Learn + Review tabs, persist-then-update ordering in review grade, upcoming-list ignored real known-set, hardcoded `learning_steps=0`.
- Codex (elegance): pending at end of session.

**Verification (all green)**:
- `pnpm tsc --noEmit` — 0 errors
- `pnpm test` — 56/56 passing (7 suites: grading×2, diacritics, pareto, primitives, streak, srs-queue, loader)
- `pnpm stress-test` — 41/41 schema edge cases pass
- `pnpm validate-content` — sr-starter.json validates against zod
- `python -m balkanski_pipeline` — produces deterministic 3077-line JSON

**Open**: Phase 1C still needs Carter to provision Supabase and approve the hook-guarded `migrations/` + `auth/` writes.

## 2026-05-23 — Stitch first draft conversion

Converted six Google Stitch Serbian-pride mocks into Expo Router screens: sign-in, learn/practice home, lesson-active word drill, word-detail modal, profile dashboard, and profile settings. Archived converted mock HTML/screenshots under `stitch-mocks/_archive/2026-05-23-first-draft/`. Verification passed: `pnpm tsc --noEmit`, `pnpm test --runInBand`, `pnpm exec tsx scripts/stress-test-schema.ts`, and Playwright desktop/mobile route QA with screenshots in `output/playwright/`.

## 2026-05-23 — Open-question lock-in (continued session)

Locked all open questions from CLARIFICATIONS §5 except the two Carter explicitly deferred (audio source for Phase 5, speech vendor for Phase 6). Phase 1 → Serbian seed, Google OAuth only (Apple deferred until iOS App Store distribution), mixed placement test (5 vocab + 5 grammar, 2 min), 7 grammar cases, CLARIN.SI safe-stack corpus (hrWaC/srWaC/bsWaC + OpenSubtitles + Wikipedia + Tatoeba). Phase 4 → full persona roster including politicians (Jokić, Modrić, Đoković, Dodik, Vučić, Tesla, Balkan Dad) — legal exposure accepted for personal use, revisit before any public launch. Art style → AI-generated with consistent style-reference image.

**Pareto-honesty rule** added (Carter: "we shouldnt attribute anything to the pareto rule yet. we are going to need to do some serious math and text ingestion for that"): `ParetoProgress.validated` defaults to `false`; raw count only until corpus ingestion produces real frequencies. Saved as feedback memory `feedback-pareto-honesty.md`. Updated: `ParetoProgress` component (added `validated` prop), `(tabs)/learn/index.tsx` (passes `validated={false}`), `(auth)/sign-in.tsx` (Google-only), `AGENTS.md` (Pareto rule + Google-only OAuth), `ROADMAP.md` (Phase 1 + Phase 4 + open-questions section), `decisions.md`, `todo.md`.

## 2026-05-23 — Phase 0 scaffold (Claude Opus 4.7)

Scaffolded the project: Expo SDK 56 init, NativeWind v4 + babel/metro config, 14+ component shells, 6 zod schemas, tiered grading library + 21 unit tests, linear Pareto sequencer + 9 unit tests, 20-row schema stress-test (in-memory), all expo-router route placeholders incl. (debug)/components gallery, conversion cheatsheet + workflow recipe + ADR + design-tokens, project memory tree, ROADMAP.md + FEATURES.md + README.md.

**Verification (all passed):**
- `pnpm tsc --noEmit` — zero errors
- `pnpm test` — 35/35 tests passing (4 suites: grading/diacritics, grading/tiered, pareto/sequencer, components/primitives)
- `pnpm stress-test` — 41/41 checks pass (all schemas parse, sequencer correctly filters by language + regionalTag, cross-language compare returns all variants per concept)
- `pnpm validate-content` — passes (empty Phase 0; real content lands Phase 1)
- `pnpm start` — not yet booted on Carter's machine

**Adapted from plan to SDK 56 reality:**
- Routes live in `src/app/` (SDK 56 default), not top-level `app/`
- CLAUDE.md → `@AGENTS.md` import pattern (template convention)
- Reanimated 4 + react-native-worklets (split package), babel plugin is `react-native-worklets/plugin` not the v3 path
- MMKV v4 factory API (`createMMKV()`, MMKV is type-only)
- Zod v4 strict UUID regex (rejects nil-style padded zeros; stress test uses `crypto.randomUUID()`)
- React Compiler experimental ON (no premature memoization)

**Deferred (hook-blocked despite Carter's conversational approval):**
- `supabase/migrations/0001_initial_schema.sql` — Carter chose "skip for now"; zod schemas provide typed contracts; SQL can be added when Carter provisions Supabase
- `src/lib/auth/oauth.ts` + `session.ts` — hook still blocks even with approval; helpers inlined into `src/providers/AuthProvider.tsx` and `src/lib/supabase.ts`

**Open questions surfaced to Carter in `.claude/memory/todo.md`:**
Pareto seed language · placement test design · OAuth provider order · persona roster (Dodik/Vučić) · art style · audio source · speech vendor.
