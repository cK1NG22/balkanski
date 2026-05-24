# Balkanski — Clarifications & Decisions

A South Slavic (Croatian / Serbian / Bosnian) language-learning app, built primarily for Carter and his wife. This document captures the decisions locked during the feature-analysis conversation on 2026-05-23, plus the open questions remaining. It is meant to be handed to a separate planning session that will decide tech stack and downstream implementation details.

The source brainstorm (the original "everything I want this app to do" dump) lives in the prior session at `~/.claude/projects/-Users-carterking-Projects-Personal/80fb1f62-2845-4180-a242-39901d907817.jsonl` (first user message). This doc supersedes that brainstorm on every point where the two disagree.

---

## 1. Project framing

- **Audience:** Personal use — Carter and his wife. Not a commercial product (yet). This relaxes constraints around legal/IP, monetization, scale, and onboarding polish.
- **Languages:** Croatian (HRV), Serbian (SRP), Bosnian (BOS) — treated as **three distinct, globally-recognized languages**. (Not "one language with regional variants." This framing is deliberate and affects UI copy, persona roster, and content modeling.)
- **Regional variants within those languages** (e.g., Dalmatinski) are first-class metadata, not separate languages.
- **Stage:** Pre-implementation. Schema and pedagogy are being designed; tech stack is being decided in a separate planning session.

---

## 2. Locked decisions

### Curriculum spine
- **Pareto vocabulary frequency is the backbone of the curriculum.** The top-N most frequent words drive what gets taught next.
- **Topic bundles are side decks.** (Going to the store, basketball, family relationships, etc.) They reference the same word inventory but are not the primary progression axis.
- **Lesson sequencer: linear Pareto-ordered path.** Lessons unlock in strict order of word frequency. This gives the user a clear progress signal ("you're 32% of the way to 80% fluency"). No skill tree, no full adaptive ordering — those add authoring complexity without enough learner-side payoff at this stage.

### Language selection UX
- **User picks one primary language at signup.** All lessons are taught in that language.
- **A "compare across languages" button is available during practice.** Tapping it reveals the same concept in the other two SCB languages (and, where applicable, in regional variants like Dalmatinski). This is a side panel, not a separate learning mode.
- **Cross-language teaching is NOT a separate "learn all together" mode.** That was rejected because beginners would drown in conflicting variants.

### Alphabet
- **Serbian users get a toggleable Latin / Cyrillic display mode.** The same word row stores both transliterations, so toggling is a render-time decision, not a data switch.
- **Croatian and Bosnian are Latin-only** in the app (matching their dominant real-world use).
- **Cyrillic teaching** remains a distinct content module for Serbian learners.

### Grammar & pronunciation
- **Grammar cases** are a flagship content area (six cases — nominative, genitive, dative, accusative, vocative, instrumental, locative — vary slightly by language).
- **Case-ending pickers** are a planned lesson type: present a word + a target case, learner picks the correct ending.
- **Syllable-stress teaching** is in scope. Each word row reserves a `stress_mark` field.

### Audio & speech
- **All audio/speech features are deferred to the end of the build.** This includes letter-sound clips, pronunciation critique, listening lessons, full conversation mode.
- **Schema must reserve slots now** so audio can be added without migration pain: `ipa`, `audio_url`, `stress_mark`. These columns exist from day one but stay nullable.
- **Pronunciation critique is flagged as the single highest technical risk** for the eventual audio phase: small-language ASR (SRP/HRV/BOS) is materially worse than English. The other planning session should pick a vendor early.

### Grading
- **Mistake model: tiered.** Three states: `right` (exact match), `close` (minor typo or missing diacritic — partial credit, shows correction), `wrong` (different word or major error). Diacritics (š, č, ž, đ, ć) are meaning-bearing in SCB so they count, but a missed one downgrades to "close," not "wrong."

### Retention systems
- **Streak tracker** — daily-use mechanic.
- **Spaced repetition (Anki-style)** on top of the linear Pareto path. New material follows the Pareto spine; SRS schedules surface past-learned items for review.

### Onboarding
- **Placement test required** at first launch. Without one, users who already speak some SCB are forced through A0 and quit. Design TBD — but the placeholder lives in the schema as a `proficiency_estimate` on the user record.

### Persistence
- **Cross-device sync via OAuth.** No custom auth. Provider TBD (Google / Apple are the obvious picks given the audience).

### Theme & gamification
- **Lookalike teachers** ship in the first cut, ~3 per country. Personas drawn from prominent Balkan figures: Nikola Jokić, "Balkan Dad," Novak Đoković, President Dodik, Luka Modrić, Aleksandar Vučić, Nikola Tesla, and others TBD.
  - **Legal risk acknowledged and deferred.** Right-of-publicity exposure exists for commercial use of likenesses. This is acceptable while the app is personal-use; revisit before any public launch.
  - **Final persona roster is open** — politically sensitive figures (Dodik, Vučić) need an explicit yes/no.
- **Geographic progression** through Balkan locations as the user advances — in scope, post-foundation.
- **Time-period progression** through historical eras — late-stage stretch goal.
- **Unlockable recipes** with custom animated art tied to progression — in scope, post-foundation.

---

## 3. DB schema design — the English-as-anchor model

The single highest-leverage decision in the app is the data model for words. The model below is the one to validate in the other planning session.

### Problem the model solves
"Pretty" in Croatian is *lijepo*. In Serbian it is *lepo* (Latin) / *лепо* (Cyrillic). In Dalmatian it is *lipo*. These are not the same word, but they refer to the same meaning. A naive "one row per word per language" model loses the link between them; a "one row per word with language as a tag column" model can't handle cases where the lexemes are genuinely different. The English-as-anchor model solves both.

### Two-table sketch

**`concept`** — the meaning, anchored on its English gloss. This is what the Pareto chart counts and what the cross-language compare button looks up.

| field | notes |
|---|---|
| `id` | PK |
| `english_lemma` | e.g., `"pretty"` — used as the canonical anchor, NOT shown to learners |
| `english_translation` | learner-facing gloss (may differ from `english_lemma` for phrases) |
| `part_of_speech` | noun / verb / adjective / phrase / etc. |
| `sense_disambiguator` | optional — for homonyms (e.g., "bank" the riverbank vs. "bank" the institution) |
| `topic_tags[]` | e.g., `["adjective", "appearance"]` — drives the topic side-decks |
| `frequency_rank_aggregate` | rough cross-language rank (used for global Pareto views) |

**`variant`** — one language's word for a concept. Multiple variants per concept.

| field | notes |
|---|---|
| `id` | PK |
| `concept_id` | FK → `concept.id` |
| `language` | `bs` / `hr` / `sr` |
| `regional_tag` | nullable — `dalmatinski`, `beogradski`, `sarajevski`, etc. NULL means the standard form. |
| `latin_spelling` | e.g., `"lijepo"`, `"lepo"`, `"lipo"` |
| `cyrillic_spelling` | nullable — populated for Serbian variants only; NULL for HRV/BOS |
| `stress_mark` | which syllable carries emphasis (representation TBD — IPA suprasegmental, or simple index) |
| `ipa` | reserved for the audio phase; nullable |
| `audio_url` | reserved for the audio phase; nullable |
| `frequency_rank_in_lang` | per-language Pareto rank — this is what the linear sequencer reads |
| `case_forms` | JSONB — for nouns/adjectives, all declined forms keyed by case (`{"nom": "lijepo", "gen": "lijepog", ...}`). NULL for indeclinables. |

### What this model gets us
- **Cross-language compare button:** `SELECT * FROM variant WHERE concept_id = X` returns all SCB forms for the concept the user is studying.
- **Per-language Pareto progression:** `frequency_rank_in_lang` is the spine the linear sequencer walks.
- **Cyrillic toggle for Serbian:** render-time choice between `latin_spelling` and `cyrillic_spelling`. Zero data manipulation.
- **Regional accents (Dalmatinski etc.):** `regional_tag` is first-class, not a bolt-on. Adding a new regional accent later = new rows under existing concepts.
- **Case-ending lesson type:** `case_forms` JSONB feeds the picker directly.
- **Phrases (e.g., "kako si"):** stored exactly like single words; `part_of_speech = "phrase"` and `english_translation` carries the natural-English equivalent.
- **One-country-only words:** schema handles this naturally — only one `variant` row exists for that concept.

### Edge cases worth surfacing in the next session
- **Words with no clean English equivalent** (e.g., *duša*, *inat*). Either pick the least-bad gloss for `english_lemma` and use `english_translation` for nuance, or allow `english_lemma` to be a short descriptor (e.g., `"inat:spite-driven-stubbornness"`).
- **Homonyms.** The `sense_disambiguator` column handles this but the lesson UI needs to make the sense unambiguous to the learner. (E.g., showing the topic tag.)
- **Compound case storage.** JSONB is the right call for now; if grammar drills become first-class, this may later want to split into a `case_form` table. Migration path is straightforward.
- **`frequency_rank_aggregate` vs. `frequency_rank_in_lang`.** Pick which one drives the sequencer per-language (recommend per-language; global rank distorts when one language has different word frequencies).

---

## 4. Explicitly deferred (revisit later — not omissions)

The following are intentionally NOT in the initial scope, and not because they were forgotten:

- **Notifications strategy** (push, email, in-app reminders)
- **Onboarding flow** (post-placement-test)
- **Monetization model** (this is personal-use for now)
- **MVP scoping** (will be sized in the other planning session)
- **Social / community features** (leaderboards, friends, clubs) — not on the original brainstorm; absent by choice
- **Conversation mode** — full voice-agent scope; possible but distant
- **Pronunciation critique infrastructure** — vendor pick deferred to audio phase
- **Geographic + time-period progression theming** — in scope, but post-foundation
- **Recipes / customs / geography content modules** — in scope, but post-foundation

---

## 5. Open questions for the other planning session

These are decisions the other planning session is responsible for. Each one is real and load-bearing.

1. **Tech stack / platform** — web (Next.js + PWA), React Native, native iOS, or web-first then native. Each implies a different shape for everything else. (Carter notes this is already being decided in the other session.)
2. **Corpus source for the Pareto chart.** Where does the source text come from for word-frequency analysis? Wikipedia + OpenSubtitles + public-domain literature is the usual safe stack. Scraping copyrighted news works for a prototype but doesn't survive any commercial scale-up.
3. **Native-speaker audio source** (for the eventual audio phase). Record Carter's wife? Hire freelancers? AI TTS? Mix?
4. **Placement test design.** Vocab-recall based? Grammar-pattern based? Self-report? Mixed?
5. **Persona roster lock.** Final list of lookalike teachers per country. Explicit yes/no on politically sensitive figures (Dodik, Vučić, etc.).
6. **Visual / art style** for the animated cultural unlocks (recipes, locations, teacher portraits). Hand-illustrated? AI-generated with a consistent style guide? Stock?
7. **OAuth provider(s)** for sync.
8. **Speech vendor pick** (deferred to audio phase but worth flagging early — small-language ASR quality varies a lot by vendor).
9. **Schema validation in code.** When the chosen tech stack lands, the schema in §3 should be implemented as a real migration and stress-tested against ~20 hand-curated concept rows with edge cases (homonyms, indeclinables, phrases, one-country words).

---

## 6. Conventions inherited from Carter's setup

- Be concise. No fluff.
- Carter is non-technical — explanations should favor plain language over jargon.
- Don't over-engineer. Simple solutions.
- Personal projects in `~/Projects/Personal/` are bespoke per stack; there is no enforced template.
- `~/.claude/skills/new-project` (code conventions) and `~/.claude/skills/restructure-project` (COS memory shape with `PROJECT.md`, `TASK.md`, `.claude/memory/`) are the two scaffolding skills available when the project's first task folder is created.
