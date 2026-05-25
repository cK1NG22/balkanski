import type { KnownVariant } from '@/data/schemas/known-variant';
import type { ReviewItem } from '@/data/schemas/review-item';

// Pure orchestration for the first-sign-in rebind. All I/O is injected via
// `RebindIO` so jest can drive this with in-memory fakes — the production
// wiring lives in rebind-io.ts and touches expo-sqlite + Supabase + MMKV.

export interface RebindIO {
  /** MMKV: returns the learner id stored locally, or null if the user has never opened the app. */
  getOldLearnerId(): string | null;
  /** MMKV: store the new learner id (the auth uid after sign-in). */
  setLearnerId(id: string): void;
  /** SQLite: rebind every user-state row (review_items + known_variants) from oldId to newId. */
  rebindLocal(oldId: string, newId: string): void;
  /** SQLite: SELECT all review_items rows belonging to a user. */
  getLocalItems(userId: string): ReviewItem[];
  /** SQLite: SELECT all known_variants rows belonging to a user. */
  getLocalKnown(userId: string): KnownVariant[];
  /** Supabase: upsert items into public.review_items. */
  upsertRemote(items: ReviewItem[]): Promise<void>;
  /** Supabase: idempotent insert into public.known_variants (ON CONFLICT DO NOTHING). */
  upsertRemoteKnown(rows: KnownVariant[]): Promise<void>;
}

export interface RebindResult {
  /** Total rows rebound (review_items + known_variants), best-effort pushed to remote. */
  rebound: number;
  /** Whether the rebind ran (false when no-op: no oldId or oldId === authUid). */
  ran: boolean;
  /** Set when the remote push failed; local rebind still committed. */
  remoteError?: string;
}

// Order of operations is intentional and matters for crash-safety:
//   1. SQLite UPDATE (rewrites every row from oldId → authUid)
//   2. MMKV set authUid (now hooks reading getLocalLearnerId see auth uid)
//   3. Remote upsert (best-effort — if it fails, local is still consistent)
// If we did step 3 before step 2, a remote-push failure would leave hooks
// reading the wrong user id from MMKV.
export async function rebindOnSignIn(
  authUid: string,
  io: RebindIO,
): Promise<RebindResult> {
  const oldId = io.getOldLearnerId();
  if (!oldId || oldId === authUid) {
    return { rebound: 0, ran: false };
  }

  io.rebindLocal(oldId, authUid);
  io.setLearnerId(authUid);

  const items = io.getLocalItems(authUid);
  const known = io.getLocalKnown(authUid);
  const total = items.length + known.length;
  if (total === 0) {
    return { rebound: 0, ran: true };
  }

  try {
    if (items.length > 0) await io.upsertRemote(items);
    if (known.length > 0) await io.upsertRemoteKnown(known);
    return { rebound: total, ran: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { rebound: total, ran: true, remoteError: message };
  }
}
