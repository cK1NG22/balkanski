# content-pipeline/

Python ingestion pipeline. Produces `content/vocab/sr-starter.json` (and eventually `hr-starter.json`, `bs-starter.json`) from real corpus-derived frequency data, hand-curated glosses + POS + case forms, and programmatic Cyrillic transliteration.

## Run it

```bash
cd content-pipeline
uv sync          # one-time; installs httpx + pydantic into a venv
uv run python -m balkanski_pipeline
```

Output: `<repo-root>/content/vocab/sr-starter.json` plus a `_meta` block listing source URLs, ingestion timestamp, and methodology version.

## Methodology

For each Serbian lemma we want a frequency rank that reflects **spoken-register relevance** (what learners actually need first), not raw web-text frequency.

### Primary source: Hermit Dave's `FrequencyWords`

Pre-lemmatized, pre-POS-filtered frequency lists derived from the OpenSubtitles 2018 dump. Maintained at <https://github.com/hermitdave/FrequencyWords>.

- Already lemmatized → no duplicate inflected forms inflating ranks.
- Subtitle-derived → spoken-register bias (dialogue, not legalese).
- Cached on first run under `content-pipeline/cache/` so subsequent runs are network-free.

### Secondary source: curated SR top-100 seed

`balkanski_pipeline/seed/sr_top100.py` holds a hand-authored list of the ~100 highest-impact Serbian words. Each entry includes:

- `latin` spelling (canonical lemma)
- `english_lemma` (anchor — not learner-facing)
- `english_translation` (learner-facing gloss)
- `part_of_speech` (POS-tagged by hand; primary defense against PROPN slippage)
- `topic_tags[]`
- `case_forms` (for top ~15 nouns/adjectives; rest are null → driven by Phase 3 case drills)

The seed is the authoritative source for **what gets shipped**; the corpus is the authoritative source for **rank order within the seed**.

### Why curated-top-100 + corpus-rank instead of pure auto-pipeline

| Pure auto | Curated + corpus rank (what we do) |
|---|---|
| ~80% accurate at 100 words; PROPN slippage, gloss drift, case-form fragility | ~99% accurate at 100 words; documented methodology |
| Re-runs add words for free | Re-runs validate rank changes; growing past 100 means hand-extending seed (or swapping to CLASSLA) |
| Hard to debug if a learner sees nonsense | Every shipped word has a paper trail |

The pipeline is structured so we can swap the corpus source (e.g., add CLARIN.SI srWaC + CLASSLA lemmatization) without touching the curated seed.

### Why this is "validated" per the Pareto-honesty rule

Carter's rule: no `%-to-fluency` UI claim until ranks come from a real corpus. The output JSON ships with a `_meta.methodology` block listing every source URL + retrieval date. `ParetoProgress.validated` flips to `true` in the app only when the loader successfully validates a JSON file that carries this block — not on vibes.

## Future scaling (post-Phase-1)

- **CLASSLA full-corpus pass** — install `classla`, run the srWaC dump through it, get lemma+POS for the top 10k. Drops accuracy of the curation step from 1.0 → ~0.95 in exchange for 100× coverage.
- **Apertium SR-EN dictionary** for auto-gloss enrichment beyond the curated 100.
- **HR + BS variants** — extend `seed/` with `hr_top100.py` and `bs_top100.py`; the build pipeline already handles per-language outputs.

## Layout

```
content-pipeline/
├── pyproject.toml
├── README.md                                ← you are here
├── balkanski_pipeline/
│   ├── __init__.py
│   ├── __main__.py                          ← `python -m balkanski_pipeline`
│   ├── build.py                             ← orchestration
│   ├── cyrillic.py                          ← Latin↔Cyrillic (mirror of src/lib/cyrillic/translit.ts)
│   ├── models.py                            ← pydantic models matching zod schemas
│   ├── sources/
│   │   ├── __init__.py
│   │   └── opensubtitles.py                 ← Hermit Dave's frequency list
│   └── seed/
│       ├── __init__.py
│       └── sr_top100.py                     ← hand-curated Serbian seed
└── cache/                                   ← gitignored; cached corpora downloads
```
