import {
  syncKnownVariants,
  type KnownVariantsIO,
} from '@/lib/known-variants/sync';
import type { KnownVariant } from '@/data/schemas/known-variant';

const USER = '00000000-0000-4000-8000-000000000099';

function k(variantId: string, markedAt = '2026-05-24T12:00:00.000Z'): KnownVariant {
  return { userId: USER, variantId, markedAt };
}

interface FakeState {
  local: KnownVariant[];
  remote: KnownVariant[];
  remoteFails: boolean;
}

function makeIO(state: FakeState): KnownVariantsIO {
  return {
    getLocal: (userId) => state.local.filter((r) => r.userId === userId),
    putLocal: (rows) => {
      const existing = new Set(state.local.map((r) => r.variantId));
      for (const row of rows) {
        if (!existing.has(row.variantId)) state.local.push(row);
      }
    },
    getRemote: async (userId) => state.remote.filter((r) => r.userId === userId),
    putRemote: async (rows) => {
      if (state.remoteFails) throw new Error('network down');
      const existing = new Set(state.remote.map((r) => r.variantId));
      for (const row of rows) {
        if (!existing.has(row.variantId)) state.remote.push(row);
      }
    },
  };
}

describe('syncKnownVariants', () => {
  it('no-ops when local and remote are identical', async () => {
    const state: FakeState = {
      local: [k('a'), k('b')],
      remote: [k('a'), k('b')],
      remoteFails: false,
    };
    const result = await syncKnownVariants(USER, makeIO(state));
    expect(result).toEqual({ pulledFromRemote: 0, pushedToRemote: 0 });
  });

  it('pulls remote-only rows into local', async () => {
    const state: FakeState = {
      local: [k('a')],
      remote: [k('a'), k('b'), k('c')],
      remoteFails: false,
    };
    const result = await syncKnownVariants(USER, makeIO(state));
    expect(result.pulledFromRemote).toBe(2);
    expect(state.local.map((r) => r.variantId).sort()).toEqual(['a', 'b', 'c']);
  });

  it('pushes local-only rows to remote', async () => {
    const state: FakeState = {
      local: [k('a'), k('b'), k('c')],
      remote: [k('a')],
      remoteFails: false,
    };
    const result = await syncKnownVariants(USER, makeIO(state));
    expect(result.pushedToRemote).toBe(2);
    expect(state.remote.map((r) => r.variantId).sort()).toEqual(['a', 'b', 'c']);
  });

  it('does both directions in one pass', async () => {
    const state: FakeState = {
      local: [k('a'), k('b')],
      remote: [k('b'), k('c')],
      remoteFails: false,
    };
    const result = await syncKnownVariants(USER, makeIO(state));
    expect(result.pulledFromRemote).toBe(1);
    expect(result.pushedToRemote).toBe(1);
    expect(state.local.map((r) => r.variantId).sort()).toEqual(['a', 'b', 'c']);
    expect(state.remote.map((r) => r.variantId).sort()).toEqual(['a', 'b', 'c']);
  });

  it('commits local pull even if remote push fails', async () => {
    const state: FakeState = {
      local: [k('a')],
      remote: [k('b')],
      remoteFails: true,
    };
    const result = await syncKnownVariants(USER, makeIO(state));
    expect(result.pulledFromRemote).toBe(1);
    expect(result.pushedToRemote).toBe(0);
    expect(result.remoteError).toContain('network down');
    expect(state.local.map((r) => r.variantId).sort()).toEqual(['a', 'b']);
    expect(state.remote.map((r) => r.variantId).sort()).toEqual(['b']);
  });
});
