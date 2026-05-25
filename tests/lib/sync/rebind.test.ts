import { rebindOnSignIn, type RebindIO } from '@/lib/sync/rebind';
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
  remoteUpserts: ReviewItem[][];
  upsertFails: boolean;
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
    },
    getLocalItems: (userId) => state.items.filter((it) => it.userId === userId),
    upsertRemote: async (items) => {
      if (state.upsertFails) throw new Error('network down');
      state.remoteUpserts.push(items);
    },
  };
}

describe('rebindOnSignIn', () => {
  const AUTH_UID = 'auth-uid-abc';

  it('no-ops when there is no local learner id', async () => {
    const state: FakeState = {
      learnerId: null,
      items: [],
      remoteUpserts: [],
      upsertFails: false,
    };
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 0, ran: false });
    expect(state.learnerId).toBeNull();
    expect(state.remoteUpserts).toHaveLength(0);
  });

  it('no-ops when the local learner id already matches auth uid', async () => {
    const state: FakeState = {
      learnerId: AUTH_UID,
      items: [makeItem({ userId: AUTH_UID })],
      remoteUpserts: [],
      upsertFails: false,
    };
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 0, ran: false });
    expect(state.remoteUpserts).toHaveLength(0);
  });

  it('rebinds local rows and pushes them to remote on first sign-in', async () => {
    const state: FakeState = {
      learnerId: 'old-user',
      items: [
        makeItem({ userId: 'old-user', id: '11111111-1111-4111-8111-111111111111' }),
        makeItem({ userId: 'old-user', id: '33333333-3333-4333-8333-333333333333' }),
      ],
      remoteUpserts: [],
      upsertFails: false,
    };
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 2, ran: true });
    expect(state.learnerId).toBe(AUTH_UID);
    expect(state.items.every((it) => it.userId === AUTH_UID)).toBe(true);
    expect(state.remoteUpserts).toHaveLength(1);
    expect(state.remoteUpserts[0]).toHaveLength(2);
  });

  it('still rebinds locally + replaces learner id when there are no rows to push', async () => {
    const state: FakeState = {
      learnerId: 'old-user',
      items: [],
      remoteUpserts: [],
      upsertFails: false,
    };
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result).toEqual({ rebound: 0, ran: true });
    expect(state.learnerId).toBe(AUTH_UID);
    expect(state.remoteUpserts).toHaveLength(0);
  });

  it('commits local rebind even if remote upsert fails', async () => {
    const state: FakeState = {
      learnerId: 'old-user',
      items: [makeItem({ userId: 'old-user' })],
      remoteUpserts: [],
      upsertFails: true,
    };
    const result = await rebindOnSignIn(AUTH_UID, makeIO(state));
    expect(result.ran).toBe(true);
    expect(result.rebound).toBe(1);
    expect(result.remoteError).toContain('network down');
    expect(state.learnerId).toBe(AUTH_UID);
    expect(state.items.every((it) => it.userId === AUTH_UID)).toBe(true);
  });
});
