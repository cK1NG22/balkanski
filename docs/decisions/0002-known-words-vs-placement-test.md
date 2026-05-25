# ADR 0002 — Self-marked Known Words replaces the Placement Test

**Date**: 2026-05-24
**Status**: Accepted
**Supersedes**: CLARIFICATIONS.md §1.5 ("Placement test required"), ROADMAP.md Phase 1 placement-test items

## Context

The original Phase 1 plan included a mandatory mixed placement test (5 vocab + 5 grammar, 2 min) writing a single `proficiency_estimate` number to `users.proficiency_estimate`. The Pareto sequencer would then reverse-map that number to a starting `frequency_rank_in_lang` and serve lessons from there forward.

While designing the test in this session, Carter proposed an alternative: skip the discrete test entirely, and instead let users *self-mark* which words they already know from the frequency-ranked variant list. The marking lives in Settings (so users can revisit, not just at first launch), with a one-time onboarding nudge that offers "Mark words I already know" or "Start fresh."

## Decision

Replace the placement test with a self-marked **Known Words** assessment.

### Why this is better

1. **Matches the data model exactly.** The Pareto sequencer reads `variant.frequency_rank_in_lang` and asks "what's the next unseen variant?" A self-marked known-set is the direct input to that question — no proficiency-number → rank reverse-mapping needed. We get per-variant truth instead of a sampled estimate.
2. **Scales to both edges with one UI.** A test breaks down at the edges (cold-start users get 0/5 and feel discouraged; near-fluent users hit a ceiling). Marking lets a beginner mark zero and a fluent user mark hundreds, both in the same screen.
3. **Not a gate.** Users never have to take a test before lessons. The cold-start path is one tap ("Start fresh"). Assessment refines over time as users discover and mark words they already know.
4. **Idempotent and revisable.** A test is a frozen snapshot from minute one. Known-words is a live set the user can keep updating in Settings.
5. **Removes a schema concept.** `placement_test_results` and `users.proficiency_estimate` both go away. Less code, less drift.

### What ships

**Data model (next migration):**
- Add `public.known_variants` — `(user_id uuid, variant_id uuid, marked_at timestamptz, PRIMARY KEY (user_id, variant_id))`, RLS scoped to `user_id = auth.uid()`, FK on variant_id is `ON DELETE RESTRICT` (matches `review_items.variant_id` for the same data-loss reasoning).
- Drop `public.placement_test_results`.
- Drop `users.proficiency_estimate` (no longer load-bearing; UI can derive "you know N words" from a COUNT).

**App-side:**
- New module `src/lib/known-variants/` — local SQLite mirror + remote sync, parallel structure to `src/lib/srs/` and `src/lib/sync/`.
- Pareto sequencer gains a `knownSet: Set<string>` filter intersected with the existing seen-set.
- New screen `src/app/(modal)/known-words.tsx`: scrollable frequency-ranked list with checkboxes and a "**I know everything up to here**" bulk-mark button on each row.
- Settings entry: "Manage known words" → opens the same modal.
- `src/app/(auth)/onboarding.tsx` (already a stub) becomes the post-sign-in nudge: two buttons, "Start fresh" / "Mark words I already know". Either sets `onboardingComplete=true` and redirects to tabs; the mark path opens the editor first.
- **Delete** `src/app/(auth)/placement-test.tsx`.

### UI metaphor for marking

Checkbox list with bulk-mark shortcut (selected over Tinder-style swipe and search-only). Familiar, no learning curve, fluent-user path is one tap.

### Grammar diagnostics

**Deferred.** Phase 1 has no dedicated grammar lessons — grammatical particles surface through the Pareto vocab list as they appear in real text. Revisit when Phase 2/3 introduces explicit case-system lessons; the most likely shape there is the same self-marked pattern ("I know nominative / I know genitive / …") rather than a graded test.

## Consequences

**Positive**
- Schema simpler by two columns and one table.
- No "what's a fair test?" content-authoring problem.
- Onboarding friction drops to one tap for cold-start users.
- Pareto sequencer signal quality goes up (per-variant vs single number).

**Negative**
- The "I know some Serbian" user has to scan a list to mark known words. Mitigated by the bulk-mark shortcut and Settings revisit.
- Migrating users with existing `users.proficiency_estimate` data: not a concern — no production users exist yet.

**Neutral**
- Phase 1 "Done when" criterion updates: "Carter signs in via Google, marks zero-or-more known words, completes a 5-min daily session in Serbian" replaces the placement-test sentence.
