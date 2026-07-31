import type { ItineraryDay } from "./types";

export type CalendarSlot = { date: string; day: ItineraryDay | null };

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 依「真實日曆週」（週日至週六）將行程日期切成好幾週；行程範圍外的日期以 day:null 佔位，
 * 讓週／兩週檢視能對齊真實星期，而不是只顯示行程本身的天數。
 */
export function chunkByCalendarWeek(days: ItineraryDay[], weeksPerChunk: 1 | 2): CalendarSlot[][] {
  if (days.length === 0) return [];

  const byDate = new Map(days.map((day) => [day.date, day]));
  const first = toUtcDate(days[0].date);
  const last = toUtcDate(days[days.length - 1].date);

  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const end = new Date(last);
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

  const slots: CalendarSlot[] = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const dateStr = toDateString(cursor);
    slots.push({ date: dateStr, day: byDate.get(dateStr) ?? null });
  }

  const chunkSize = weeksPerChunk * 7;
  const chunks: CalendarSlot[][] = [];
  for (let i = 0; i < slots.length; i += chunkSize) {
    chunks.push(slots.slice(i, i + chunkSize));
  }
  return chunks;
}

/** 將 YYYY-MM-DD 往前後位移 delta 天，回傳新的 YYYY-MM-DD（以 UTC 計算避免時區造成的誤差）。 */
export function addDays(date: string, delta: number): string {
  const cursor = toUtcDate(date);
  cursor.setUTCDate(cursor.getUTCDate() + delta);
  return toDateString(cursor);
}

/**
 * 以行程第一天為基準，取出從 `startOffset` 天開始、連續 `size` 天的滑動視窗，供逐日檢視分頁使用。
 * 範圍外（行程開始前／結束後）的日期以 day:null 佔位，讓視窗永遠固定長度，方便在行程頭尾也能往前後多看幾天。
 */
export function buildDayWindow(days: ItineraryDay[], startOffset: number, size: number): CalendarSlot[] {
  if (days.length === 0) return [];

  const byDate = new Map(days.map((day) => [day.date, day]));
  const base = days[0].date;

  const slots: CalendarSlot[] = [];
  for (let i = 0; i < size; i++) {
    const date = addDays(base, startOffset + i);
    slots.push({ date, day: byDate.get(date) ?? null });
  }
  return slots;
}
