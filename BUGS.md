# Bugs

Local bug log for balkanski. **Workflow:** triage on find → fix immediately when safe & quick (the default) → otherwise log here.

- **Severity:** `P0` blocks use · `P1` important · `P2` minor / cosmetic
- **Status:** `open` · `fixing` · `fixed` · `wontfix`
- IDs are sequential (`BUG-001`, …). When a bug is fixed, move it to **Fixed** and note the commit.

---

## Open

### BUG-002 · P2 · Profile tab shows mock/placeholder data instead of real stats
- **Status:** open (deferred — feature work, not a defect)
- **Found:** 2026-05-28 (Maestro QA pass)
- **Screen:** Profile tab — `src/app/(tabs)/profile/index.tsx`
- **Observed:** Entirely hardcoded Stitch-mock content — "Stefan Nemanjic", "Liga Velikana", rank #14, STREAK 12 / WORDS 245 / LEVEL 42, a tennis "Daily Challenge", random "Study Success" bars, "Recent Milestones", "Course Progression".
- **Root cause:** The screen was converted from the Stitch mock and never wired to real state. It's not a regression — it's an unbuilt screen. Some of it (leagues, daily challenges, milestones, course progression) has **no data layer** behind it yet.
- **Recommendation:** Future-phase work. When tackled: wire the 3 stat tiles to real data (streak via `useStreak`, known-word count via `useParetoLesson`, name/avatar via the auth session), and either build or remove the gamification blocks (league/level/rank/challenges/milestones). Needs a product call on which gamification features are real — don't guess a redesign.

---

## Fixed

### BUG-003 · P1 · Learn home didn't refresh after the Known Words editor changed data — FIXED 2026-05-28
- **Screen:** Learn home — `src/app/(tabs)/learn/index.tsx` + `src/hooks/use-pareto-lesson.ts`
- **Root cause:** `useParetoLesson` read the known-set **once** in a `useState` initializer and never re-read it; the Learn home's `useFocusEffect` refreshed streak + script-pref but not the lesson data. So mark/unmark edits only surfaced after a full app relaunch.
- **Fix:** Added a `refresh()` to `useParetoLesson` (re-reads `safeReadKnown`, mirroring `useStreak.refresh`) and call it inside the Learn home's `useFocusEffect`.
- **Verified:** `tsc` + 100/100 tests green; live Maestro repro — un-mark a word → return to Learn home → "Next up: …" now appears with **no relaunch** (previously stayed "Session complete").

### BUG-001 · P2 · "Practice typing" / "Continue Learning" appeared to do nothing — FIXED (via BUG-003) 2026-05-28
- **Reclassified:** Not a "silent no-op." The buttons are `disabled={!nextVariant}` and the screen shows "Session complete for now." They only *stayed* wrongly disabled because the known-set was stale — i.e. this was a **symptom of BUG-003**. Fixing the focus-refresh re-enables them correctly.
- **Minor open note (P2, not fixed):** "Practice typing" is gated on `!nextVariant` (a *new* word existing). Arguably produce-practice should also work on already-known words when no new word is queued. Left as a product decision.

### BUG-004 · — · Typed-answer field "mangles" input (autocorrect) — NOT A BUG (wontfix) 2026-05-28
- **Reclassified:** False positive. `FillInBlankInput.tsx` already sets `autoCapitalize="none"` and `autoCorrect={false}`, so the app does not auto-correct answers. The observed "da" → "dav" was a **test-harness artifact**: Maestro tapped the iOS keyboard's QuickType suggestion bar while aiming at a Check button that was hidden behind the keyboard.
- **Note:** The grader itself behaved correctly — "dav" is genuinely one edit from "da", so *close* + "Correct spelling: da" was right. If the iOS predictive bar is ever observed to interfere during real (non-automated) typing, the next step would be `spellCheck={false}` / a `keyboardType` tweak — but no change was made, since there's no confirmed defect.
