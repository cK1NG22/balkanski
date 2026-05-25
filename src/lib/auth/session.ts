import type { Session, Subscription } from '@supabase/supabase-js';

import { getSupabase } from '@/lib/supabase';

// App-facing session shape — strips Supabase internals and exposes only
// what the UI actually needs.
export interface AppSession {
  userId: string;
  email: string | null;
}

function toAppSession(session: Session | null): AppSession | null {
  if (!session) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? null,
  };
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const { data } = await getSupabase().auth.getSession();
  return toAppSession(data.session);
}

export function onAuthChange(
  callback: (session: AppSession | null) => void,
): Subscription {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
    callback(toAppSession(session));
  });
  return data.subscription;
}
