/** 柔和版類別色（暗色介面用），取自 dataviz skill 驗證過的暗色階（OKLCH L 0.48–0.67），固定順序不循環對應。 */
const COUNTRY_HUES = [
  { border: "border-l-[#3987e5]", hex: "#3987e5" }, // blue
  { border: "border-l-[#d95926]", hex: "#d95926" }, // orange
  { border: "border-l-[#199e70]", hex: "#199e70" }, // aqua
  { border: "border-l-[#c98500]", hex: "#c98500" }, // yellow
  { border: "border-l-[#d55181]", hex: "#d55181" }, // magenta
  { border: "border-l-[#9085e9]", hex: "#9085e9" }, // violet
];

function countryIndex(country: string | undefined): number | null {
  if (!country) return null;
  let hash = 0;
  for (const char of country) hash = (hash * 31 + char.codePointAt(0)!) % 9973;
  return hash % COUNTRY_HUES.length;
}

/** 依國家名稱穩定對應到一組固定色票，讓同一國家在整份行程中顏色一致。 */
export function countryTone(country: string | undefined): string {
  const index = countryIndex(country);
  return index === null ? "border-l-border" : COUNTRY_HUES[index].border;
}

/** 同 `countryTone`，回傳純 hex 供 inline style（例如時間軸事件色條）使用。 */
export function countryHex(country: string | undefined): string {
  const index = countryIndex(country);
  return index === null ? "#71717A" : COUNTRY_HUES[index].hex;
}

/** 由 YYYY-MM-DD 取得星期索引（0 = 週日），以 UTC 計算避免時區造成的水合差異。 */
export function weekdayIndex(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
