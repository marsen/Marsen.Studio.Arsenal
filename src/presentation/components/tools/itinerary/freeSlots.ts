import type { FreeSlot, ItineraryItem } from "./types";

export const DEFAULT_DAY_START = "09:00";
export const DEFAULT_DAY_END = "22:00";
export const DEFAULT_MIN_GAP_MINUTES = 60;

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** 將 HH:mm 轉為當日分鐘數；格式不合法或超出範圍時回傳 null。 */
export function toMinutes(time: string | undefined): number | null {
  if (!time) return null;
  const matched = TIME_PATTERN.exec(time.trim());
  if (!matched) return null;
  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 將當日分鐘數轉回 HH:mm。 */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** 將分鐘數格式化為「Xh Ym」形式，供空檔長度顯示。 */
export function formatDuration(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

type Interval = { start: number; end: number };

/**
 * 取出項目在活動時窗內實際佔用的區間。
 * - 沒有 start 的項目視為全天／未定，不佔用時段
 * - 沒有 end 的項目視為瞬時事件，不佔用時段
 * - end 早於 start 視為跨午夜，截到時窗結尾
 */
function toInterval(item: ItineraryItem, windowStart: number, windowEnd: number): Interval | null {
  const start = toMinutes(item.start);
  if (start === null) return null;

  const rawEnd = toMinutes(item.end);
  if (rawEnd === null) return null;

  const end = rawEnd < start ? windowEnd : rawEnd;
  const clampedStart = Math.max(start, windowStart);
  const clampedEnd = Math.min(end, windowEnd);
  if (clampedEnd <= clampedStart) return null;

  return { start: clampedStart, end: clampedEnd };
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [];

  for (const current of sorted) {
    const last = merged[merged.length - 1];
    if (last && current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

export type FreeSlotOptions = {
  dayStart?: string;
  dayEnd?: string;
  minGapMinutes?: number;
};

/**
 * 在活動時窗內扣掉所有固定行程，找出剩餘的空檔。
 * 短於 minGapMinutes 的零碎空檔會被略過。
 */
export function findFreeSlots(items: ItineraryItem[], options: FreeSlotOptions = {}): FreeSlot[] {
  const windowStart = toMinutes(options.dayStart) ?? toMinutes(DEFAULT_DAY_START)!;
  const windowEnd = toMinutes(options.dayEnd) ?? toMinutes(DEFAULT_DAY_END)!;
  const minGap = options.minGapMinutes ?? DEFAULT_MIN_GAP_MINUTES;

  if (windowEnd <= windowStart) return [];

  const occupied = mergeIntervals(
    items
      .map((item) => toInterval(item, windowStart, windowEnd))
      .filter((interval): interval is Interval => interval !== null),
  );

  const slots: FreeSlot[] = [];
  let cursor = windowStart;

  for (const interval of occupied) {
    if (interval.start - cursor >= minGap) {
      slots.push({
        start: formatMinutes(cursor),
        end: formatMinutes(interval.start),
        minutes: interval.start - cursor,
      });
    }
    cursor = Math.max(cursor, interval.end);
  }

  if (windowEnd - cursor >= minGap) {
    slots.push({
      start: formatMinutes(cursor),
      end: formatMinutes(windowEnd),
      minutes: windowEnd - cursor,
    });
  }

  return slots;
}

/** 加總一組空檔的總分鐘數。 */
export function totalFreeMinutes(slots: FreeSlot[]): number {
  return slots.reduce((sum, slot) => sum + slot.minutes, 0);
}
