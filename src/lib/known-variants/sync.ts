import type { KnownVariant } from '@/data/schemas/known-variant';

// Pure orchestration for known-variants sync. All I/O is injected via
// `KnownVariantsIO` so jest can drive this with in-memory fakes -- the
// production wiring lives in sync-io.ts and touches expo-sqlite + Supabase.
//
// Conflict policy: additive union of local + remote. Deletions do NOT
// propagate through this function -- they must be issued as direct writes
// (DELETE remote + DELETE local) from the unmark code path. Phase 1 has no
// bidirectional sync caller yet (only the one-way rebind-on-sign-in pushes
// local state up), so the "zombie mark" failure mode is currently inert.
// When Phase 1D wires bidirectional sync, the unmark path will need a
// remote DELETE call alongside the local one; tracking that follow-up in
// todo.md ("Phase 1D — known_variants delete propagation").

export interface KnownVariantsIO {
  /** SQLite: read every locally-marked known variant for the user. */
  getLocal(userId: string): KnownVariant[];
  /** SQLite: idempotent insert. No-op if already present. */
  putLocal(rows: readonly KnownVariant[]): void;
  /** Supabase: read every remote row for the user. */
  getRemote(userId: string): Promise<KnownVariant[]>;
  /** Supabase: idempotent upsert. */
  putRemote(rows: readonly KnownVariant[]): Promise<void>;
}

export interface SyncKnownResult {
  pulledFromRemote: number;
  pushedToRemote: number;
  /** Set when the remote push failed; local merge still committed. */
  remoteError?: string;
}

/**
 * Two-way merge:
 *   local ∪ remote → write the diff back to both sides.
 * Idempotent and crash-safe. If the remote push fails after the local merge,
 * we still return `pushedToRemote: 0` plus a remoteError -- next sync retries.
 */
export async function syncKnownVariants(
  userId: string,
  io: KnownVariantsIO,
): Promise<SyncKnownResult> {
  const local = io.getLocal(userId);
  const remote = await io.getRemote(userId);

  const localIds = new Set(local.map((r) => r.variantId));
  const remoteIds = new Set(remote.map((r) => r.variantId));

  const toAddLocal = remote.filter((r) => !localIds.has(r.variantId));
  const toAddRemote = local.filter((r) => !remoteIds.has(r.variantId));

  io.putLocal(toAddLocal);

  if (toAddRemote.length === 0) {
    return { pulledFromRemote: toAddLocal.length, pushedToRemote: 0 };
  }

  try {
    await io.putRemote(toAddRemote);
    return {
      pulledFromRemote: toAddLocal.length,
      pushedToRemote: toAddRemote.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      pulledFromRemote: toAddLocal.length,
      pushedToRemote: 0,
      remoteError: message,
    };
  }
}
