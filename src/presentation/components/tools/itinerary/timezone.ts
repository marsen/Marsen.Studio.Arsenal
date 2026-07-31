const OFFSET_PATTERN = /^GMT([+-]\d{1,2})(?::(\d{2}))?$/;

/**
 * 計算指定 IANA 時區在某日期的 UTC 偏移分鐘數，自動處理當地夏令時間。
 * 用該日期中午（UTC）取樣，避免日期邊界造成誤差；時區代碼無效時回傳 null。
 */
export function getUtcOffsetMinutes(date: string, timezone: string): number | null {
  try {
    const probe = new Date(`${date}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(probe);
    const label = parts.find((part) => part.type === "timeZoneName")?.value;
    if (!label) return null;
    if (label === "GMT") return 0;

    const matched = OFFSET_PATTERN.exec(label);
    if (!matched) return null;
    const hours = Number(matched[1]);
    const minutes = Number(matched[2] ?? 0);
    return hours * 60 + (hours < 0 ? -minutes : minutes);
  } catch {
    return null;
  }
}

/** 將 UTC 偏移分鐘數格式化為 "GMT+8"、"GMT-3:30" 這種簡短標籤。 */
export function formatUtcOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return mins === 0 ? `GMT${sign}${hours}` : `GMT${sign}${hours}:${String(mins).padStart(2, "0")}`;
}

/** 將分鐘差格式化為 "-6h"、"+1.5h" 這種簡短時差標籤。 */
export function formatOffsetDiff(diffMinutes: number): string {
  const sign = diffMinutes < 0 ? "-" : "+";
  const hours = Math.abs(diffMinutes) / 60;
  const rounded = Number.isInteger(hours) ? hours : Math.round(hours * 10) / 10;
  return `${sign}${rounded}h`;
}
