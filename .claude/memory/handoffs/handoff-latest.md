---
project: balkanski
task: balkanski
session_ended: 2026-05-25T16:30:00Z
cwd: /Users/carterking/Projects/Personal/balkanski
git_branch: main
git_sha: 8ff7947
shape: project-container
---

# Handoff — balkanski

## Next Action

Wire the `produce` lesson direction into `src/app/(modal)/lesson-active.tsx` so a typed Serbian answer rendering as `tier === 'close'` shows the `correction` string inline — closes the ROADMAP Phase 1 Done-when criterion "close answers show correction inline."

## Pointers

- **ROADMAP criterion**: `ROADMAP.md` → Phase 1 Done-when block ("close answers show correction inline")
- **Audit finding (full scope + design notes)**: `.claude/memory/todo.md` → "Phase 1 polish — scope decision needed" section
- **Task memory entry point**: `.claude/memory/INDEX.md`
- **Stack rules + conventions**: `AGENTS.md`
- **Spec authority**: `CLARIFICATIONS.md`
- **Existing grading lib**: `src/lib/grading/tiered.ts` (already returns `correction` for close/wrong tiers; 21 unit tests in `tests/lib/grading/`)
- **Existing shell**: `src/components/learning/FillInBlankInput.tsx` (currently only referenced from `(debug)/components.tsx` — wire it into production here)
- **Hook to flex**: `src/hooks/use-pareto-lesson.ts` — `const DIRECTION = 'recognize' as const` hardcoded
- **Lesson screen to extend**: `src/app/(modal)/lesson-active.tsx` (don't change the recognize path; add a sibling produce path)
- **Persist path**: `src/lib/srs/persist.ts:gradeAndPersistVariant` accepts any `ReviewDirection`; `('user_id', 'variant_id', 'direction')` UNIQUE means produce + recognize are separately tracked FSRS items for the same variant — that's intended.
- **Schema**: `src/data/schemas/review-item.ts` already has `'produce'` in the `ReviewDirection` enum

## Decisions This Session

- **Pipeline dedup landed**: `content-pipeline/balkanski_pipeline/build.py:_dedupe_concepts` collapses concept rows sharing a UUIDv5 (e.g. "a" + "ali" → one "but" concept with two SR variants). Regenerated `content/vocab/sr-starter.json` (120 concepts / 121 variants). Seeder's defensive dedup kept as defence-in-depth. Commit `8ff7947`.
- **Rebind extension + unmark deletion propagation shipped** last session (commits `a7409fc`, `210c41e`). Rebind now pushes both `review_items` and `known_variants`; unmark path issues local + best-effort remote DELETE when a session matches. Memory + todo updated, no Phase 1D follow-ups outstanding on those two items.
- **0004 migration deployed** to `khbwshwghilupemmvloq` (Carter ran `pnpm exec supabase db push` 2026-05-25). Remote probed: `known_variants` table exists, `placement_test_results` dropped, `users.proficiency_estimate` dropped.
- **All four origin/main commits pushed** through `8ff7947`.

## In-Flight Work

- **None.** Clean checkpoint at `8ff7947`. Working tree was committed + pushed before handoff.

## Open Questions / Blockers

- **iOS smoke test still pending Xcode install** — installation is in progress (per Carter's "C while xcode installs" framing this session). The produce-direction work itself is type-checked + unit-testable without an iOS sim, but the full Phase 1 Done-when gate needs both this produce work AND the simulator pass.
- **Optional UX call inside produce path**: when `tier === 'close'` and `missedDiacritics` is non-empty, do you want the correction to underline the specific characters (richer feedback) or just render plain `"Almost — correct spelling is ‘<correction>’"` (faster to ship)? Default to the simpler form unless Carter asks; the rich form is a polish pass.

## DO NOT in this handoff

- Don't change the recognize flow's UI/UX — only add the produce path alongside it.
- Don't introduce a Cyrillic keyboard mode (that's Phase 2 with the script toggle).
- Don't refactor `FillInBlankInput` unless something blocks integration — keep deltas tight.
- Don't claim Phase 1 done without the iOS smoke test actually passing.
- Don't widen the lesson runner to handle `audio_recognize` or `script_convert` — those are Phase 5+.
