// Local learner id — a stable UUID minted on first launch.
//
// In Phase 1C (Supabase Auth) this becomes the Supabase `auth.uid()` and
// every existing review_items row is rebound. Until then it's a personal,
// device-local identity so the FSRS queue + Pareto sequencer can key their
// state on a real `user_id`.

import { randomUUID } from 'expo-crypto';

import { storage, storageKeys } from '@/lib/storage/mmkv';

export function getLocalLearnerId(): string {
  const existing = storage.getString(storageKeys.localLearnerId);
  if (existing && existing.length > 0) return existing;
  const id = randomUUID();
  storage.set(storageKeys.localLearnerId, id);
  return id;
}
