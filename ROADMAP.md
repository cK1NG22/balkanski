# ROADMAP

`balkanski` — Balkan language learning app for Croatian, Serbian, and Bosnian. Built for Carter and his wife (personal use). Authoritative spec: `CLARIFICATIONS.md`.

Each phase is tagged with the architectural layer(s) it builds (Engine / Lesson Content / Theme-World / UI Localization — see `FEATURES.md`).

---

## Phase 0 — Scaffold ✓ in progress

*Cross-cutting.*

Bootable Expo + NativeWind app with every shell, every route stub, every config. The HTML→RN conversion pipeline is ready to accept Stitch mocks.

**Deliverables**: directory tree, configs (babel, metro, tailwind, tsconfig), 14+ component shells, expo-router routes, zod schemas, grading library + tests, Pareto sequencer + tests, 20-row schema stress-test, conversion cheatsheet, workflow recipe, ADR, project memory tree, FEATURES.md.

**Done when**: `pnpm start` boots iOS sim, tabs navigate, every shell renders in `(debug)/components`, schema stress test passes.

---

## Phase 1 — OAuth + Placement Test + Serbian Starter MVP

*Layer 1 + Layer 2 base. Weeks 1–4.*

- **Google OAuth** wired through Supabase Auth (Apple deferred until iOS App Store distribution).
- SQL migration created and applied to Supabase project.
- **Content pipeline runs first**: Python ingestion of CLARIN.SI srWaC + OpenSubtitles + Wikipedia + Tatoeba → real `frequency_rank_in_lang` values for Serbian.
- Placement test: **mixed** — 5 SR vocab questions + 5 SR grammar questions (2 min), writes `users.proficiency_estimate`.
- Linear Pareto sequencer reads `variant.frequency_rank_in_lang` for Serbian — the user's primary language.
- First ~100 starter Serbian words seeded from the ingestion output (NOT invented placeholders).
- FlashCard SRS review (FSRS via `ts-fsrs`) on top of Pareto.
- Tiered grading (right/close/wrong) live in the lesson runner.
- Streak counter via MMKV.
- **`ParetoProgress.validated` flips to `true`** once ingestion produces real frequencies — until then, the component shows raw count only (Carter's Pareto-honesty rule).

**Done when**: Carter signs in via Google, takes placement test, completes a 5-min daily session in Serbian, streak increments next day, "close" answers show correction inline, ParetoProgress shows real corpus-derived rank.

---

## Phase 2 — Three Languages + Compare + Cyrillic

*Layer 2. Weeks 5–8.*

- All 3 languages seeded (first 100 Pareto words each).
- User can switch primary language.
- "Compare across languages" button on practice screens (`CompareLanguagesPanel`).
- Serbian users get Latin/Cyrillic toggle.
- Cyrillic alphabet module (Serbian-only) with 30 letters + IPA.

**Done when**: Carter (or wife) signs in, picks Serbian, completes 5 lessons in Cyrillic mode, hits compare button and sees Croatian + Bosnian forms.

---

## Phase 3 — Grammar Cases + Topic Side-Decks

*Layer 2. Weeks 9–12.*

- `CaseEndingPicker` drills for nom/acc/dat across all 3 languages.
- `FillInBlankInput` for present-tense conjugation.
- Topic side-decks shipped: `groceries`, `family`, `basketball`.
- Word-detail modal shows full case table on any noun tap.

**Done when**: Carter completes a topic side-deck and can recognize/produce nom/acc for 30 nouns across all 3 languages.

---

## Phase 4 — Lookalike Teachers + Geographic Progression

*Layer 3. Weeks 13–16.*

- **Persona roster** (locked 2026-05-23): full named list including politicians — Jokić, Modrić, Đoković, Dodik, Vučić, Tesla, Balkan Dad, +TBD to fill 3 per country. Legal exposure acknowledged for personal use; **revisit before any public launch**.
- **Art style** (locked 2026-05-23): AI-generated with a consistent style-reference image pinned across all generations (Midjourney / Imagen / Flux). Pick the style-ref image as the first task of Phase 4.
- Persona-led lessons via `TeacherAvatar` with scripted bubbles.
- Geographic progression unlocks: Zagreb → Sarajevo → Beograd → Dubrovnik → Mostar.
- Region-specific dialect notes (Dalmatinski when reaching Dubrovnik, etc.).

**Done when**: Carter has unlocked Beograd and met all teachers in the roster.

---

## Phase 5 — Audio: Reference Playback

*Layer 1 enhancement. Weeks 17–20.*

- Native-speaker reference audio for top 500 words per language.
- `AudioPlayer` shell goes from Phase-5-stub to real (using `expo-audio`).
- Listening lessons.
- No recording or grading yet.

**Decision needed before starting**: native-speaker audio source (Carter's wife? freelance voice actors? ElevenLabs voice cloning?).

---

## Phase 6 — Audio: Pronunciation Critique

*Layer 1 enhancement. Weeks 21–24.*

- `RecordButton` wired with `expo-audio` recording.
- Pronunciation-grading vendor integrated (Speechace / server-side Whisper / custom — vendor pick decided in Phase 5 prep).
- Per-letter pronunciation feedback.
- Repeat-after-me drills.

**Gate**: vendor BCS quality verified (record 20 test utterances, half native-quality / half deliberately bad, confirm scores discriminate).

---

## Phase 7 — Culture, Food, Geography Content

*Layer 3. Weeks 25–28.*

- 10 culture MDX lessons (customs: hospitality, gift-giving, eye contact, keeping in touch with family) with inline `WordChip` vocab.
- 8 food/recipe entries with custom animated art (style TBD).
- Geography content expanded — major landmark cities (Zagreb, Beograd, Sarajevo, Mostar, Dubrovnik).
- Time-period progression (historical eras) as stretch goal.

---

## Phase 8 — Polish, Brand, Launch Prep

*Cross-cutting.*

- Brand tokens swapped in (placeholder palette → real brand).
- Reanimated polish pass on key interactions.
- App icon, splash screen, store screenshots.
- TestFlight build (for Carter + wife — not public).
- If/when going public: legal review for teacher likenesses, persona roster final lock, monetization model decision.

---

## Phase 9 — UI Localization

*Layer 4. Defer until 1–8 stable.*

- Wire `i18next` + `expo-localization`.
- Extract every UI string into `locales/{en,hr,sr-Latn,sr-Cyrl,bs}/{common,lessons,errors}.json`.
- UI-language picker distinct from study-language picker.
- Translation pass by native speakers (or Carter + wife if competent by this point).

**Done when**: Carter switches UI into Serbian and sees no English string.

---

## Decisions (locked 2026-05-23)

1. ✓ **Phase 1 seed language**: Serbian (sr)
2. ✓ **Placement test design**: mixed (5 vocab + 5 grammar, 2 min)
3. ✓ **OAuth providers**: Google only in Phase 1 (Apple deferred)
4. ✓ **Persona roster for Phase 4**: full named list incl. politicians (Jokić, Modrić, Đoković, Dodik, Vučić, Tesla, Balkan Dad, +TBD per country) — personal-use exposure accepted, revisit before public launch
5. ✓ **Visual art style**: AI-generated with consistent style-reference image
6. ✓ **Corpus source**: CLARIN.SI (hrWaC/srWaC/bsWaC) + Wikipedia + OpenSubtitles + Tatoeba (research-licensed safe stack)
7. ✓ **Grammar cases**: 7 (nom/gen/dat/acc/voc/ins/loc)
8. ✓ **Pareto honesty**: no "% to fluency" claims until corpus ingestion validates the ranks

## Still open (deferred to phase prep)

- **Native-speaker audio source for Phase 5**: wife / freelance / ElevenLabs / mix — decide when Phase 5 prep starts
- **Speech vendor for Phase 6**: Speechace / server-side Whisper / custom — decide when Phase 6 prep starts
