# Balkanski — Agent Instructions

A mobile language-learning app for **Croatian, Serbian, and Bosnian** as three distinct languages. Built primarily for **Carter and his wife** (personal use, not commercial).

> **Expo HAS CHANGED.** Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code. SDK 56 changed Reanimated to v4 (`react-native-worklets/plugin` instead of `react-native-reanimated/plugin`), React to 19.2 (React Compiler experimental is **on**), and routes now live in `src/app/`.

## Authoritative spec

- **`CLARIFICATIONS.md`** at repo root is the locked-decisions document. Read it first. It supersedes any other source.
- **`/Users/carterking/.claude/plans/encapsulated-whistling-treasure.md`** is the approved implementation plan with full data model, ROADMAP, and Phase 0 deliverables.

## Stack

- **Expo SDK 56** (React Native 0.85, React 19.2)
- **expo-router** (file-based, `src/app/`, typed routes enabled)
- **TypeScript 6** (`strict: true`, path alias `@/*` → `./src/*`)
- **pnpm 9+** (never npm, never yarn) — `.npmrc` has `node-linker=hoisted`
- **NativeWind v4** + Tailwind v3.4 (`src/global.css`, `tailwind.config.ts`)
- **TanStack Query v5** for server state
- **`react-native-mmkv`** for synchronous persisted local state
- **`expo-sqlite`** for offline review queue mirror
- **Supabase** (Postgres + Auth + Storage + Edge Functions)
- **OAuth: Google only in Phase 1** via Supabase Auth (Apple Sign-in deferred until iOS App Store distribution; no anonymous, no email/password)
- **`ts-fsrs`** for spaced repetition scheduling (review layer)
- **Reanimated 4** + `react-native-worklets` for animation (CSS transitions do not work in RN)

## Workflow — Stitch HTML → Shipped Screen

Carter sketches each screen → generates an HTML/Tailwind mock via Google Stitch → drops it in `stitch-mocks/<name>-<date>.html` → tells Claude the target route → Claude converts to React Native + NativeWind using the shells from `src/components/`.

**On every mock conversion, read `docs/conversion-cheatsheet.md` first.** It's the HTML→RN reference table.

The 10-step conversion recipe lives at `docs/workflow-recipe.md`.

## Hard rules

- **Never put raw text outside `<Text>`.** RN throws "Text strings must be rendered within a `<Text>` component."
- **Always use `Pressable`**, never `TouchableOpacity`. Pressable supports NativeWind `active:` classes.
- **Always use `expo-image`**, never RN core `<Image>`. Better caching, blurhash support.
- **Use shells from `src/components/`** — never reinvent a Card, Button, FlashCard, etc. If a needed pattern has no shell, propose adding one to the library, don't one-off it in a screen file.
- **No CSS transitions / `transition-*` / `hover:*`** — Tailwind transitions don't work in NativeWind. Use `react-native-reanimated` for animation.
- **Color tokens only** — never hardcode hex in components. Use `bg-brand-500`, `text-ink`, etc. from `tailwind.config.ts`.
- **Path alias `@/`** — never `../../..` imports. `@/components`, `@/lib`, `@/data`.
- **Don't fight React Compiler** — `experiments.reactCompiler: true` is on. Write simple functional components; the compiler memoizes. No premature `useMemo`/`useCallback`.

## Data model (English-as-anchor, 2 tables)

`concept` rows are the meaning (English-anchored, never shown to learners). `variant` rows are language-specific forms (`hr` / `sr` / `bs`) of a concept, with optional `regional_tag` for accents (Dalmatinski, Beogradski). Serbian variants store both `latin_spelling` and `cyrillic_spelling` on the same row — toggle is render-time.

Schemas: `src/data/schemas/`. SQL migration: `supabase/migrations/0001_initial_schema.sql`.

**One DB, three projections**: vocab-list = variant ordered by frequency_rank_in_lang; SRS queue = review_items joined to variant; topic side-deck = concept filtered by topic_tags joined to variant.

## Curriculum

- **Linear Pareto sequencer** — lessons unlock in strict order of `variant.frequency_rank_in_lang`. No skill tree.
- **Topic side-decks** are filtered views over the same word inventory, not the primary path.
- **Spaced repetition** (FSRS via `ts-fsrs`) surfaces past-learned items for review on top of the Pareto spine.
- **Pareto honesty (Carter's rule)**: do NOT claim "X% to fluency" or any Pareto-derived metric in UI/copy until the corpus ingestion pipeline has actually run and produced real frequency ranks from real text analysis. Until then, `ParetoProgress` renders raw counts only. Phase 1 ingestion must complete BEFORE any percentage claim ships. Phase 1 seed = "common starter words" (or CLARIN.SI hrWaC/srWaC/bsWaC frequency lists, which ARE real corpus-derived stats).

## Grading

Tiered: `right` / `close` / `wrong`. Diacritics (š č ž đ ć) are meaning-bearing; missing one downgrades to `close`, not `wrong`. Implementation in `src/lib/grading/`.

## Audio

All audio (reference playback, recording, pronunciation grading) is **deferred to Phase 5+**. Schema reserves `variant.ipa`, `variant.audio_url`, `variant.stress_mark` as nullable so audio lands without migrations.

## Testing

- jest + `@testing-library/react-native` for component shells (smoke render + variants + interactions).
- Pure-function libraries (grading, sequencer, transliteration) get unit tests with full edge-case coverage.
- `pnpm test`, `pnpm tsc --noEmit`, `pnpm exec tsx scripts/stress-test-schema.ts` before declaring Phase 0 done.

## Behavior

- Be concise. No fluff.
- Carter is non-technical — explain choices in plain language.
- Don't over-engineer. Simple solutions.
- Defer to Carter's design intuitions (especially data model — his 2-table schema is the source of truth).
