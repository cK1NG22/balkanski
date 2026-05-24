"""Pydantic models mirroring the zod schemas in `src/data/schemas/`.

Any field rename here must be paired with the matching zod change — otherwise
`validate-content.ts` will reject the JSON. The TS layer is the source of
truth; this file exists so the Python pipeline can validate its own output
before writing to disk.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

Language = Literal["hr", "sr", "bs"]

PartOfSpeech = Literal[
    "noun",
    "verb",
    "adjective",
    "adverb",
    "preposition",
    "pronoun",
    "conjunction",
    "interjection",
    "numeral",
    "phrase",
    "particle",
]


class CaseForms(BaseModel):
    nom: str | None = None
    gen: str | None = None
    dat: str | None = None
    acc: str | None = None
    voc: str | None = None
    ins: str | None = None
    loc: str | None = None
    nomPl: str | None = None
    genPl: str | None = None
    datPl: str | None = None
    accPl: str | None = None
    vocPl: str | None = None
    insPl: str | None = None
    locPl: str | None = None

    model_config = {"extra": "forbid"}

    def to_json(self) -> dict[str, str]:
        """Drop None entries so the output JSON matches the zod-optional shape."""
        return {k: v for k, v in self.model_dump().items() if v is not None}


class Concept(BaseModel):
    id: str
    englishLemma: str = Field(min_length=1)
    englishTranslation: str = Field(min_length=1)
    partOfSpeech: PartOfSpeech
    senseDisambiguator: str | None = None
    topicTags: list[str] = Field(default_factory=list)
    frequencyRankAggregate: int | None = Field(default=None, gt=0)


class Variant(BaseModel):
    id: str
    conceptId: str
    language: Language
    regionalTag: str | None = None
    latinSpelling: str = Field(min_length=1)
    cyrillicSpelling: str | None = None
    stressMark: str | None = None
    ipa: str | None = None
    audioUrl: str | None = None
    frequencyRankInLang: int = Field(gt=0)
    caseForms: CaseForms | None = None

    model_config = {"extra": "forbid"}

    @model_validator(mode="after")
    def _script_constraint(self) -> "Variant":
        if self.language in ("hr", "bs") and self.cyrillicSpelling is not None:
            raise ValueError(
                f"{self.language} variants must not carry a cyrillic_spelling"
            )
        return self


class Methodology(BaseModel):
    """Carter's Pareto-honesty rule: every shipped vocab JSON carries a paper
    trail so a future auditor can replay the derivation."""

    version: str
    generated_at: str
    sources: list[dict[str, str]]
    notes: str


class VocabBundle(BaseModel):
    """Top-level JSON shape written to `content/vocab/<lang>-starter.json`."""

    language: Language
    concepts: list[Concept]
    variants: list[Variant]
    meta: Methodology

    def to_json(self) -> dict:
        # Custom serialization: drop None case_forms keys, preserve UUIDs.
        return {
            "language": self.language,
            "concepts": [c.model_dump() for c in self.concepts],
            "variants": [
                {
                    **v.model_dump(exclude={"caseForms"}),
                    "caseForms": v.caseForms.to_json() if v.caseForms else None,
                }
                for v in self.variants
            ],
            "_meta": self.meta.model_dump(),
        }
