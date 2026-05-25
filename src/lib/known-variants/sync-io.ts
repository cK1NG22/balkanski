import type { KnownVariant } from '@/data/schemas/known-variant';
import {
  getAllKnownVariantsForUser,
  markVariantKnown,
} from '@/lib/srs/sqlite';
import { getSupabase } from '@/lib/supabase';

import type { KnownVariantsIO } from './sync';

// snake_case <-> camelCase: Postgres stores marked_at; the zod schema and
// app code use markedAt. Same dance as src/lib/sync/rebind-io.ts.

interface RemoteRow {
  user_id: string;
  variant_id: string;
  marked_at: string;
}

function rowToKnown(r: RemoteRow): KnownVariant {
  return {
    userId: r.user_id,
    variantId: r.variant_id,
    markedAt: r.marked_at,
  };
}

function knownToRow(k: KnownVariant): RemoteRow {
  return {
    user_id: k.userId,
    variant_id: k.variantId,
    marked_at: k.markedAt,
  };
}

export const realKnownVariantsIO: KnownVariantsIO = {
  getLocal(userId) {
    return getAllKnownVariantsForUser(userId).map((r) => ({
      userId: r.user_id,
      variantId: r.variant_id,
      markedAt: r.marked_at,
    }));
  },
  putLocal(rows) {
    for (const row of rows) {
      markVariantKnown(row.userId, row.variantId, new Date(row.markedAt));
    }
  },
  async getRemote(userId) {
    const { data, error } = await getSupabase()
      .from('known_variants')
      .select('user_id, variant_id, marked_at')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToKnown);
  },
  async putRemote(rows) {
    // ignoreDuplicates makes PostgREST issue ON CONFLICT DO NOTHING instead of
    // DO UPDATE. The known_variants table has no UPDATE RLS policy on purpose
    // -- the only mutation in the data model is delete-then-reinsert, so we
    // never want UPDATE behavior here even if RLS allowed it.
    const { error } = await getSupabase()
      .from('known_variants')
      .upsert(rows.map(knownToRow), {
        onConflict: 'user_id,variant_id',
        ignoreDuplicates: true,
      });
    if (error) throw new Error(error.message);
  },
};
