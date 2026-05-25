import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { getCurrentSession, onAuthChange, type AppSession } from '@/lib/auth';
import { rebindOnSignIn, realRebindIO } from '@/lib/sync';

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
        rebindOnSignIn(s.userId, realRebindIO).catch((err) => {
          console.warn('[auth] rebindOnSignIn failed:', err);
        });
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
