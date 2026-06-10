const HANGUL_START = 0xac00;
const JUNGSEONG_COUNT = 21;
const JONGSEONG_COUNT = 28;

export function compose(cho: number, jung: number, jong: number): string {
  const code = HANGUL_START + (cho * JUNGSEONG_COUNT + jung) * JONGSEONG_COUNT + jong;
  return String.fromCharCode(code);
}
