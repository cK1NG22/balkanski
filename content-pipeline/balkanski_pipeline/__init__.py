"""Balkanski content pipeline.

Produces frequency-ranked, gloss-enriched, schema-validated JSON vocab files
that the React Native app consumes via `src/data/loader.ts`.
"""

__all__ = ["build", "models", "cyrillic"]
