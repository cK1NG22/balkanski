import { rebindOnSignIn, type RebindIO } from '@/lib/sync/rebind';
import type { KnownVariant } from '@/data/schemas/known-variant';
import type { ReviewItem } from '@/data/schemas/review-item';

function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    userId: 'old-user',
    variantId: '22222222-2222-4222-8222-222222222222',
    direction: 'recognize',
    stability: 0.5,
    difficulty: 5,
    elapsedDays: 0,
    scheduledDays: 1,
    learningSteps: 0,
    reps: 0,
    lapses: 0,
    state: 'new',
    lastReview: null,
    dueAt: new Date().toISOString(),
    ...overrides,
  };
}

interface FakeState {
  learnerId: string | null;
  items: ReviewItem[];
  known: KnownVariant[];
  remoteUpserts: ReviewItem[][];
  remoteKnownUpserts: KnownVariant[][];
  upsertFails: boolean;
}

function emptyState(overrides: Partial<FakeState> = {}): FakeState {
  return {
    learnerId: null,
    items: [],
    known: [],
    remoteUpserts: [],
    remoteKnownUpserts: [],
    upsertFails: false,
    ...overrides,
  };
}

function makeIO(state: FakeState): RebindIO {
  return {
    getOldLearnerId: () => state.learnerId,
    setLearnerId: (id) => {
      state.learnerId = id;
    },
    rebindLocal: (oldId, newId) => {
      state.items = state.items.map((it) =>
        it.userId === oldId ? { ...it, userId: newId } : it,
      );
      state.known = state.known.map((k) =>
        k.userId === oldId ? { ...k, userId: newId } : k,
      );
    },
    getLocalItems: (userId) => state.items.filter((it) => it.userId === userId),
    getLocalKnown: (userId) => state.known.filter((k) => k.userId === userId),
    upsertRemote: async (items) => {
      if (state.upsertFails) throw new Error('network down');
      state.remoteUpserts.push(items);
    },
    upsertRemoteKnown: async (rows) => {
      if (state.upsertFails) throw new Error('network down');
      state.remoteKnownUpserts.push(rows);
    },
  };
}

describe('rebindOnSignIn', () => {
  const AUTH_UID = 'auth-uid-abc';

  it('no-ops when there is no local learner id', async () => {
    const state = emptyState();
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 0, ran: false });
    expect(state.learnerId).toBeNull();
    expect(state.remoteUpserts).toHaveLength(0);
    expect(state.remoteKnownUpserts).toHaveLength(0);
  });

  it('no-ops when the local learner id already matches auth uid', async () => {
    const state = emptyState({
      learnerId: AUTH_UID,
      items: [makeItem({ userId: AUTH_UID })],
    });
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 0, ran: false });
    expect(state.remoteUpserts).toHaveLength(0);
  });

  it('rebinds local rows and pushes them to remote on first sign-in', async () => {
    const state = emptyState({
      learnerId: 'old-user',
      items: [
        makeItem({ userId: 'old-user', id: '11111111-1111-4111-8111-111111111111' }),
        makeItem({ userId: 'old-user', id: '33333333-3333-4333-8333-333333333333' }),
      ],
    });
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 2, ran: true });
    expect(state.learnerId).toBe(AUTH_UID);
    expect(state.items.every((it) => it.userId === AUTH_UID)).toBe(true);
    expect(state.remoteUpserts).toHaveLength(1);
    expect(state.remoteUpserts[0]).toHaveLength(2);
  });

  it('still rebinds locally + replaces learner id when there are no rows to push', async () => {
    const state = emptyState({ learnerId: 'old-user' });
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 0, ran: true });
    expect(state.learnerId).toBe(AUTH_UID);
    expect(state.remoteUpserts).toHaveLength(0);
  });

  it('commits local rebind even if remote upsert fails', async () => {
    const state = emptyState({
      learnerId: 'old-user',
      items: [makeItem({ userId: 'old-user' })],
      upsertFails: true,
    });
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result.ran).toBe(true);
    expect(result.rebound).toBe(1);
    expect(result.remoteError).toContain('network down');
    expect(state.learnerId).toBe(AUTH_UID);
    expect(state.items.every((it) => it.userId === AUTH_UID)).toBe(true);
  });

  it('rebinds + pushes known_variants alongside review_items', async () => {
    const state = emptyState({
      learnerId: 'old-user',
      items: [makeItem({ userId: 'old-user' })],
      known: [
        { userId: 'old-user', variantId: 'v1', markedAt: '2026-05-24T12:00:00.000Z' },
        { userId: 'old-user', variantId: 'v2', markedAt: '2026-05-24T12:00:01.000Z' },
      ],
    });
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result.ran).toBe(true);
    expect(result.rebound).toBe(3); // 1 item + 2 known
    expect(state.known.every((k) => k.userId === AUTH_UID)).toBe(true);
    expect(state.remoteUpserts).toHaveLength(1);
    expect(state.remoteKnownUpserts).toHaveLength(1);
    expect(state.remoteKnownUpserts[0].map((k) => k.variantId).sort()).toEqual([
      'v1',
      'v2',
    ]);
  });

  it('pushes known-only state when no review items exist', async () => {
    const state = emptyState({
      learnerId: 'old-user',
      known: [
        { userId: 'old-user', variantId: 'v1', markedAt: '2026-05-24T12:00:00.000Z' },
      ],
    });
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result.rebound).toBe(1);
    expect(state.remoteUpserts).toHaveLength(0);
    expect(state.remoteKnownUpserts).toHaveLength(1);
  });
});
