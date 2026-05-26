import {
  pushScriptPrefBestEffort,
  syncScriptPrefOnSignIn,
  type ScriptPrefIO,
} from '@/lib/sync/script-pref';
import type { ScriptPref } from '@/data/schemas/user';

interface FakeState {
  local: ScriptPref;
  remote: ScriptPref | null;
  getRemoteFails: boolean;
  setRemoteFails: boolean;
  setRemoteCalls: Array<{ userId: string; pref: ScriptPref }>;
}

function emptyState(overrides: Partial<FakeState> = {}): FakeState {
  return {
    local: 'latin',
    remote: 'latin',
    getRemoteFails: false,
    setRemoteFails: false,
    setRemoteCalls: [],
    ...overrides,
  };
}

function makeIO(state: FakeState): ScriptPrefIO {
  return {
    getLocal: () => state.local,
    setLocal: (pref) => {
      state.local = pref;
    },
    getRemote: async () => {
      if (state.getRemoteFails) throw new Error('remote read down');
      return state.remote;
    },
    setRemote: async (userId, pref) => {
      if (state.setRemoteFails) throw new Error('remote write down');
      state.setRemoteCalls.push({ userId, pref });
      state.remote = pref;
    },
  };
}

const USER = 'auth-uid-abc';

describe('syncScriptPrefOnSignIn', () => {
  it('pushes local→remote when rebind ran (first sign-in on this device)', async () => {
    const state = emptyState({ local: 'cyrillic', remote: 'latin' });
    const result = await syncScriptPrefOnSignIn(USER, makeIO(state), { didRebind: true });
    expect(result.direction).toBe('push');
    expect(result.pref).toBe('cyrillic');
    expect(state.setRemoteCalls).toEqual([{ userId: USER, pref: 'cyrillic' }]);
    expect(state.remote).toBe('cyrillic');
    expect(state.local).toBe('cyrillic'); // unchanged
  });

  it('pulls remote→local when rebind did not run (returning user, newer device-2 pref)', async () => {
    const state = emptyState({ local: 'latin', remote: 'cyrillic' });
    const result = await syncScriptPrefOnSignIn(USER, makeIO(state), { didRebind: false });
    expect(result.direction).toBe('pull');
    expect(result.pref).toBe('cyrillic');
    expect(state.local).toBe('cyrillic');
    expect(state.setRemoteCalls).toHaveLength(0);
  });

  it('no-ops when remote equals local on pull path', async () => {
    const state = emptyState({ local: 'cyrillic', remote: 'cyrillic' });
    const result = await syncScriptPrefOnSignIn(USER, makeIO(state), { didRebind: false });
    expect(result.direction).toBe('noop');
    expect(result.pref).toBe('cyrillic');
    expect(state.setRemoteCalls).toHaveLength(0);
  });

  it('no-ops when remote returns null (RLS lag or fresh row not visible yet)', async () => {
    const state = emptyState({ local: 'latin', remote: null });
    const result = await syncScriptPrefOnSignIn(USER, makeIO(state), { didRebind: false });
    expect(result.direction).toBe('noop');
    expect(result.pref).toBe('latin');
    expect(state.setRemoteCalls).toHaveLength(0);
  });

  it('returns push direction with remoteError when remote write fails', async () => {
    const state = emptyState({ local: 'cyrillic', setRemoteFails: true });
    const result = await syncScriptPrefOnSignIn(USER, makeIO(state), { didRebind: true });
    expect(result.direction).toBe('push');
    expect(result.pref).toBe('cyrillic');
    expect(result.remoteError).toContain('remote write down');
    expect(state.local).toBe('cyrillic'); // local stays consistent
  });

  it('returns noop with remoteError when remote read fails on pull path', async () => {
    const state = emptyState({ local: 'cyrillic', getRemoteFails: true });
    const result = await syncScriptPrefOnSignIn(USER, makeIO(state), { didRebind: false });
    expect(result.direction).toBe('noop');
    expect(result.pref).toBe('cyrillic'); // falls back to local
    expect(result.remoteError).toContain('remote read down');
  });
});

describe('pushScriptPrefBestEffort', () => {
  it('returns ok=true when remote accepts the write', async () => {
    const state = emptyState();
    const result = await pushScriptPrefBestEffort(USER, 'cyrillic', makeIO(state));
    expect(result.ok).toBe(true);
    expect(state.remote).toBe('cyrillic');
  });

  it('returns ok=false with remoteError when remote rejects', async () => {
    const state = emptyState({ setRemoteFails: true });
    const result = await pushScriptPrefBestEffort(USER, 'cyrillic', makeIO(state));
    expect(result.ok).toBe(false);
    expect(result.remoteError).toContain('remote write down');
  });
});
