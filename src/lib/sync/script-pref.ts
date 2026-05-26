import type { ScriptPref } from '@/data/schemas/user';

// Pure orchestration for User.serbianScriptPref sync. All I/O is injected via
// `ScriptPrefIO` so jest can drive this with in-memory fakes. Production
// wiring lives in script-pref-io.ts and touches MMKV + Supabase.

export interface ScriptPrefIO {
  /** MMKV: returns the current local pref (with 'latin' default). */
  getLocal(): ScriptPref;
  /** MMKV: persist the pref locally. */
  setLocal(pref: ScriptPref): void;
  /** Supabase: SELECT users.serbian_script_pref. null when row not yet visible (RLS lag). */
  getRemote(userId: string): Promise<ScriptPref | null>;
  /** Supabase: UPDATE users.serbian_script_pref for the auth uid. */
  setRemote(userId: string, pref: ScriptPref): Promise<void>;
}

export interface ScriptPrefSyncResult {
  /** Final pref after the sync settled (the value now in MMKV). */
  pref: ScriptPref;
  /** Which direction the sync went: 'push' on first sign-in for this device,
   *  'pull' on subsequent sign-ins, 'noop' when nothing changed. */
  direction: 'push' | 'pull' | 'noop';
  /** Set when the remote half failed; the local pref is still consistent. */
  remoteError?: string;
}

// Sync semantics:
//   - didRebind=true (first sign-in for this auth uid on this device):
//     the local MMKV pref is the user's most recent intent on this device
//     (possibly set pre-auth via the anonymous learner-id flow). Push it
//     up so a future device-2 sign-in pulls the right value.
//   - didRebind=false (returning user, same auth uid in this process):
//     remote is the source of truth — another device may have toggled
//     since last open. Pull and overwrite MMKV.
// Either half is fail-soft: a remote outage cannot break the local UX.
export async function syncScriptPrefOnSignIn(
  userId: string,
  io: ScriptPrefIO,
  opts: { didRebind: boolean },
): Promise<ScriptPrefSyncResult> {
  if (opts.didRebind) {
    const local = io.getLocal();
    try {
      await io.setRemote(userId, local);
      return { pref: local, direction: 'push' };
    } catch (err) {
      return {
        pref: local,
        direction: 'push',
        remoteError: err instanceof Error ? err.message : String(err),
      };
    }
  }

  let remote: ScriptPref | null;
  try {
    remote = await io.getRemote(userId);
  } catch (err) {
    return {
      pref: io.getLocal(),
      direction: 'noop',
      remoteError: err instanceof Error ? err.message : String(err),
    };
  }

  if (remote == null) {
    return { pref: io.getLocal(), direction: 'noop' };
  }
  if (remote === io.getLocal()) {
    return { pref: remote, direction: 'noop' };
  }
  io.setLocal(remote);
  return { pref: remote, direction: 'pull' };
}

// Settings card calls this after writing MMKV optimistically. Fail-soft so a
// dropped connection or expired session doesn't surface as a UI error — the
// next sign-in cycle will reconcile via the pull path above.
export async function pushScriptPrefBestEffort(
  userId: string,
  pref: ScriptPref,
  io: Pick<ScriptPrefIO, 'setRemote'>,
): Promise<{ ok: boolean; remoteError?: string }> {
  try {
    await io.setRemote(userId, pref);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      remoteError: err instanceof Error ? err.message : String(err),
    };
  }
}
