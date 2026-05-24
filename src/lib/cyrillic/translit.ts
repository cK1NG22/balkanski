// Serbian Cyrillic ↔ Latin transliteration.
//
// Used for the script-toggle render path on Serbian variants. Note that the
// `variant` row stores both `latin_spelling` and `cyrillic_spelling` directly,
// so transliteration is a fallback / utility — not the primary path.

const CYR_TO_LAT: Record<string, string> = {
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Ђ: 'Đ', Е: 'E', Ж: 'Ž',
  З: 'Z', И: 'I', Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj', М: 'M', Н: 'N',
  Њ: 'Nj', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', Ћ: 'Ć', У: 'U',
  Ф: 'F', Х: 'H', Ц: 'C', Ч: 'Č', Џ: 'Dž', Ш: 'Š',
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž',
  з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n',
  њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u',
  ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š',
};

const LAT_TO_CYR: Record<string, string> = {
  LJ: 'Љ', Lj: 'Љ', lj: 'љ',
  NJ: 'Њ', Nj: 'Њ', nj: 'њ',
  DŽ: 'Џ', Dž: 'Џ', dž: 'џ',
  A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', Đ: 'Ђ', E: 'Е', Ž: 'Ж',
  Z: 'З', I: 'И', J: 'Ј', K: 'К', L: 'Л', M: 'М', N: 'Н', O: 'О',
  P: 'П', R: 'Р', S: 'С', T: 'Т', Ć: 'Ћ', U: 'У', F: 'Ф', H: 'Х',
  C: 'Ц', Č: 'Ч', Š: 'Ш',
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', đ: 'ђ', e: 'е', ž: 'ж',
  z: 'з', i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о',
  p: 'п', r: 'р', s: 'с', t: 'т', ć: 'ћ', u: 'у', f: 'ф', h: 'х',
  c: 'ц', č: 'ч', š: 'ш',
};

export function cyrillicToLatin(input: string): string {
  let out = '';
  for (const ch of input) out += CYR_TO_LAT[ch] ?? ch;
  return out;
}

// Greedy longest-match: derive digraph ordering from the table itself so it
// can't drift as new entries are added. LJ/Lj/lj/NJ/Nj/nj/DŽ/Dž/dž bubble to
// the front of the substitution list because they're length > 1.
const LAT_DIGRAPHS: readonly string[] = Object.keys(LAT_TO_CYR)
  .filter((k) => k.length > 1)
  .sort((a, b) => b.length - a.length);

export function latinToCyrillic(input: string): string {
  let s = input;
  for (const d of LAT_DIGRAPHS) {
    s = s.split(d).join(LAT_TO_CYR[d]);
  }
  let out = '';
  for (const ch of s) out += LAT_TO_CYR[ch] ?? ch;
  return out;
}
