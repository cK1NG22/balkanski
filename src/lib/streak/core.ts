// Streak counter — pure logic, no storage.
//
// Kept storage-free so the edge cases (first day, same day, consecutive day,
// missed day, clock skew) are unit-testable in jest without loading MMKV's
// native turbo-module.

export interface StreakState {
  /** YYYY-MM-DD in UTC; null = never active. */
  lastActiveIso: string | null;
  /** Current streak length in days. */
  count: number;
}

export const ZERO_STREAK: StreakState = { lastActiveIso: null, count: 0 };

const MS_PER_DAY = 86_400_000;

/**
 * YYYY-MM-DD in the device's local timezone. Daily streaks roll over at
 * the user's local midnight, which is what learners intuitively expect
 * (the alternative — UTC rollover — fires at random hours of the day in
 * non-UTC timezones).
 */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  // Compute the delta against UTC midnight of each calendar date so DST
  // transitions don't create 23- or 25-hour days that round to 0 or 2.
  const from = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const to = Date.UTC(
    Number(toIso.slice(0, 4)),
    Number(toIso.slice(5, 7)) - 1,
    Number(toIso.slice(8, 10)),
  );
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Compute the next streak state given the previous state and today's UTC date.
 *
 * - First-ever activity → count=1
 * - Same-day re-activity → no change (don't double-count)
 * - Consecutive day → count + 1
 * - Missed day(s) → reset to 1
 * - Clock skew (today < lastActive) → no change (defensive)
 */
export function nextStreak(prev: StreakState, todayIso: string): StreakState {
  if (!prev.lastActiveIso) {
    return { lastActiveIso: todayIso, count: 1 };
  }
  const delta = daysBetween(prev.lastActiveIso, todayIso);
  if (delta === 0) return prev;
  if (delta === 1) return { lastActiveIso: todayIso, count: prev.count + 1 };
  if (delta < 0) return prev;
  return { lastActiveIso: todayIso, count: 1 };
}
