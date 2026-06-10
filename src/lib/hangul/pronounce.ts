import { compose } from "./compose";
import { CHOSEONG_NAMES } from "./data";

const IEUNG_INDEX = 11; // ㅇ 在 CHOSEONG 的 index（初聲位置為無聲）

/** 子音的正確發音文字（傳統字母名稱，如 ㄱ → 기역） */
export function consonantSound(char: string): string {
  return CHOSEONG_NAMES[char] ?? char;
}

/** 母音的正確發音音節（自動補 ㅇ 初聲，如 jungIndex=0 → 아） */
export function vowelSound(jungIndex: number): string {
  return compose(IEUNG_INDEX, jungIndex, 0);
}
