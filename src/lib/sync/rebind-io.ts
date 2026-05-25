import type { ReviewItem } from '@/data/schemas/review-item';
import {
  getAllReviewItemsForUser,
  rebindUserIdInSqlite,
} from '@/lib/srs/sqlite';
import { storage, storageKeys } from '@/lib/storage/mmkv';
import { getSupabase } from '@/lib/supabase';

import type { RebindIO } from './rebind';

// Maps the camelCase ReviewItem to the snake_case row shape Postgres expects.
// Kept inline (and duplicated with seed-sr-starter.ts) to avoid introducing a
// shared mapping module before we know how many tables need it.
function itemToRow(item: ReviewItem) {
  return {
    id: item.id,
    user_id: item.userId,
    variant_id: item.variantId,
    direction: item.direction,
    stability: item.stability,
    difficulty: item.difficulty,
    elapsed_days: item.elapsedDays,
    scheduled_days: item.scheduledDays,
    learning_steps: item.learningSteps,
    reps: item.reps,
    lapses: item.lapses,
    state: item.state,
    last_review: item.lastReview,
    due_at: item.dueAt,
  };
}

export const realRebindIO: RebindIO = {
  getOldLearnerId() {
    return storage.getString(storageKeys.localLearnerId) ?? null;
  },
  setLearnerId(id) {
    storage.set(storageKeys.localLearnerId, id);
  },
  rebindLocal(oldId, newId) {
    rebindUserIdInSqlite(oldId, newId);
  },
  getLocalItems(userId) {
    return getAllReviewItemsForUser(userId);
  },
  async upsertRemote(items) {
    const rows = items.map(itemToRow);
    const { error } = await getSupabase()
      .from('review_items')
      .upsert(rows, { onConflict: 'user_id,variant_id,direction' });
    if (error) throw new Error(error.message);
  },
};
