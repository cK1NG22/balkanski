"""Hermit Dave's OpenSubtitles 2018 frequency lists.

Source: https://github.com/hermitdave/FrequencyWords
Format: one `lemma frequency` pair per line, descending frequency.

Already lemmatized and POS-filtered by Hermit Dave; we further drop:
  - Mixed-script Cyrillic duplicates that snuck through (we deduplicate by
    transliterating Cyrillic rows to Latin and merging counts).
  - Tokenization errors (single-letter remnants, hyphens, etc.).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Final, Literal

import httpx

from ..cyrillic import cyrillic_to_latin

Language = Literal["sr", "hr", "bs"]

_SOURCE_BASE: Final[str] = (
    "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018"
)

# Bosnian isn't in Hermit Dave's list; we treat it as a stub here. HR exists.
_LANG_PATH: Final[dict[Language, str | None]] = {
    "sr": "sr/sr_50k.txt",
    "hr": "hr/hr_50k.txt",
    "bs": None,
}

_CACHE_DIR: Final[Path] = Path(__file__).resolve().parents[2] / "cache"

# Matches a clean lemma: only letters (Latin or Cyrillic) and an internal
# apostrophe or hyphen. Anything else is corpus noise.
_LEMMA_RE: Final[re.Pattern[str]] = re.compile(
    r"^[A-Za-zĐđŠšČčĆćŽžА-Яа-яЂђЈјЉљЊњЋћЏџ]+(?:[-']"
    r"[A-Za-zĐđŠšČčĆćŽžА-Яа-яЂђЈјЉљЊњЋћЏџ]+)*$"
)


class SourceUnavailableError(RuntimeError):
    """Raised when a language has no OpenSubtitles list."""


def _download(language: Language) -> str:
    rel = _LANG_PATH[language]
    if rel is None:
        raise SourceUnavailableError(
            f"OpenSubtitles 2018 has no list for language={language!r}"
        )

    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = _CACHE_DIR / f"opensubtitles_{language}_50k.txt"
    if cache_file.exists():
        return cache_file.read_text(encoding="utf-8")

    url = f"{_SOURCE_BASE}/{rel}"
    print(f"  · downloading {url}")
    response = httpx.get(url, timeout=60.0, follow_redirects=True)
    response.raise_for_status()
    text = response.text
    cache_file.write_text(text, encoding="utf-8")
    print(f"  · cached → {cache_file.relative_to(Path.cwd())}")
    return text


def load_opensubtitles_ranks(language: Language) -> dict[str, int]:
    """Return a `{lemma_latin: rank}` map. Rank is 1-indexed (1 = most frequent)
    after deduplicating mixed-script entries and filtering tokenization noise.
    """
    text = _download(language)
    frequencies: dict[str, int] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) != 2:
            continue
        lemma, freq_str = parts
        try:
            freq = int(freq_str)
        except ValueError:
            continue
        if not _LEMMA_RE.match(lemma):
            continue
        # Normalize Cyrillic rows to Latin and merge with any Latin duplicate.
        if any("Ѐ" <= ch <= "ӿ" for ch in lemma):
            lemma = cyrillic_to_latin(lemma).lower()
        else:
            lemma = lemma.lower()
        frequencies[lemma] = frequencies.get(lemma, 0) + freq

    # Stable rank: descending freq, alphabetical tie-break.
    sorted_lemmas = sorted(frequencies.items(), key=lambda kv: (-kv[1], kv[0]))
    return {lemma: rank for rank, (lemma, _) in enumerate(sorted_lemmas, start=1)}


SOURCE_URL_TEMPLATE: Final[str] = f"{_SOURCE_BASE}/{{rel}}"


def source_metadata(language: Language) -> dict[str, str]:
    rel = _LANG_PATH[language]
    if rel is None:
        return {"name": "opensubtitles-2018", "url": "n/a", "note": "unavailable"}
    return {
        "name": "opensubtitles-2018",
        "url": SOURCE_URL_TEMPLATE.format(rel=rel),
        "note": "Hermit Dave's lemmatized OpenSubtitles 2018 frequency list",
    }
