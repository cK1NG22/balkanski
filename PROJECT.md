# balkanski

**Status:** Active development (Phase 2 — see `ROADMAP.md`)
**Task Type:** product
**Created:** 2026-05-23
**Last updated:** 2026-05-27

## Summary

Mobile language-learning app for **Croatian, Serbian, and Bosnian** — built for Carter and his wife (personal use). Treated as three distinct languages, not variants of one; regional dialects (Dalmatinski, Beogradski, …) are first-class metadata. Curriculum is **linear Pareto-ordered** (lessons unlock in strict word-frequency order), with an SRS review layer on top. Audio is deferred to Phase 5+.

## Code path

`/Users/carterking/Projects/Personal/balkanski/`

## Stack

Expo SDK 56 + expo-router + NativeWind v4 + TypeScript.

## Key docs (load order for a new session)

1. `CLARIFICATIONS.md` — locked decisions (data model, curriculum, grading, auth, deferred items). **Authoritative.**
2. `AGENTS.md` — stack rules, conventions, mock-conversion contract.
3. `ROADMAP.md` — phased plan (9 phases, layer-tagged).
4. `FEATURES.md` — architectural layers (Engine / Lesson Content / Theme-World / UI Localization).

## Memory

See `.claude/memory/INDEX.md`.
