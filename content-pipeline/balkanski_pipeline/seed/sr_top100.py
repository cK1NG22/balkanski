"""Hand-curated Serbian top-100 seed.

Each entry is hand-tagged for POS and (for top nouns) declined through the
seven cases × two numbers. English glosses chosen to match what a beginner
would see in a textbook, not the most literal possible translation.

Coverage targets:
  - ~25 function words / particles / prepositions / conjunctions
  - ~12 high-frequency `biti` and `hteti` auxiliary forms (taught early
    because learners read "ja sam" before they understand the paradigm)
  - ~8 lemma-form verbs (imati, moći, znati, ići...) for Phase 3 conjugation drills
  - ~15 pronouns
  - ~10 question / place adverbs
  - ~10 common nouns (with full case_forms)
  - ~5 adjectives
  - ~5 social interjections

If you change this file, re-run `python -m balkanski_pipeline` and verify
`pnpm validate-content` still passes.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

PartOfSpeech = Literal[
    "noun", "verb", "adjective", "adverb", "preposition", "pronoun",
    "conjunction", "interjection", "numeral", "phrase",
]


@dataclass(frozen=True)
class SeedEntry:
    latin: str
    english_lemma: str
    english_translation: str
    pos: PartOfSpeech
    topic_tags: tuple[str, ...] = ()
    sense_disambiguator: str | None = None
    # Case forms for nouns (and optionally adjectives). Keys must match the
    # CaseFormsSchema in src/data/schemas/variant.ts.
    case_forms: dict[str, str] | None = None


SR_TOP100: list[SeedEntry] = [
    # ─── Function words: particles, conjunctions, prepositions ───────────────
    SeedEntry("da", "yes", "yes; that (complementizer)", "particle", ("function-word",)),
    SeedEntry("ne", "not", "not; no", "adverb", ("function-word",), "negation"),
    SeedEntry("se", "oneself", "(reflexive particle)", "pronoun", ("function-word",), "reflexive"),
    SeedEntry("i", "and", "and", "conjunction", ("function-word",)),
    SeedEntry("u", "in", "in; into", "preposition", ("function-word",)),
    SeedEntry("na", "on", "on; at; to", "preposition", ("function-word",)),
    SeedEntry("za", "for", "for; in order to", "preposition", ("function-word",)),
    SeedEntry("li", "Q-particle", "(question particle)", "particle", ("function-word",)),
    SeedEntry("sa", "with", "with", "preposition", ("function-word",)),
    SeedEntry("od", "from", "from; of", "preposition", ("function-word",)),
    SeedEntry("a", "but", "and; but (mild)", "conjunction", ("function-word",)),
    SeedEntry("ali", "but", "but", "conjunction", ("function-word",)),
    SeedEntry("ako", "if", "if", "conjunction", ("function-word",)),
    SeedEntry("ili", "or", "or", "conjunction", ("function-word",)),
    SeedEntry("iz", "out of", "out of; from", "preposition", ("function-word",)),
    SeedEntry("o", "about", "about; of", "preposition", ("function-word",)),
    SeedEntry("do", "until", "until; up to", "preposition", ("function-word",)),
    SeedEntry("zbog", "because of", "because of; due to", "preposition", ("function-word",)),
    SeedEntry("kao", "like", "like; as", "preposition", ("function-word",)),
    SeedEntry("pa", "well", "well; so; then", "particle", ("function-word",)),
    SeedEntry("ni", "neither", "neither; not even", "conjunction", ("function-word",)),
    SeedEntry("jer", "because", "because", "conjunction", ("function-word",)),
    SeedEntry("po", "along", "along; per; according to", "preposition", ("function-word",)),
    SeedEntry("s", "with", "with (short form)", "preposition", ("function-word",), "short-form"),
    SeedEntry("ga", "him/it", "him; it (acc.)", "pronoun", ("function-word",), "3sg-m-n-acc"),

    # ─── Pronouns ────────────────────────────────────────────────────────────
    SeedEntry("ja", "I", "I", "pronoun", ("pronoun",)),
    SeedEntry("ti", "you", "you (singular, informal)", "pronoun", ("pronoun",)),
    SeedEntry("on", "he", "he", "pronoun", ("pronoun",)),
    SeedEntry("ona", "she", "she", "pronoun", ("pronoun",)),
    SeedEntry("mi", "we", "we", "pronoun", ("pronoun",)),
    SeedEntry("vi", "you (pl)", "you (plural / formal)", "pronoun", ("pronoun",)),
    SeedEntry("ovo", "this", "this (here)", "pronoun", ("pronoun",), "neut-near"),
    SeedEntry("to", "that", "that; it", "pronoun", ("pronoun",), "neut-mid"),
    SeedEntry("ono", "that", "that (over there)", "pronoun", ("pronoun",), "neut-far"),
    SeedEntry("me", "me", "me (acc.)", "pronoun", ("pronoun",), "1sg-acc-clitic"),
    SeedEntry("te", "you", "you (acc.)", "pronoun", ("pronoun",), "2sg-acc-clitic"),
    SeedEntry("ko", "who", "who", "pronoun", ("question-word",)),
    SeedEntry("šta", "what", "what", "pronoun", ("question-word",)),
    SeedEntry("što", "what", "what; that (relative)", "pronoun", ("question-word",), "relative"),
    SeedEntry("koji", "which", "which; who (relative)", "pronoun", ("question-word",)),
    SeedEntry("sve", "all", "everything; all", "pronoun", ("pronoun",), "neut"),
    SeedEntry("ništa", "nothing", "nothing", "pronoun", ("pronoun",)),
    SeedEntry("nešto", "something", "something", "pronoun", ("pronoun",)),

    # ─── Biti / hteti family (high-frequency inflected forms) ────────────────
    SeedEntry("biti", "to be", "to be", "verb", ("aux-verb",), "infinitive"),
    SeedEntry("sam", "am", "I am", "verb", ("aux-verb",), "biti-1sg"),
    SeedEntry("si", "are", "you are (sg.)", "verb", ("aux-verb",), "biti-2sg"),
    SeedEntry("je", "is", "is (3sg.)", "verb", ("aux-verb",), "biti-3sg"),
    SeedEntry("smo", "are", "we are", "verb", ("aux-verb",), "biti-1pl"),
    SeedEntry("ste", "are", "you are (pl.)", "verb", ("aux-verb",), "biti-2pl"),
    SeedEntry("su", "are", "they are", "verb", ("aux-verb",), "biti-3pl"),
    SeedEntry("nije", "is not", "is not (3sg.)", "verb", ("aux-verb",), "biti-neg-3sg"),
    SeedEntry("nisam", "am not", "I am not", "verb", ("aux-verb",), "biti-neg-1sg"),
    SeedEntry("bio", "was", "was (m. past)", "verb", ("aux-verb",), "biti-m-past"),
    SeedEntry("bila", "was", "was (f. past)", "verb", ("aux-verb",), "biti-f-past"),
    SeedEntry("bilo", "was", "was (n. past)", "verb", ("aux-verb",), "biti-n-past"),
    SeedEntry("bi", "would", "would (conditional)", "verb", ("aux-verb",), "cond-3"),
    SeedEntry("bih", "would", "I would (cond. 1sg.)", "verb", ("aux-verb",), "cond-1sg"),
    SeedEntry("ću", "will", "will (1sg.)", "verb", ("aux-verb",), "hteti-fut-1sg"),
    SeedEntry("ćeš", "will", "will (2sg.)", "verb", ("aux-verb",), "hteti-fut-2sg"),
    SeedEntry("će", "will", "will (3sg./3pl.)", "verb", ("aux-verb",), "hteti-fut-3"),
    SeedEntry("ćemo", "will", "will (1pl.)", "verb", ("aux-verb",), "hteti-fut-1pl"),

    # ─── Verb lemmas + high-freq forms ───────────────────────────────────────
    SeedEntry("imati", "to have", "to have", "verb", ("verb",), "infinitive"),
    SeedEntry("ima", "has", "has (3sg.); there is", "verb", ("verb",), "imati-3sg"),
    SeedEntry("imam", "I have", "I have", "verb", ("verb",), "imati-1sg"),
    SeedEntry("nema", "doesn't have", "there isn't; doesn't have", "verb", ("verb",), "imati-neg-3sg"),
    SeedEntry("moći", "to be able to", "to be able to; can", "verb", ("verb",), "infinitive"),
    SeedEntry("mogu", "I can", "I can", "verb", ("verb",), "moći-1sg"),
    SeedEntry("može", "can", "can (3sg.); it's possible", "verb", ("verb",), "moći-3sg"),
    SeedEntry("možeš", "you can", "you can (sg.)", "verb", ("verb",), "moći-2sg"),
    SeedEntry("znati", "to know", "to know", "verb", ("verb",), "infinitive"),
    SeedEntry("znam", "I know", "I know", "verb", ("verb",), "znati-1sg"),
    SeedEntry("znaš", "you know", "you know (sg.)", "verb", ("verb",), "znati-2sg"),
    SeedEntry("misliti", "to think", "to think", "verb", ("verb",), "infinitive"),
    SeedEntry("mislim", "I think", "I think", "verb", ("verb",), "misliti-1sg"),
    SeedEntry("želeti", "to want", "to want; to wish", "verb", ("verb",), "infinitive"),
    SeedEntry("želim", "I want", "I want", "verb", ("verb",), "želeti-1sg"),
    SeedEntry("ići", "to go", "to go", "verb", ("verb",), "infinitive"),
    SeedEntry("idemo", "let's go", "let's go; we are going", "verb", ("verb",), "ići-1pl"),
    SeedEntry("treba", "needs", "needs; one should", "verb", ("verb",), "impersonal"),
    SeedEntry("rekao", "said", "said (m. past)", "verb", ("verb",), "reći-m-past"),
    SeedEntry("hajde", "come on", "come on; let's go", "interjection", ("interjection",)),

    # ─── Adverbs (question + place + degree) ─────────────────────────────────
    SeedEntry("kako", "how", "how", "adverb", ("question-word",)),
    SeedEntry("zašto", "why", "why", "adverb", ("question-word",)),
    SeedEntry("gde", "where", "where", "adverb", ("question-word",)),
    SeedEntry("kad", "when", "when", "adverb", ("question-word",)),
    SeedEntry("kada", "when", "when (long form)", "adverb", ("question-word",), "long-form"),
    SeedEntry("koliko", "how much", "how much; how many", "adverb", ("question-word",)),
    SeedEntry("ovde", "here", "here", "adverb", ("place-adverb",)),
    SeedEntry("tamo", "there", "there", "adverb", ("place-adverb",)),
    SeedEntry("tu", "here", "right here", "adverb", ("place-adverb",), "near"),
    SeedEntry("sad", "now", "now", "adverb", ("time-adverb",)),
    SeedEntry("sada", "now", "now (long form)", "adverb", ("time-adverb",), "long-form"),
    SeedEntry("onda", "then", "then", "adverb", ("time-adverb",)),
    SeedEntry("samo", "only", "only; just", "adverb", ("function-word",)),
    SeedEntry("još", "still", "still; yet", "adverb", ("function-word",)),
    SeedEntry("više", "more", "more; no longer (negated)", "adverb", ("function-word",)),
    SeedEntry("malo", "a little", "a little; few", "adverb", ("function-word",)),
    SeedEntry("možda", "maybe", "maybe; perhaps", "adverb", ("function-word",)),
    SeedEntry("tako", "so", "so; thus", "adverb", ("function-word",)),
    SeedEntry("dobro", "well", "well; fine", "adverb", ("function-word",), "adverb-sense"),
    SeedEntry("baš", "really", "really; just", "adverb", ("function-word",)),

    # ─── Adjectives ──────────────────────────────────────────────────────────
    SeedEntry("dobar", "good", "good (m.)", "adjective", ("appearance",)),
    SeedEntry("lep", "pretty", "pretty; beautiful (m.)", "adjective", ("appearance",)),
    SeedEntry("veliki", "big", "big (m.)", "adjective", ("size",)),
    SeedEntry("mali", "small", "small (m.)", "adjective", ("size",)),
    SeedEntry("nov", "new", "new (m.)", "adjective", ("quality",)),

    # ─── Common nouns (with case_forms for declension drills) ────────────────
    SeedEntry(
        "voda", "water", "water", "noun", ("food", "everyday"),
        case_forms={
            "nom": "voda", "gen": "vode", "dat": "vodi", "acc": "vodu",
            "voc": "vodo", "ins": "vodom", "loc": "vodi",
            "nomPl": "vode", "genPl": "voda", "datPl": "vodama", "accPl": "vode",
            "vocPl": "vode", "insPl": "vodama", "locPl": "vodama",
        },
    ),
    SeedEntry(
        "hleb", "bread", "bread", "noun", ("food", "everyday"),
        case_forms={
            "nom": "hleb", "gen": "hleba", "dat": "hlebu", "acc": "hleb",
            "voc": "hlebe", "ins": "hlebom", "loc": "hlebu",
            "nomPl": "hlebovi", "genPl": "hlebova", "datPl": "hlebovima",
            "accPl": "hlebove", "vocPl": "hlebovi", "insPl": "hlebovima",
            "locPl": "hlebovima",
        },
    ),
    SeedEntry(
        "čovek", "man", "man; person", "noun", ("people",),
        case_forms={
            "nom": "čovek", "gen": "čoveka", "dat": "čoveku", "acc": "čoveka",
            "voc": "čoveče", "ins": "čovekom", "loc": "čoveku",
            "nomPl": "ljudi", "genPl": "ljudi", "datPl": "ljudima",
            "accPl": "ljude", "vocPl": "ljudi", "insPl": "ljudima",
            "locPl": "ljudima",
        },
    ),
    SeedEntry(
        "žena", "woman", "woman", "noun", ("people",),
        case_forms={
            "nom": "žena", "gen": "žene", "dat": "ženi", "acc": "ženu",
            "voc": "ženo", "ins": "ženom", "loc": "ženi",
            "nomPl": "žene", "genPl": "žena", "datPl": "ženama",
            "accPl": "žene", "vocPl": "žene", "insPl": "ženama",
            "locPl": "ženama",
        },
    ),
    SeedEntry(
        "dete", "child", "child", "noun", ("family", "people"),
        case_forms={
            "nom": "dete", "gen": "deteta", "dat": "detetu", "acc": "dete",
            "voc": "dete", "ins": "detetom", "loc": "detetu",
            "nomPl": "deca", "genPl": "dece", "datPl": "deci",
            "accPl": "decu", "vocPl": "deco", "insPl": "decom",
            "locPl": "deci",
        },
    ),
    SeedEntry(
        "kuća", "house", "house; home", "noun", ("places", "everyday"),
        case_forms={
            "nom": "kuća", "gen": "kuće", "dat": "kući", "acc": "kuću",
            "voc": "kućo", "ins": "kućom", "loc": "kući",
            "nomPl": "kuće", "genPl": "kuća", "datPl": "kućama",
            "accPl": "kuće", "vocPl": "kuće", "insPl": "kućama",
            "locPl": "kućama",
        },
    ),
    SeedEntry(
        "dan", "day", "day", "noun", ("time",),
        case_forms={
            "nom": "dan", "gen": "dana", "dat": "danu", "acc": "dan",
            "voc": "dane", "ins": "danom", "loc": "danu",
            "nomPl": "dani", "genPl": "dana", "datPl": "danima",
            "accPl": "dane", "vocPl": "dani", "insPl": "danima",
            "locPl": "danima",
        },
    ),
    SeedEntry(
        "noć", "night", "night", "noun", ("time",),
        case_forms={
            "nom": "noć", "gen": "noći", "dat": "noći", "acc": "noć",
            "voc": "noći", "ins": "noći", "loc": "noći",
            "nomPl": "noći", "genPl": "noći", "datPl": "noćima",
            "accPl": "noći", "vocPl": "noći", "insPl": "noćima",
            "locPl": "noćima",
        },
    ),
    SeedEntry(
        "reč", "word", "word", "noun", ("language",),
        case_forms={
            "nom": "reč", "gen": "reči", "dat": "reči", "acc": "reč",
            "voc": "reči", "ins": "reči", "loc": "reči",
            "nomPl": "reči", "genPl": "reči", "datPl": "rečima",
            "accPl": "reči", "vocPl": "reči", "insPl": "rečima",
            "locPl": "rečima",
        },
    ),
    SeedEntry(
        "prijatelj", "friend", "friend (m.)", "noun", ("people",),
        case_forms={
            "nom": "prijatelj", "gen": "prijatelja", "dat": "prijatelju",
            "acc": "prijatelja", "voc": "prijatelju", "ins": "prijateljem",
            "loc": "prijatelju",
            "nomPl": "prijatelji", "genPl": "prijatelja", "datPl": "prijateljima",
            "accPl": "prijatelje", "vocPl": "prijatelji", "insPl": "prijateljima",
            "locPl": "prijateljima",
        },
    ),

    # ─── Greetings & social interjections ────────────────────────────────────
    SeedEntry("hvala", "thank you", "thank you", "interjection", ("greeting",)),
    SeedEntry("molim", "please", "please; you're welcome", "interjection", ("greeting",)),
    SeedEntry("hej", "hey", "hey", "interjection", ("greeting",)),
    SeedEntry("zdravo", "hello", "hello (informal)", "interjection", ("greeting",)),
    SeedEntry("doviđenja", "goodbye", "goodbye", "interjection", ("greeting",)),
]


# Sanity check: catch dupes & POS typos at import time, not at runtime.
def _validate_seed() -> None:
    seen: set[str] = set()
    valid_pos = {
        "noun", "verb", "adjective", "adverb", "preposition", "pronoun",
        "conjunction", "interjection", "numeral", "phrase", "particle",
    }
    for entry in SR_TOP100:
        key = (entry.latin, entry.sense_disambiguator)
        if key in seen:
            raise ValueError(f"duplicate seed entry: {key}")
        seen.add(key)
        # The pipeline maps `particle` → `interjection` at build time since the
        # zod PartOfSpeechSchema doesn't list it separately. Accept both here.
        if entry.pos not in valid_pos:
            raise ValueError(f"bad POS for {entry.latin}: {entry.pos}")


_validate_seed()
