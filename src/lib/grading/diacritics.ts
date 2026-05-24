// Diacritic-aware string utilities for tiered grading.
//
// BCS diacritics (š č ž đ ć and their uppercase) are meaning-bearing.
// Missing one should downgrade to `close`, not `wrong` — typing diacritics
// on a non-native keyboard is hard and we want to teach them, not punish.

const DIACRITIC_MAP: Record<string, string> = {
  š: 's',
  č: 'c',
  ć: 'c',
  ž: 'z',
  đ: 'd',
  Š: 'S',
  Č: 'C',
  Ć: 'C',
  Ž: 'Z',
  Đ: 'D',
};

export const BCS_DIACRITICS = Object.keys(DIACRITIC_MAP);

export function stripDiacritics(input: string): string {
  let out = '';
  for (const ch of input) {
    out += DIACRITIC_MAP[ch] ?? ch;
  }
  return out;
}

export function isDiacriticOnlyDifference(a: string, b: string): boolean {
  return stripDiacritics(a) === stripDiacritics(b) && a !== b;
}

export function diacriticMismatchPositions(answer: string, expected: string): number[] {
  // Returns positions where `answer` has a non-diacritic letter where `expected`
  // has a diacritic equivalent (or vice versa). Both strings must already
  // match when diacritics are stripped — otherwise the array is empty.
  if (stripDiacritics(answer) !== stripDiacritics(expected)) return [];
  const positions: number[] = [];
  for (let i = 0; i < expected.length; i++) {
    if (answer[i] !== expected[i]) positions.push(i);
  }
  return positions;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}
