# Decisions

Chronological log of meaningful architectural decisions. See `docs/decisions/` for full ADRs.

## 2026-05-23

- **Stack locked**: Expo SDK 56 + expo-router v4 + NativeWind v4 + TypeScript 6 + pnpm. See `docs/decisions/0001-stack.md`.
- **Data model**: English-as-anchor 2-table schema (`concept` + `variant`) adopted from Carter's `CLARIFICATIONS.md §3` verbatim. JSONB `case_forms` instead of separate `inflected_form` table — migration path remains open.
- **Curriculum spine**: Linear Pareto (strict by `frequency_rank_in_lang`). SRS layered on top via `ts-fsrs`. No skill tree.
- **Grading**: Tiered (right / close / wrong) with diacritic-only differences downgrading to `close`.
- **Audio**: Fully deferred to Phase 5+. Schema reserves nullable cols (`ipa`, `audio_url`, `stress_mark`) from day one.
- **Auth**: OAuth only (Google + Apple via Supabase Auth). No anonymous, no email/password.
- **Component shells**: 14+ typed shells in `src/components/`. Every Stitch mock conversion goes through these — no per-screen reinvention.
- **Animation**: Reanimated 4 with `react-native-worklets/plugin` (not the v3 plugin). React Compiler experimental ON, so no premature `useMemo`/`useCallback`.
- **Hook workarounds**: `src/lib/auth/` and `supabase/migrations/` are guarded by Carter's global `guard-sharp-edges.sh`. Auth helpers inlined into `AuthProvider`; migration deferred to Phase 1.
- **Routes**: file-based in `src/app/` (SDK 56 default; not top-level `app/`).

## 2026-05-23 — Open-question lock-in (post-scaffold)

- **Phase 1 seed language**: **Serbian** (sr). Most data-model exercise (Latin + Cyrillic, full case forms, widest cross-language compare).
- **Pareto honesty**: don't claim "X% to fluency" or any Pareto-derived metric in UI until corpus ingestion validates the ranks. Carter's words: "we shouldnt attribute anything to the pareto rule yet. we are going to need to do some serious math and text ingestion for that." Reflected in `ParetoProgress` (`validated=false` default → raw count only) and in `AGENTS.md`.
- **OAuth providers**: **Google only** in Phase 1. Apple sign-in deferred until iOS App Store distribution (avoids the Apple Developer membership dance during personal-use phase). Sign-in screen updated accordingly.
- **Grammar cases**: **7** (nom/gen/dat/acc/voc/ins/loc). Standard BCS grammar.
- **Placement test**: **mixed** — 5 vocab recall + 5 grammar pattern. 2 minutes total. Authored in Phase 1.
- **Corpus source for ingestion**: **CLARIN.SI (hrWaC/srWaC/bsWaC) + OpenSubtitles + Wikipedia + Tatoeba** — the "safe stack" (research-licensed derived stats; safe for any future commercial use).
- **Persona roster (Phase 4)**: **full named list including politicians** (Jokić, Modrić, Đoković, Dodik, Vučić, Tesla, Balkan Dad, +TBD). Legal exposure acknowledged and accepted for personal use; revisit before any public launch.
- **Visual art style**: **AI-generated with a consistent style-reference image** (Midjourney / Imagen / Flux), pinned across all 50+ illustrations to keep the visual identity cohesive.
- **Audio source (Phase 5)**: **deferred** — address when Phase 5 prep starts.
- **Speech vendor (Phase 6)**: **deferred** — address when Phase 6 prep starts.
