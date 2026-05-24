import { nextStreak, toLocalDateString, type StreakState } from '@/lib/streak/core';

describe('nextStreak', () => {
  const ZERO: StreakState = { lastActiveIso: null, count: 0 };

  it('starts a streak from a clean state', () => {
    expect(nextStreak(ZERO, '2026-05-24')).toEqual({
      lastActiveIso: '2026-05-24',
      count: 1,
    });
  });

  it('is a no-op when called twice on the same day', () => {
    const day1 = nextStreak(ZERO, '2026-05-24');
    expect(nextStreak(day1, '2026-05-24')).toEqual(day1);
  });

  it('increments on a consecutive day', () => {
    const day1 = { lastActiveIso: '2026-05-24', count: 1 };
    expect(nextStreak(day1, '2026-05-25')).toEqual({
      lastActiveIso: '2026-05-25',
      count: 2,
    });
  });

  it('resets to 1 after missing a day', () => {
    const day1 = { lastActiveIso: '2026-05-24', count: 5 };
    expect(nextStreak(day1, '2026-05-26')).toEqual({
      lastActiveIso: '2026-05-26',
      count: 1,
    });
  });

  it('resets to 1 after a long gap', () => {
    const day1 = { lastActiveIso: '2026-05-24', count: 99 };
    expect(nextStreak(day1, '2026-06-30')).toEqual({
      lastActiveIso: '2026-06-30',
      count: 1,
    });
  });

  it('ignores clock-skew (today < lastActive)', () => {
    const day1 = { lastActiveIso: '2026-05-24', count: 5 };
    expect(nextStreak(day1, '2026-05-23')).toEqual(day1);
  });

  it('handles month boundary correctly', () => {
    const end = { lastActiveIso: '2026-05-31', count: 7 };
    expect(nextStreak(end, '2026-06-01')).toEqual({
      lastActiveIso: '2026-06-01',
      count: 8,
    });
  });

  it('handles year boundary correctly', () => {
    const end = { lastActiveIso: '2026-12-31', count: 30 };
    expect(nextStreak(end, '2027-01-01')).toEqual({
      lastActiveIso: '2027-01-01',
      count: 31,
    });
  });

  it('toLocalDateString returns YYYY-MM-DD in local time', () => {
    // Date constructed via local-time components — the YYYY-MM-DD output is
    // timezone-independent regardless of where the test runs.
    const d = new Date(2026, 4, 24, 12, 0, 0);
    expect(toLocalDateString(d)).toBe('2026-05-24');
  });

  it('toLocalDateString zero-pads single-digit months and days', () => {
    const d = new Date(2026, 0, 5, 9, 0, 0);
    expect(toLocalDateString(d)).toBe('2026-01-05');
  });
});
