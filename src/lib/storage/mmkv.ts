// MMKV v4 — synchronous + fast. Use for hot client state that renders every
// screen (streak counter, language pref, Cyrillic toggle, onboarding flag).
// Async per-user data goes to Supabase + TanStack Query; bulk offline data
// goes to expo-sqlite.
//
// v4 API: `createMMKV({ id })` factory; the `MMKV` symbol is type-only.

import { createMMKV, type MMKV } from 'react-native-mmkv';

export const storage: MMKV = createMMKV({ id: 'balkanski' });

const KEYS = {
  onboardingComplete: 'onboarding-complete',
  primaryLanguage: 'primary-language',
  serbianScriptPref: 'serbian-script-pref',
  streakLastActive: 'streak-last-active',
  streakCount: 'streak-count',
  localLearnerId: 'local-learner-id',
} as const;

export const storageKeys = KEYS;

export function getString(key: string): string | undefined {
  return storage.getString(key);
}

export function setString(key: string, value: string): void {
  storage.set(key, value);
}

export function getBool(key: string): boolean | undefined {
  return storage.getBoolean(key);
}

export function setBool(key: string, value: boolean): void {
  storage.set(key, value);
}

export function getNumber(key: string): number | undefined {
  return storage.getNumber(key);
}

export function setNumber(key: string, value: number): void {
  storage.set(key, value);
}
