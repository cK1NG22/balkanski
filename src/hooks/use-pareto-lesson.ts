// useParetoLesson — surface the next un-known Serbian variant from the
// Pareto-ordered seed, plus a grade callback that delegates persistence to
// `gradeAndPersistVariant` and ticks the streak.
//
// Phase 1A scope: SR only. Direction defaults to `'recognize'`; `'produce'`
// shares the same selection logic — the UNIQUE (user, variant, direction) on
// `review_items` keeps the two FSRS schedules independent for the same word.

import { useCallback, useMemo, useState } from 'react';

import { loadStarterVocab, type LoadedVocab } from '@/data/loader';
import type { Concept } from '@/data/schemas/concept';
import type { GradingTier } from '@/data/schemas/grading';
import type { ReviewDirection } from '@/data/schemas/review-item';
import type { Variant } from '@/data/schemas/variant';
import { getLocalLearnerId } from '@/lib/learner-id';
import { selectNextVariant } from '@/lib/pareto/sequencer';
import { gradeAndPersistVariant } from '@/lib/srs/persist';
import { getMarkedKnownVariantIds, getSeenVariantIds } from '@/lib/srs/sqlite';
import { tickStreak } from '@/lib/streak';

export type LessonDirection = Extract<ReviewDirection, 'recognize' | 'produce'>;

export interface UseParetoLesson {
  vocab: LoadedVocab;
  /** All variantIds the user has graded at least once. */
  known: ReadonlySet<string>;
  knownCount: number;
  nextVariant: Variant | null;
  nextConcept: Concept | null;
  grade: (tier: GradingTier) => void;
}

export function useParetoLesson(direction: LessonDirection = 'recognize'): UseParetoLesson {
  const [vocab] = useState<LoadedVocab>(() => loadStarterVocab('sr'));
  const userId = useMemo(getLocalLearnerId, []);

  const [known, setKnown] = useState<Set<string>>(() => safeReadKnown(userId, direction));

  const conceptById = useMemo(() => {
    const m = new Map<string, Concept>();
    for (const c of vocab.concepts) m.set(c.id, c);
    return m;
  }, [vocab.concepts]);

  const nextVariant = useMemo(
    () =>
      selectNextVariant({
        language: vocab.language,
        knownVariantIds: known,
        allVariants: vocab.variants,
      }),
    [vocab, known],
  );

  const nextConcept = nextVariant
    ? conceptById.get(nextVariant.conceptId) ?? null
    : null;

  const grade = useCallback(
    (tier: GradingTier) => {
      if (!nextVariant) return;
      const now = new Date();
      try {
        gradeAndPersistVariant({
          userId,
          variantId: nextVariant.id,
          direction,
          tier,
          now,
        });
      } catch (err) {
        // Storage unavailable (web export, simulator quirk) — keep advancing
        // the in-memory known-set so the lesson doesn't deadlock. The sync
        // layer will reconcile next launch.
        if (__DEV__) console.warn('[useParetoLesson] persist failed', err);
      }
      setKnown((prev) => {
        const next = new Set(prev);
        next.add(nextVariant.id);
        return next;
      });
      try {
        tickStreak(now);
      } catch (err) {
        if (__DEV__) console.warn('[useParetoLesson] streak tick failed', err);
      }
    },
    [nextVariant, userId, direction],
  );

  return {
    vocab,
    known,
    knownCount: known.size,
    nextVariant,
    nextConcept,
    grade,
  };
}

function safeReadKnown(userId: string, direction: LessonDirection): Set<string> {
  // Sequencer's skip-set = (variants seen in *this* direction's SRS) ∪
  // (variants user marked known). Seen-set is direction-scoped so a word
  // graded in recognize doesn't hide from produce (and vice versa). Marks
  // stay direction-independent — "I know this word" means both directions.
  // Either source is fail-soft; if SQLite isn't available the lesson loop
  // still progresses, it just won't honor self-marks until next launch.
  try {
    const seen = getSeenVariantIds(userId, direction);
    const marked = getMarkedKnownVariantIds(userId);
    return new Set([...seen, ...marked]);
  } catch {
    return new Set();
  }
}
