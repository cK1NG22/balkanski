import { getCurrentSession } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/env';
import { unmarkVariantKnown } from '@/lib/srs/sqlite';
import { getSupabase } from '@/lib/supabase';

// Unmark propagation: local SQLite delete + best-effort remote DELETE.
//
// Why a separate helper instead of folding the remote call into
// `unmarkVariantKnown`: the SQLite helper is pure data access and is also
// called from the rebind path (which already runs inside an auth flow).
// Mixing async Supabase access into it would force the rebind into a
// transaction model it doesn't need.
//
// Why we have to propagate deletions directly here, rather than via
// `syncKnownVariants`: the sync function is intentionally additive
// (local ∪ remote). A future bidirectional sync caller would re-add any
// row deleted on one side. Documented in src/lib/known-variants/sync.ts.

export async function unmarkAndPropagate(
  userId: string,
  variantId: string,
): Promise<void> {
  unmarkVariantKnown(userId, variantId);
  if (!isSupabaseConfigured) return;

  try {
    const session = await getCurrentSession();
    if (!session || session.userId !== userId) return;

    const { error } = await getSupabase()
      .from('known_variants')
      .delete()
      .eq('user_id', userId)
      .eq('variant_id', variantId);
    if (error) throw new Error(error.message);
  } catch (err) {
    // Best-effort: a network blip leaves the remote row as a "stale mark"
    // that the user will see next time they open the editor on this device.
    // The next session-bound sync pass (Phase 1D) will reconcile.
    if (__DEV__) console.warn('[known-variants] remote unmark failed', err);
  }
}
