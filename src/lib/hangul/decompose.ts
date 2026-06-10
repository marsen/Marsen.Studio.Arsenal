const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNGSEONG_COUNT = 21;
const JONGSEONG_COUNT = 28;

export function isHangulSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

export function decompose(
  char: string,
): { cho: number; jung: number; jong: number } | null {
  if (!isHangulSyllable(char)) return null;
  const offset = char.charCodeAt(0) - HANGUL_START;
  return {
    cho: Math.floor(offset / (JUNGSEONG_COUNT * JONGSEONG_COUNT)),
    jung: Math.floor((offset % (JUNGSEONG_COUNT * JONGSEONG_COUNT)) / JONGSEONG_COUNT),
    jong: offset % JONGSEONG_COUNT,
  };
}
