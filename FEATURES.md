# FEATURES

Feature inventory grouped by the four architectural layers. Status legend: `planned` / `in-progress` / `shipped`. Phase tag indicates which ROADMAP phase delivers it.

> Cut-here line: Layers 1+2 are required for any usable product. Layers 3+4 are narrative wrapper and immersion polish — they can drop or defer without breaking the engine.

---

## Layer 1 — Engine

| Feature | Status | Phase |
|---|---|---|
| English-as-anchor 2-table data model (`concept` + `variant`) | shipped | 0 |
| Zod schemas matching the data model | shipped | 0 |
| 20-row schema stress test (homonyms, indeclinables, phrases, one-country, regional, Cyrillic/Latin) | shipped | 0 |
| Tiered grading (right / close / wrong + diacritic semantics) | shipped | 0 |
| Diacritic-aware string utilities (stripDiacritics, levenshtein, diacritic distance) | shipped | 0 |
| Linear Pareto sequencer | shipped | 0 |
| Pareto progress metric ("X% to 80% fluency") | shipped | 0 |
| SQL migration for Supabase schema | planned | 1 |
| OAuth (Google + Apple via Supabase Auth) | planned | 1 |
| Cross-device sync | planned | 1 |
| Streak counter (MMKV-persisted) | planned | 1 |
| Spaced repetition (FSRS via `ts-fsrs`) review layer on top of Pareto | planned | 1 |
| Offline review queue mirror (expo-sqlite) | planned | 1 |
| Placement test → `users.proficiency_estimate` | planned | 1 |
| Content ingestion pipeline (Python, hrWaC/srWaC/bsWaC/Wikipedia/OpenSubtitles/Tatoeba) | planned | 1 |
| Audio playback infrastructure (expo-audio, reference clips) | planned | 5 |
| Audio recording infrastructure (expo-audio, m4a upload) | planned | 6 |
| Pronunciation grading vendor integration | planned | 6 |
| Push notifications for streak reminders (Expo Push via Supabase Edge) | planned | 8 |

## Layer 2 — Lesson Content

| Feature | Status | Phase |
|---|---|---|
| Pareto-ranked vocab list (per language) | planned | 1 |
| First 100 Pareto words seeded for primary language | planned | 1 |
| FlashCard review interactions | planned | 1 |
| Three-language seed (HR/SR/BS top 100 each) | planned | 2 |
| Compare-across-languages panel (side panel on practice screens) | planned | 2 |
| Serbian Latin/Cyrillic toggle (render-time decision) | planned | 2 |
| Serbian Cyrillic alphabet module (30 letters + IPA) | planned | 2 |
| Cyrillic ↔ Latin transliteration utility | shipped | 0 |
| 7 grammar cases (nom/gen/dat/acc/voc/ins/loc) per language | planned | 3 |
| Case-ending picker drills | planned | 3 |
| Present-tense conjugation drills (FillInBlank) | planned | 3 |
| Topic side-decks (groceries, family, basketball) | planned | 3 |
| Word-detail modal (full case table on any noun tap) | planned | 3 |
| Colloquial phrases pack | planned | 3 |
| Syllable-stress display on words (uses `variant.stress_mark`) | planned | 5 |
| Listening lessons (audio-recognize direction) | planned | 5 |
| Read-aloud + critique drills | planned | 6 |
| Full conversation mode | planned | 8+ |

## Layer 3 — Theme / World

| Feature | Status | Phase |
|---|---|---|
| Lookalike teacher characters (~3 per country) | planned | 4 |
| Scripted teacher dialogue bubbles | planned | 4 |
| Geographic progression (Zagreb → Sarajevo → Beograd → Dubrovnik → Mostar) | planned | 4 |
| Regional dialect notes (Dalmatinski, Beogradski, Sarajevski, …) | planned | 4 |
| Cultural lesson essays (10 MDX entries: hospitality, gift-giving, eye contact, family) | planned | 7 |
| Food / recipes (8 entries with custom animated art) | planned | 7 |
| Geography content (major landmark cities + descriptions) | planned | 7 |
| Time-period progression (historical eras) | planned | 8 (stretch) |
| Recipe unlocks tied to Pareto progression | planned | 7 |

## Layer 4 — UI Localization

| Feature | Status | Phase |
|---|---|---|
| `i18next` + `react-i18next` wiring | planned | 9 |
| Per-language UI string catalogs (`en`, `hr`, `sr-Latn`, `sr-Cyrl`, `bs`) | planned | 9 |
| UI-language picker (distinct from study-language picker) | planned | 9 |
| Native-speaker translation pass | planned | 9 |
| Layout-shift QA for longer Cyrillic strings | planned | 9 |

---

## Explicitly deferred (revisit later — not omissions)

- Notifications strategy (push, email, in-app reminders) — Phase 8
- Monetization model — N/A while personal-use
- Social / community features (leaderboards, friends, clubs) — out of scope
- Conversation mode (full voice agent) — Phase 8+
- Pronunciation critique vendor — Phase 6 prep
- Geographic + time-period progression visual style — Phase 4 / 8

## Open questions (Carter decides before the relevant phase)

See `ROADMAP.md` for the full list (persona roster, placement test design, audio source, speech vendor, art style, seed language, OAuth providers).
