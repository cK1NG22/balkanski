"""Build orchestration.

For each language: load curated seed → load corpus ranks → merge → validate via
pydantic → write `content/vocab/<lang>-starter.json` with a `_meta` block.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

from .cyrillic import latin_to_cyrillic
from .models import CaseForms, Concept, Language, Methodology, Variant, VocabBundle
from .seed.sr_top100 import SR_TOP100, SeedEntry
from .sources.opensubtitles import load_opensubtitles_ranks, source_metadata

# Anchor at repo root regardless of where `python -m balkanski_pipeline` is run.
REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / "content" / "vocab"

METHODOLOGY_VERSION = "1.0.0"


def _concept_id(entry: SeedEntry) -> str:
    """Deterministic UUIDv5 — same seed always yields the same concept id."""
    key = f"balkanski:concept:{entry.english_lemma}:{entry.sense_disambiguator or ''}"
    return str(uuid5(NAMESPACE_URL, key))


def _variant_id(entry: SeedEntry, language: str) -> str:
    key = (
        f"balkanski:variant:{language}:{entry.latin}:"
        f"{entry.sense_disambiguator or ''}"
    )
    return str(uuid5(NAMESPACE_URL, key))


def _dedupe_concepts(concepts: list[Concept]) -> list[Concept]:
    """Two seed entries can intentionally share a concept (e.g. 'a' and 'ali'
    both mean 'but'). Their `_concept_id` collides on englishLemma +
    senseDisambiguator -- that's by design. We keep one concept row per id,
    favoring the more-frequent (lower) rank so the aggregate field reflects
    the best surface form across variants. The TS seeder used to dedupe
    defensively; with this in place, the pipeline ships clean JSON.
    """
    by_id: dict[str, Concept] = {}
    for c in concepts:
        existing = by_id.get(c.id)
        if existing is None:
            by_id[c.id] = c
            continue
        if (
            c.frequencyRankAggregate is not None
            and existing.frequencyRankAggregate is not None
            and c.frequencyRankAggregate < existing.frequencyRankAggregate
        ):
            by_id[c.id] = c
    return list(by_id.values())


def _build_language(
    language: Language,
    seed: list[SeedEntry],
    corpus: dict[str, int],
) -> VocabBundle:
    concepts: list[Concept] = []
    variants: list[Variant] = []
    missing: list[str] = []
    fallback_base = max(corpus.values(), default=0) + 1

    for entry in seed:
        # Corpus rank if known; else assign a deterministic fallback rank that
        # still puts the word into the teachable range.
        rank = corpus.get(entry.latin)
        if rank is None:
            rank = fallback_base + len(missing)
            missing.append(entry.latin)

        concept_id = _concept_id(entry)
        variant_id = _variant_id(entry, language)

        concepts.append(
            Concept(
                id=concept_id,
                englishLemma=entry.english_lemma,
                englishTranslation=entry.english_translation,
                partOfSpeech=entry.pos,
                senseDisambiguator=entry.sense_disambiguator,
                topicTags=list(entry.topic_tags),
                frequencyRankAggregate=rank,
            )
        )

        case_forms = CaseForms(**entry.case_forms) if entry.case_forms else None
        cyrillic = latin_to_cyrillic(entry.latin) if language == "sr" else None

        variants.append(
            Variant(
                id=variant_id,
                conceptId=concept_id,
                language=language,
                regionalTag=None,
                latinSpelling=entry.latin,
                cyrillicSpelling=cyrillic,
                stressMark=None,
                ipa=None,
                audioUrl=None,
                frequencyRankInLang=rank,
                caseForms=case_forms,
            )
        )

    if missing:
        print(f"  ! {len(missing)} seed lemmas missing from corpus, using fallback ranks: {missing}")

    deduped_concepts = _dedupe_concepts(concepts)
    collapsed = len(concepts) - len(deduped_concepts)
    if collapsed:
        print(f"  · merged {collapsed} concept row(s) that shared a UUIDv5 (multiple variants per concept)")

    return VocabBundle(
        language=language,
        concepts=deduped_concepts,
        variants=variants,
        meta=Methodology(
            version=METHODOLOGY_VERSION,
            generated_at=datetime.now(timezone.utc).isoformat(),
            sources=[source_metadata(language)],
            notes=(
                "Curated top-100 seed cross-referenced with Hermit Dave's "
                "OpenSubtitles 2018 frequency list. POS hand-tagged. "
                "Case forms hand-authored for top common nouns. Cyrillic "
                "spelling derived programmatically from Latin via the "
                "mirror of src/lib/cyrillic/translit.ts. See "
                "content-pipeline/README.md for full methodology."
            ),
        ),
    )


def _write(bundle: VocabBundle, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(bundle.to_json(), ensure_ascii=False, indent=2) + "\n"
    path.write_text(payload, encoding="utf-8")


def build_serbian() -> None:
    print("=== Building Serbian vocab ===")
    print("Loading OpenSubtitles SR corpus...")
    corpus = load_opensubtitles_ranks("sr")
    print(f"  · {len(corpus)} ranked lemmas after dedupe + filter")

    print("\nMerging seed × corpus...")
    bundle = _build_language("sr", SR_TOP100, corpus)
    print(f"  · {len(bundle.concepts)} concepts, {len(bundle.variants)} variants")

    out = OUT_DIR / "sr-starter.json"
    _write(bundle, out)
    rel = out.relative_to(REPO_ROOT)
    print(f"\n✓ wrote {rel}")
    print(f"  · rank-1 lemma: {min(bundle.variants, key=lambda v: v.frequencyRankInLang).latinSpelling}")
    print(f"  · rank-100 lemma: {max(bundle.variants, key=lambda v: v.frequencyRankInLang).latinSpelling}")
