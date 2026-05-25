import type { KnownVariant } from '@/data/schemas/known-variant';
import type { ReviewItem } from '@/data/schemas/review-item';
import {
  getAllKnownVariantsForUser,
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
  getLocalKnown(userId) {
    return getAllKnownVariantsForUser(userId).map((r) => ({
      userId: r.user_id,
      variantId: r.variant_id,
      markedAt: r.marked_at,
    }));
  },
  async upsertRemote(items) {
    const rows = items.map(itemToRow);
    const { error } = await getSupabase()
      .from('review_items')
      .upsert(rows, { onConflict: 'user_id,variant_id,direction' });
    if (error) throw new Error(error.message);
  },
  async upsertRemoteKnown(rows) {
    // ignoreDuplicates -> ON CONFLICT DO NOTHING. Matches known_variants RLS,
    // which has no UPDATE policy by design (toggle = delete-then-reinsert).
    const remote = rows.map((k: KnownVariant) => ({
      user_id: k.userId,
      variant_id: k.variantId,
      marked_at: k.markedAt,
    }));
    const { error } = await getSupabase()
      .from('known_variants')
      .upsert(remote, { onConflict: 'user_id,variant_id', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  },
};
