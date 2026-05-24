# balkanski

Mobile language-learning app for **Croatian, Serbian, and Bosnian**, built for Carter and his wife (personal use).

Three distinct languages, not variants of one. Regional dialects (Dalmatinski, Beogradski, …) are first-class metadata. Curriculum is **linear Pareto-ordered** — lessons unlock in strict word-frequency order. SRS sits on top as a review layer. Audio is fully deferred to Phase 5+.

## Stack

Expo SDK 56 · React Native 0.85 · React 19.2 · TypeScript 6 · expo-router v4 · NativeWind v4 · TanStack Query · Supabase · `ts-fsrs` · pnpm.

## Workflow

Carter sketches each screen, runs it through Google Stitch to get HTML/Tailwind mocks, drops them in `stitch-mocks/`. Claude converts to React Native using shells from `src/components/`, following `docs/conversion-cheatsheet.md` and `docs/workflow-recipe.md`.

## Source of truth

- **`CLARIFICATIONS.md`** — locked decisions: data model, curriculum, grading, auth, deferral list.
- **`AGENTS.md`** — agent instructions (stack rules, conventions, project layout).
- **`ROADMAP.md`** — phased plan (9 phases, layer-tagged).
- **`FEATURES.md`** — feature inventory grouped by architectural layer.
- **`docs/conversion-cheatsheet.md`** — HTML → React Native reference (read on every Stitch mock conversion).
- **`docs/workflow-recipe.md`** — 10-step Stitch HTML → shipped screen procedure.
- **`docs/decisions/`** — ADRs.

## Running

```sh
pnpm install
pnpm start        # Expo dev server
pnpm ios          # iOS simulator
pnpm android      # Android emulator
pnpm test         # jest
pnpm tsc --noEmit # type check
pnpm exec tsx scripts/stress-test-schema.ts   # 20-row schema edge-case suite
pnpm exec tsx scripts/validate-content.ts     # content JSON validation
```

## Phase 0 status

Scaffold complete: bootable Expo app, 14+ component shells with NativeWind, all expo-router routes, zod schemas matching Carter's 2-table data model, tiered grading library + tests, linear Pareto sequencer + tests, 20-row schema stress-test, debug components gallery, conversion cheatsheet, workflow recipe, ADR, ROADMAP, FEATURES.

Phase 1 starts when Carter provisions a Supabase project and provides `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
