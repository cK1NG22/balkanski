// Streak counter — storage-backed wrapper around the pure core.
//
// Pure logic lives in `./core` so it can be exercised in jest without the
// MMKV turbo-module. This file adds the read/write/tick helpers that touch
// MMKV on a real device.

import { storage, storageKeys } from '@/lib/storage/mmkv';

import { nextStreak, toLocalDateString, type StreakState } from './core';

export {
  nextStreak,
  toLocalDateString,
  ZERO_STREAK,
  type StreakState,
} from './core';

export function readStreak(): StreakState {
  const raw = storage.getString(storageKeys.streakLastActive);
  return {
    lastActiveIso: raw && raw.length > 0 ? raw : null,
    count: storage.getNumber(storageKeys.streakCount) ?? 0,
  };
}

export function writeStreak(state: StreakState): void {
  // MMKV's typed factory in v4 doesn't expose `delete`; an empty-string
  // sentinel does the job since `readStreak` collapses both empty and
  // undefined into `null`.
  storage.set(storageKeys.streakLastActive, state.lastActiveIso ?? '');
  storage.set(storageKeys.streakCount, state.count);
}

/** Read → bump → write. Returns the new state. */
export function tickStreak(now: Date = new Date()): StreakState {
  const today = toLocalDateString(now);
  const next = nextStreak(readStreak(), today);
  writeStreak(next);
  return next;
}
