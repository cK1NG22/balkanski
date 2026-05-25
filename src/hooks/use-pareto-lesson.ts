// useParetoLesson — surface the next un-known Serbian variant from the
// Pareto-ordered seed, plus a grade callback that delegates persistence to
// `gradeAndPersistVariant` and ticks the streak.
//
// Phase 1A scope: SR only, recognition direction only. Phase 1C will add
// language selection + Supabase sync.

import { useCallback, useMemo, useState } from 'react';

import { loadStarterVocab, type LoadedVocab } from '@/data/loader';
import type { Concept } from '@/data/schemas/concept';
import type { GradingTier } from '@/data/schemas/grading';
import type { Variant } from '@/data/schemas/variant';
import { getLocalLearnerId } from '@/lib/learner-id';
import { selectNextVariant } from '@/lib/pareto/sequencer';
import { gradeAndPersistVariant } from '@/lib/srs/persist';
import { getMarkedKnownVariantIds, getSeenVariantIds } from '@/lib/srs/sqlite';
import { tickStreak } from '@/lib/streak';

const DIRECTION = 'recognize' as const;

export interface UseParetoLesson {
  vocab: LoadedVocab;
  /** All variantIds the user has graded at least once. */
  known: ReadonlySet<string>;
  knownCount: number;
  nextVariant: Variant | null;
  nextConcept: Concept | null;
  grade: (tier: GradingTier) => void;
}

export function useParetoLesson(): UseParetoLesson {
  const [vocab] = useState<LoadedVocab>(() => loadStarterVocab('sr'));
  const userId = useMemo(getLocalLearnerId, []);

  const [known, setKnown] = useState<Set<string>>(() => safeReadKnown(userId));

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
          direction: DIRECTION,
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
    [nextVariant, userId],
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

function safeReadKnown(userId: string): Set<string> {
  // Sequencer's skip-set = (variants seen in SRS) ∪ (variants user marked known).
  // Either source is a fail-soft read; if SQLite isn't available the lesson
  // loop still progresses, it just won't honor self-marks until next launch.
  try {
    const seen = getSeenVariantIds(userId);
    const marked = getMarkedKnownVariantIds(userId);
    return new Set([...seen, ...marked]);
  } catch {
    return new Set();
  }
}
