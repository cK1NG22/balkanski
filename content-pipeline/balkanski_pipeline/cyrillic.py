"""Serbian Latin <-> Cyrillic transliteration.

Mirror of `src/lib/cyrillic/translit.ts`. Kept byte-for-byte equivalent so the
output JSON matches whatever the app would generate at render-time.
"""

from __future__ import annotations

_LAT_TO_CYR: dict[str, str] = {
    # digraphs first (LJ/Lj/lj/NJ/Nj/nj/DŽ/Dž/dž). Fully-uppercase variants
    # exist so signage like "LJUBAV" transliterates to "ЉУБАВ" (not the
    # wrong "ЛЈУБАВ").
    "LJ": "Љ", "Lj": "Љ", "lj": "љ",
    "NJ": "Њ", "Nj": "Њ", "nj": "њ",
    "DŽ": "Џ", "Dž": "Џ", "dž": "џ",
    # uppercase single letters
    "A": "А", "B": "Б", "V": "В", "G": "Г", "D": "Д", "Đ": "Ђ", "E": "Е",
    "Ž": "Ж", "Z": "З", "I": "И", "J": "Ј", "K": "К", "L": "Л", "M": "М",
    "N": "Н", "O": "О", "P": "П", "R": "Р", "S": "С", "T": "Т", "Ć": "Ћ",
    "U": "У", "F": "Ф", "H": "Х", "C": "Ц", "Č": "Ч", "Š": "Ш",
    # lowercase single letters
    "a": "а", "b": "б", "v": "в", "g": "г", "d": "д", "đ": "ђ", "e": "е",
    "ž": "ж", "z": "з", "i": "и", "j": "ј", "k": "к", "l": "л", "m": "м",
    "n": "н", "o": "о", "p": "п", "r": "р", "s": "с", "t": "т", "ć": "ћ",
    "u": "у", "f": "ф", "h": "х", "c": "ц", "č": "ч", "š": "ш",
}

_CYR_TO_LAT: dict[str, str] = {v: k for k, v in _LAT_TO_CYR.items()}

# Greedy longest-match: derive digraph ordering from the table itself so it
# can't drift as new entries are added.
_LAT_DIGRAPHS: tuple[str, ...] = tuple(
    sorted((k for k in _LAT_TO_CYR if len(k) > 1), key=len, reverse=True)
)


def latin_to_cyrillic(text: str) -> str:
    """Convert Serbian Latin to Cyrillic. Digraphs are matched before single
    characters so 'lj' becomes 'љ' not 'лј'."""
    s = text
    for digraph in _LAT_DIGRAPHS:
        s = s.replace(digraph, _LAT_TO_CYR[digraph])
    return "".join(_LAT_TO_CYR.get(ch, ch) for ch in s)


def cyrillic_to_latin(text: str) -> str:
    """Convert Serbian Cyrillic to Latin."""
    return "".join(_CYR_TO_LAT.get(ch, ch) for ch in text)
