// Higher-level "grade this variant and write it everywhere it belongs" helper.
//
// Lives outside the React hook so the persistence chain — read existing item
// (or mint a new one) → run FSRS → upsert SQLite — is testable without React
// and reusable by future review flows.

import type { GradingTier } from '@/data/schemas/grading';
import type { ReviewDirection, ReviewItem } from '@/data/schemas/review-item';

import { createNewReviewItem, gradeReview } from './queue';
import { getReviewItem, upsertReviewItem } from './sqlite';

export interface GradeVariantInput {
  userId: string;
  variantId: string;
  direction: ReviewDirection;
  tier: GradingTier;
  now?: Date;
}

/**
 * Apply a tier to a variant: load (or create) the review item, run it through
 * FSRS, persist the result. Returns the updated item so the caller can use it
 * (e.g. for in-session re-queueing of lapsed cards).
 */
export function gradeAndPersistVariant(input: GradeVariantInput): ReviewItem {
  const now = input.now ?? new Date();
  const existing = getReviewItem(input.userId, input.variantId, input.direction);
  const base =
    existing ??
    createNewReviewItem(input.userId, input.variantId, input.direction, now);
  const updated = gradeReview(base, input.tier, now);
  upsertReviewItem(updated);
  return updated;
}
