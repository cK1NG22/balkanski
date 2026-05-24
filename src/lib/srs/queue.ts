// FSRS scheduler wrapper. Pure functions over our `ReviewItem` shape; no I/O.
//
// Mapping from our tiered grading to FSRS ratings:
//   right → Good   (regular advance)
//   close → Hard   (slightly shorter interval; still counts as a pass)
//   wrong → Again  (lapse; reset to learning)
//
// We never use Rating.Easy — the tier system collapses "right" and "easy"
// into a single state. Learners who feel a card was easy still grade it as
// "right" via the UI; tracking a separate Easy tier didn't earn its weight
// in pedagogy testing during scoping.

import { randomUUID } from 'expo-crypto';
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
} from 'ts-fsrs';

import type { GradingTier } from '@/data/schemas/grading';
import type {
  ReviewDirection,
  ReviewItem,
  ReviewState,
} from '@/data/schemas/review-item';

// FSRS v5 added Rating.Manual=0 to the enum, but the scheduler's repeat()
// result is keyed only on the four graded ratings. Narrow our mapping so the
// indexing is type-safe.
type GradingRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

const TIER_TO_RATING: Record<GradingTier, GradingRating> = {
  right: Rating.Good,
  close: Rating.Hard,
  wrong: Rating.Again,
};

const STATE_TO_REVIEW: Record<State, ReviewState> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
};

const REVIEW_TO_STATE: Record<ReviewState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const scheduler = fsrs(generatorParameters());

function cardFromItem(item: ReviewItem): Card {
  return {
    due: new Date(item.dueAt),
    stability: item.stability,
    difficulty: item.difficulty,
    elapsed_days: item.elapsedDays,
    scheduled_days: item.scheduledDays,
    learning_steps: item.learningSteps,
    reps: item.reps,
    lapses: item.lapses,
    state: REVIEW_TO_STATE[item.state],
    last_review: item.lastReview ? new Date(item.lastReview) : undefined,
  };
}

function itemFromCard(prev: ReviewItem, card: Card, now: Date): ReviewItem {
  return {
    ...prev,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_TO_REVIEW[card.state],
    lastReview: now.toISOString(),
    dueAt: card.due.toISOString(),
  };
}

/** Build a fresh review item for a variant the user has never seen. */
export function createNewReviewItem(
  userId: string,
  variantId: string,
  direction: ReviewDirection,
  now: Date = new Date(),
): ReviewItem {
  const card = createEmptyCard(now);
  return {
    id: randomUUID(),
    userId,
    variantId,
    direction,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_TO_REVIEW[card.state],
    lastReview: null,
    dueAt: card.due.toISOString(),
  };
}

/** Pure: apply a grade to a review item and return the next-state item. */
export function gradeReview(
  item: ReviewItem,
  tier: GradingTier,
  now: Date = new Date(),
): ReviewItem {
  const card = cardFromItem(item);
  const scheduling = scheduler.repeat(card, now);
  const rating = TIER_TO_RATING[tier];
  const nextCard = scheduling[rating].card;
  return itemFromCard(item, nextCard, now);
}

