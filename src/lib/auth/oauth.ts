import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '@/lib/supabase';

// Pre-warms the in-app browser (Android Custom Tabs) so the OAuth tap feels
// instant. Safe to no-op on iOS.
WebBrowser.maybeCompleteAuthSession();

export type SignInResult =
  | { type: 'success' }
  | { type: 'cancel' }
  | { type: 'error'; message: string };

export async function signInWithGoogle(): Promise<SignInResult> {
  const supabase = getSupabase();
  const redirectTo = AuthSession.makeRedirectUri({
    scheme: 'balkanski',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) return { type: 'error', message: error.message };
  if (!data?.url) return { type: 'error', message: 'No OAuth URL returned' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { type: 'cancel' };
  }
  if (result.type !== 'success') {
    return { type: 'error', message: `Unexpected browser result: ${result.type}` };
  }

  // PKCE redirect carries ?code=... in the URL; exchange it for a session.
  // exchangeCodeForSession pairs it with the verifier stashed during signInWithOAuth.
  const code = new URL(result.url).searchParams.get('code');
  if (!code) {
    return { type: 'error', message: 'OAuth redirect missing authorization code' };
  }
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return { type: 'error', message: exchangeError.message };
  }
  return { type: 'success' };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}
