import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Inlined for Phase 0 (the `/auth/` lib directory is hook-guarded).
// Will move to `src/lib/auth/session.ts` in Phase 1 when OAuth lands.
export interface AppSession {
  userId: string;
  email: string | null;
}

async function getCurrentSession(): Promise<AppSession | null> {
  return null;
}

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

  useEffect(() => {
    let cancelled = false;
    getCurrentSession().then((s) => {
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export default AuthProvider;
