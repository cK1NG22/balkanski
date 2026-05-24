// useStreak — read MMKV-backed streak state with a callable bump() that
// re-reads after writing. The Learn screen also calls bump() inside a
// useFocusEffect so values written by the lesson modal show up on return.

import { useCallback, useState } from 'react';

import { readStreak, tickStreak, type StreakState } from '@/lib/streak';

export interface UseStreak {
  state: StreakState;
  /** Tick the streak forward (records today's activity). Returns the new state. */
  bump: () => StreakState;
  /** Re-read from storage without writing (use after returning from a child screen). */
  refresh: () => StreakState;
}

export function useStreak(): UseStreak {
  const [state, setState] = useState<StreakState>(() => safeRead());

  const bump = useCallback((): StreakState => {
    const next = tickStreak();
    setState(next);
    return next;
  }, []);

  const refresh = useCallback((): StreakState => {
    const fresh = safeRead();
    setState(fresh);
    return fresh;
  }, []);

  return { state, bump, refresh };
}

function safeRead(): StreakState {
  try {
    return readStreak();
  } catch {
    return { lastActiveIso: null, count: 0 };
  }
}
