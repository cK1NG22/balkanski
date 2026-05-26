// useReviewQueue — surface the FSRS-due items joined to their concept/variant.

import { useCallback, useMemo, useState } from 'react';

import { loadStarterVocab } from '@/data/loader';
import type { Concept } from '@/data/schemas/concept';
import type { GradingTier } from '@/data/schemas/grading';
import type { ReviewItem } from '@/data/schemas/review-item';
import type { Variant } from '@/data/schemas/variant';
import { getLocalLearnerId } from '@/lib/learner-id';
import { gradeReview } from '@/lib/srs/queue';
import { getDueItems, upsertReviewItem } from '@/lib/srs/sqlite';

export interface ReviewQueueRow {
  item: ReviewItem;
  variant: Variant;
  concept: Concept;
}

export interface UseReviewQueue {
  queue: ReviewQueueRow[];
  grade: (item: ReviewItem, tier: GradingTier) => void;
  refresh: () => void;
}

export function useReviewQueue(): UseReviewQueue {
  const [vocab] = useState(() => loadStarterVocab('sr'));
  const userId = useMemo(getLocalLearnerId, []);

  const variantById = useMemo(() => {
    const m = new Map<string, Variant>();
    for (const v of vocab.variants) m.set(v.id, v);
    return m;
  }, [vocab.variants]);

  const conceptById = useMemo(() => {
    const m = new Map<string, Concept>();
    for (const c of vocab.concepts) m.set(c.id, c);
    return m;
  }, [vocab.concepts]);

  const [due, setDue] = useState<ReviewItem[]>(() => safeRead(userId));

  const refresh = useCallback(() => {
    setDue(safeRead(userId));
  }, [userId]);

  const grade = useCallback(
    (item: ReviewItem, tier: GradingTier) => {
      const now = new Date();
      const updated = gradeReview(item, tier, now);
      let persisted = false;
      try {
        upsertReviewItem(updated);
        persisted = true;
      } catch (err) {
        if (__DEV__) console.warn('[useReviewQueue] persist failed', err);
      }
      if (!persisted) {
        // Don't advance the UI if the DB couldn't accept the update — the user
        // would otherwise lose the card and re-see it as a "ghost" next launch.
        return;
      }
      setDue((prev) => {
        const remaining = prev.filter((i) => i.id !== item.id);
        // FSRS often schedules a 'wrong' or 'close' card just a few minutes
        // out (Learning state). Re-queue it in this session so the learner
        // doesn't have to bounce out and back in to see it again.
        if (new Date(updated.dueAt).getTime() <= now.getTime()) {
          return [...remaining, updated];
        }
        return remaining;
      });
    },
    [],
  );

  const queue = useMemo<ReviewQueueRow[]>(() => {
    return due.flatMap((item) => {
      const variant = variantById.get(item.variantId);
      if (!variant) return [];
      const concept = conceptById.get(variant.conceptId);
      if (!concept) return [];
      return [{ item, variant, concept }];
    });
  }, [due, variantById, conceptById]);

  return { queue, grade, refresh };
}

function safeRead(userId: string): ReviewItem[] {
  // Hard-scope to recognize until the review UI branches per direction.
  // Produce items still get FSRS-scheduled by the lesson runner, but
  // surfacing them here would render a typing card as a Serbian→English
  // flashcard and silently advance the wrong schedule on self-grade.
  try {
    return getDueItems(userId, { direction: 'recognize' });
  } catch {
    return [];
  }
}
