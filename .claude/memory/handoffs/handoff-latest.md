---
project: balkanski
task: balkanski
session_ended: 2026-05-24T23:30:00Z
cwd: /Users/carterking/Projects/Personal/balkanski
git_branch: main
git_sha: f75c79d (uncommitted)
shape: project-container
---

# Handoff — balkanski

## Next Action

**Carter: run `pnpm exec supabase db push`** to land `supabase/migrations/0004_known_variants.sql` on `khbwshwghilupemmvloq`. The auto-mode classifier gated this from Claude because it drops a table (`placement_test_results`) and a column (`users.proficiency_estimate`) on a production-ish DB — your hand on the trigger is the safety gate. After that: extend the rebind-on-sign-in path to push `known_variants` rows too (currently only `review_items` flows through `rebind-io.ts`).

## Pointers

- **Authoritative ADR**: `docs/decisions/0002-known-words-vs-placement-test.md`
- **Migration to deploy**: `supabase/migrations/0004_known_variants.sql`
- Implementation surface (this session): `src/lib/known-variants/`, `src/components/learning/{KnownWordRow,BulkMarkButton}.tsx`, `src/app/(modal)/known-words.tsx`, `src/app/(auth)/onboarding.tsx`, `src/lib/srs/sqlite.ts`, `src/lib/pareto/sequencer.ts`
- Rebind pattern to extend: `src/lib/sync/rebind.ts` + `rebind-io.ts` (mirror the same shape for `known_variants`)
- Task memory entry point: `.claude/memory/INDEX.md`
- Open work: `.claude/memory/todo.md` (Phase 1C open section + Phase 1D follow-ups)

## Decisions This Session

- **0004 migration shape**: `known_variants(user_id, variant_id, marked_at)` with composite PK; 3 RLS policies (select/insert/delete — no UPDATE because the model is delete-then-reinsert); `ON DELETE CASCADE` on user_id, `ON DELETE RESTRICT` on variant_id; drops `placement_test_results` + `users.proficiency_estimate`.
- **Sequencer takes two named skip-sets**: `knownVariantIds` (the SRS seen-set) + optional `markedKnownVariantIds`, unioned internally via `buildSkipSet`. Renamed `getAllKnownVariantIds` → `getSeenVariantIds` to remove ambiguity. Deleted dead `startingRankForProficiency`.
- **Supabase upsert uses `ignoreDuplicates: true`** for known_variants — PostgREST issues `ON CONFLICT DO NOTHING` which doesn't require an UPDATE RLS policy, matching the ADR's mutation model.
- **Sync is additive-only**: deletions don't propagate through `syncKnownVariants`. Documented as a Phase 1D boundary inside `sync.ts`; latent today because no bidirectional sync caller exists.
- **Onboarding navigates with one `router.replace`** carrying `?from=onboarding`; the modal's Done handler branches on the param. Replaces the chained replace+push that Gemini correctly flagged as a race.
- **`KnownWordRow` accessibility**: one outer `Pressable` wraps the checkbox + word + gloss with `accessibilityRole="checkbox"`, `accessibilityState={{checked}}`, and a composed `accessibilityLabel`. Bulk-mark stays a separate, smaller pressable.
- **Dual review**: Gemini surfaced 4 real defects (RLS upsert, zombie marks, split-focus a11y, router race) — all addressed in-session. Codex `exec review --uncommitted` was kicked off after the first `codex review --uncommitted` form hung in interactive mode; see the brtwcrig4/bf8i53a6s output files for what landed.

## In-Flight Work

- **Uncommitted working tree**. The whole session sits on a single hot-edit pass; verified clean (`pnpm tsc --noEmit` ✓, `pnpm test` 67/67 ✓, `pnpm stress-test` ✓) but **not yet committed** because the codex `exec review --uncommitted` was completing right at session end. Once codex's output is reviewed for any final fixes, commit and push.
- **Remote 0004 push pending Carter** (see Next Action).

## Open Questions / Blockers

- **Xcode install still needed** for any iOS smoke test. Known Words is code-verified + unit-tested only.
- **Phase 1D — known_variants delete propagation**: when bidirectional sync wires up, the unmark code path (`unmarkVariantKnown` in `src/lib/srs/sqlite.ts`) will need a remote `DELETE` alongside the local one. Tracked in todo.md.
- **Phase 1D — push known_variants in rebind**: `src/lib/sync/rebind.ts` only pushes `review_items` today. After the migration lands, extend the rebind to push `known_variants` too (one-way local → remote), so words marked during onboarding (pre-sign-in) flow upstream on first sign-in.

## DO NOT in this handoff

- Don't run `supabase db push` for the user — auto-mode gates this, and the user explicitly wants to drive the destructive remote drop themselves.
- Don't claim the iOS flow works end-to-end until the smoke test actually runs.
- Don't change `known_variants` RLS to allow UPDATE — the data model is delete-then-reinsert by design; UPDATE would only widen the attack surface.
- Don't restore `placement-test.tsx` or `proficiency_estimate` — ADR 0002 supersedes both.
