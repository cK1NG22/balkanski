import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { getCurrentSession, onAuthChange, type AppSession } from '@/lib/auth';
import {
  rebindOnSignIn,
  realRebindIO,
  realScriptPrefIO,
  syncScriptPrefOnSignIn,
} from '@/lib/sync';

interface AuthContextValue {
  session: AppSession | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  // Tracks which user ids we've already attempted the rebind for in this
  // process. Without it we'd re-run the rebind on every TOKEN_REFRESH event.
  const reboundFor = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    function handleSession(s: AppSession | null) {
      if (cancelled) return;
      setSession(s);
      if (s && !reboundFor.current.has(s.userId)) {
        reboundFor.current.add(s.userId);
        void runSignInSync(s.userId);
      }
    }

    // Isolated error boundaries: a rebind failure shouldn't silently drop
    // the script-pref sync if rebind partially succeeded, and conversely a
    // pref-sync failure shouldn't get conflated with a rebind warning.
    // Rebind runs first so review_items + known_variants land on the auth
    // uid before script-pref decides push (first sign-in this device) vs
    // pull (returning user — remote may have a newer value from device 2).
    async function runSignInSync(userId: string) {
      let didRebind = false;
      try {
        const result = await rebindOnSignIn(userId, realRebindIO);
        didRebind = result.ran;
      } catch (err) {
        console.warn('[auth] rebindOnSignIn failed:', err);
        // Without a rebind result we can't safely choose sync direction
        // (push would risk overwriting remote with stale local; pull would
        // risk overwriting a pre-auth local toggle). Skip this cycle; next
        // sign-in event retries.
        return;
      }
      try {
        await syncScriptPrefOnSignIn(userId, realScriptPrefIO, { didRebind });
      } catch (err) {
        console.warn('[auth] syncScriptPrefOnSignIn failed:', err);
      }
    }

    getCurrentSession().then((s) => {
      handleSession(s);
      if (!cancelled) setLoading(false);
    });

    const subscription = onAuthChange(handleSession);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export default AuthProvider;
