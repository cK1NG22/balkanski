# ADR 0001 — Stack & Architecture

**Date**: 2026-05-23
**Status**: Accepted
**Supersedes**: nothing

## Context

`balkanski` is a mobile-first language-learning app for Croatian, Serbian, and Bosnian, built for Carter and his wife (personal use). Carter designs screens by hand and via Google Stitch (HTML/Tailwind mocks); Claude converts them to React Native. The authoritative spec is `CLARIFICATIONS.md` at repo root.

## Decision

### Runtime + tooling
- **Expo SDK 56** (React Native 0.85, React 19.2 with React Compiler experimental ON).
- **expo-router v4** (file-based, `src/app/`, typed routes enabled).
- **TypeScript 6** (`strict: true`, path alias `@/*` → `./src/*`).
- **pnpm 9** with `.npmrc` `node-linker=hoisted`.

### UI
- **NativeWind v4** + **Tailwind v3.4** — chosen because Stitch outputs Tailwind classes, making the conversion mechanical.
- Brand tokens in `tailwind.config.ts` (placeholder palette until Phase 8 polish).
- **Pressable, not TouchableOpacity** — Pressable supports `active:` NativeWind classes.
- **expo-image, not core `<Image>`** — caching, blurhash, faster decoding.

### State
- **TanStack Query v5** for server state, with `persistQueryClient` → MMKV.
- **`react-native-mmkv`** for synchronous persisted local state (streak, language pref, script pref, onboarding flag).
- **`expo-sqlite`** for offline review-queue mirror.
- Local UI state via `useState` / `useReducer`. **No Redux/Zustand/Jotai.**

### Backend
- **Supabase** (Postgres + Auth + Storage + Edge Functions) — chosen for the relational data model and built-in OAuth.
- **OAuth only: Google + Apple Sign-in** via Supabase Auth. No anonymous, no email/password.
- Phase 0 wires the Supabase client but leaves credentials env-driven; actual project provisioning happens in Phase 1.

### Data model
- **English-as-anchor 2-table schema** from `CLARIFICATIONS.md §3`:
  - `concept` rows = meaning (English-anchored, never shown to learners).
  - `variant` rows = language-specific forms with `latin_spelling`, `cyrillic_spelling` (Serbian only), `case_forms` JSONB, audio cols nullable.
  - `regional_tag` makes Dalmatinski, Beogradski, etc. first-class without separate tables.
- Adopted **verbatim from Carter's design** — simpler than multi-table normalization, and validated against 20-row stress-test suite (`scripts/stress-test-schema.ts`).

### Curriculum
- **Linear Pareto sequencer** — lessons unlock in strict order of `variant.frequency_rank_in_lang`. Progress metric: "X% of the way to 80% fluency."
- **FSRS via `ts-fsrs`** for spaced repetition — review layer on top of the Pareto spine.
- No skill tree, no adaptive ordering.

### Grading
- **Tiered**: `right` / `close` / `wrong`. Diacritics (š č ž đ ć) are meaning-bearing; missing one downgrades to `close`, not `wrong`. Pure functions in `src/lib/grading/`.

### Audio
- **Entirely deferred to Phase 5+.** Schema reserves `variant.ipa`, `variant.audio_url`, `variant.stress_mark` as nullable from day one.
- Vendor pick (Speechace / server-side Whisper / custom) deferred to Phase 6 prep.

### Animation
- **Reanimated 4** (`react-native-worklets/plugin` in babel, not the v3 plugin).
- `react-native-gesture-handler` for swipes/flips.

### Forms
- 1-field: `useState`.
- 2+ fields: `react-hook-form` + `zod` resolver.

## Alternatives considered

- **Multi-table data model** (separate `Lemma`, `InflectedForm`, `Pronunciation`, `RegionalAccent` tables). Rejected in favor of Carter's simpler 2-table design. Migration path remains: split `case_forms` JSONB into a `case_form` table later if grammar drills become first-class.
- **Firebase / Convex backends**. Rejected — the data model is heavily relational; Firestore would force denormalization that hurts cross-language compare queries.
- **Anonymous-first auth** (Duolingo pattern). Rejected for personal-use — Carter + wife need cross-device sync from day one.
- **SM-2 SRS algorithm**. Rejected for FSRS-4.5 (~10–20% more review-efficient per Anki's published data).
- **Monorepo (pnpm workspaces)**. Rejected for now — flat structure is simpler; Python content-pipeline and Supabase migrations live as sibling top-level folders, not workspace packages.

## Consequences

- All future screen development goes through `src/components/` shells. Stitch HTML mocks → shells via the cheat sheet at `docs/conversion-cheatsheet.md`.
- The hook-guarded directories (`/auth/`, `/migrations/`) require manual approval for first writes. Phase 0 worked around this by inlining auth helpers and deferring the SQL migration.
- Audio deferral means schema cols (`ipa`, `audio_url`, `stress_mark`) sit unused until Phase 5 — accepted tradeoff for migration-free audio landing later.
- React Compiler being ON means no premature `useMemo`/`useCallback`. Components stay simple.
