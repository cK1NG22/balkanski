# balkanski memory index

Mobile language-learning app for Croatian, Serbian, Bosnian. Personal use (Carter + wife). Expo SDK 56 + expo-router + NativeWind v4 + TypeScript.

## Load order for a new session

1. **`CLARIFICATIONS.md`** (repo root) — locked decisions: data model, curriculum, grading, auth, deferred items. Authoritative.
2. **`AGENTS.md`** (repo root) — stack rules, conventions, mock-conversion contract.
3. **`.claude/memory/progress-log.md`** — most recent session(s).
4. **`.claude/memory/decisions.md`** — accumulated architectural decisions.
5. **`.claude/memory/todo.md`** — open work.
6. **`ROADMAP.md`** — phased plan.

## Reference files

- `docs/conversion-cheatsheet.md` — HTML → RN reference (read on every Stitch mock conversion).
- `docs/workflow-recipe.md` — Carter ↔ Claude handoff steps.
- `docs/decisions/` — ADRs.
- `tailwind.config.ts` — brand tokens.
- `src/components/index.ts` — shell barrel.
- `src/data/schemas/index.ts` — typed contracts.

## Hook-guarded paths (Carter's global `guard-sharp-edges.sh`)

- `/auth/` — requires manual approval before writing
- `/migrations/` — requires manual approval before writing
- `/payments/` — requires manual approval before writing

Phase 0 worked around this by inlining auth helpers in `src/providers/AuthProvider.tsx` and deferring the SQL migration.

## Active context

Phase 0 — scaffold complete. See `ROADMAP.md` for next phases.
