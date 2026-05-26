"""Croatian top-N seed, derived from SR_TOP100 with lexical/orthographic
overrides.

Croatian shares 80%+ of its high-frequency vocabulary with Serbian. The
notable, well-documented differences are:

  - Ijekavian reflex of Proto-Slavic *ě*: SR ekavian "e" → HR ijekavian "je"/"ije"
    (lep → lijep, mleko → mlijeko, vreme → vrijeme, dete → dijete, hteti → htjeti).
  - Lexical: SR "hleb" → HR "kruh", SR "ko" → HR "tko", SR "šta" → HR "što".
  - Orthography: HR keeps the etymological "h" in some forms.
  - Croatian is Latin-script only — VariantSchema enforces cyrillicSpelling=None.

We override only the entries that DIFFER. Identical words (ja, ti, voda, dan,
hvala) inherit from SR_TOP100 verbatim. Case forms are dropped on every
override since they'd need full re-declension for the new lexical form;
deferred to Phase 3 native review.
"""

from __future__ import annotations

from dataclasses import replace

from .sr_top100 import SR_TOP100, SeedEntry


# Maps SR latin → HR override. `latin` is the new HR form; setting any
# other field overrides the inherited SR value. Setting `_drop` to True
# excludes the entry (used for SR forms that have no HR equivalent — e.g.
# distinguishing "šta" vs "što": HR collapses both to "što" so one drops).
_HR_OVERRIDES: dict[str, dict] = {
    # Lexical: who / what / where
    "ko": {"latin": "tko"},
    # HR uses "što" for both question and relative senses. Keep both concept
    # mappings by overriding the SR "šta" entry to latin="što" (preserves the
    # question-sense conceptId) while the relative-sense "što" inherits
    # unchanged. The resulting two HR variants share latin spelling but link
    # to two distinct concepts — which is linguistically correct.
    "šta": {"latin": "što"},
    "gde": {"latin": "gdje"},
    "ovde": {"latin": "ovdje"},

    # Ijekavian reflex of ě: e → je/ije
    # NB: "hteti"/"htjeti" not overridden because SR_TOP100 only carries the
    # clitic forms (ću/ćeš/će/...) — same in both HR and SR.
    "lep": {"latin": "lijep"},
    "dete": {"latin": "dijete"},
    "želeti": {"latin": "željeti"},

    # Nouns: lexical replacement
    "hleb": {"latin": "kruh"},
    "čovek": {"latin": "čovjek"},
    "reč": {"latin": "riječ"},

    # Identical across SR/HR (left here as documentation only when needed):
    # auxiliary clitics (sam/si/je/smo/ste/su/nije/nisam), most verbs
    # (imati/moći/znati/misliti/ići), greetings, function words.
}


def _hr_entries() -> list[SeedEntry]:
    out: list[SeedEntry] = []
    seen: set[tuple[str, str | None]] = set()
    for entry in SR_TOP100:
        override = _HR_OVERRIDES.get(entry.latin)
        if override is None:
            new = entry
        elif override.get("_drop"):
            continue
        else:
            patch = {k: v for k, v in override.items() if k != "_drop" and v is not None}
            # Lexical replacement → declension changes → SR case_forms no
            # longer apply. Drop them; Phase 3 native review will redo.
            if "latin" in patch and patch["latin"] != entry.latin:
                patch["case_forms"] = None
            new = replace(entry, **patch)
        key = (new.latin, new.sense_disambiguator)
        if key in seen:
            continue
        seen.add(key)
        out.append(new)
    return out


HR_TOP100: list[SeedEntry] = _hr_entries()


def _validate_seed() -> None:
    seen: set[tuple[str, str | None]] = set()
    for entry in HR_TOP100:
        key = (entry.latin, entry.sense_disambiguator)
        if key in seen:
            raise ValueError(f"duplicate HR seed entry: {key}")
        seen.add(key)


_validate_seed()
