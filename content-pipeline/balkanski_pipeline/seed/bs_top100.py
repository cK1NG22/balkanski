"""Bosnian top-N seed, derived from SR_TOP100 with lexical/orthographic
overrides.

Bosnian sits between SR and HR linguistically. The conservative choices
shipped here:

  - Ijekavian reflex of *ě* (like HR): lep → lijep, hteti → htjeti,
    dete → dijete, gde → gdje, čovek → čovjek, reč → riječ.
  - Function words like SR: BS retains "ko" (who) and "šta" (what), not
    HR's "tko" / "što". Both ko/tko and šta/što occur in BS in practice
    but the SR-like forms are more widespread in spoken BS.
  - Lexical: SR "hleb" → BS "hljeb" (ijekavian-traditional). Some BS
    speakers also use "kruh" (HR) interchangeably; "hljeb" is the
    canonical BS form.
  - Bosnian is Latin-script only — VariantSchema enforces cyrillicSpelling=None.

Case forms are dropped on every lexical override; deferred to Phase 3
native review with Carter's wife.
"""

from __future__ import annotations

from dataclasses import replace

from .sr_top100 import SR_TOP100, SeedEntry


_BS_OVERRIDES: dict[str, dict] = {
    # Ijekavian reflex of ě: e → je/ije (same as HR)
    # NB: "hteti"/"htjeti" not overridden — SR_TOP100 has only the clitic
    # forms (ću/ćeš/će/...), which are identical across SR/HR/BS.
    "lep": {"latin": "lijep"},
    "dete": {"latin": "dijete"},
    "želeti": {"latin": "željeti"},
    "gde": {"latin": "gdje"},
    "ovde": {"latin": "ovdje"},
    "čovek": {"latin": "čovjek"},
    "reč": {"latin": "riječ"},

    # Lexical
    "hleb": {"latin": "hljeb"},

    # Function words ko/šta/što: keep SR forms (no override). BS uses both
    # ko/tko and šta/što in practice; SR forms are more widespread.
}


def _bs_entries() -> list[SeedEntry]:
    out: list[SeedEntry] = []
    seen: set[tuple[str, str | None]] = set()
    for entry in SR_TOP100:
        override = _BS_OVERRIDES.get(entry.latin)
        if override is None:
            new = entry
        else:
            patch = {k: v for k, v in override.items() if v is not None}
            if "latin" in patch and patch["latin"] != entry.latin:
                patch["case_forms"] = None
            new = replace(entry, **patch)
        key = (new.latin, new.sense_disambiguator)
        if key in seen:
            continue
        seen.add(key)
        out.append(new)
    return out


BS_TOP100: list[SeedEntry] = _bs_entries()


def _validate_seed() -> None:
    seen: set[tuple[str, str | None]] = set()
    for entry in BS_TOP100:
        key = (entry.latin, entry.sense_disambiguator)
        if key in seen:
            raise ValueError(f"duplicate BS seed entry: {key}")
        seen.add(key)


_validate_seed()
