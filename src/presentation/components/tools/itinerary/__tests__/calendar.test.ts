import { describe, expect, it } from "vitest";
import { addDays, buildDayWindow, chunkByCalendarWeek } from "../calendar";
import type { ItineraryDay } from "../types";

function day(date: string): ItineraryDay {
  return { date, items: [] };
}

describe("chunkByCalendarWeek", () => {
  it("沒有行程日期時應回傳空陣列", () => {
    expect(chunkByCalendarWeek([], 1)).toEqual([]);
  });

  it("應補齊行程外的日期到週日～週六，並以 day:null 佔位", () => {
    // 2026-08-13 是週四，該週週日是 2026-08-09
    const chunks = chunkByCalendarWeek([day("2026-08-13"), day("2026-08-14")], 1);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toHaveLength(7);
    expect(chunks[0][0].date).toBe("2026-08-09");
    expect(chunks[0][0].day).toBeNull();
    expect(chunks[0][4].date).toBe("2026-08-13");
    expect(chunks[0][4].day?.date).toBe("2026-08-13");
  });

  it("跨週的行程應切成多個週區塊", () => {
    // 2026-08-13（週四）到 2026-08-24（週一）橫跨 3 個日曆週
    const days = [
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
    ].map(day);

    const chunks = chunkByCalendarWeek(days, 1);

    expect(chunks).toHaveLength(3);
    for (const chunk of chunks) expect(chunk).toHaveLength(7);
  });

  it("兩週模式應把兩個日曆週合併成一個區塊", () => {
    const chunks = chunkByCalendarWeek([day("2026-08-13"), day("2026-08-24")], 2);

    expect(chunks[0]).toHaveLength(14);
  });
});

describe("addDays", () => {
  it("應正確往後位移", () => {
    expect(addDays("2026-08-13", 2)).toBe("2026-08-15");
  });

  it("應正確往前位移，並跨月份邊界", () => {
    expect(addDays("2026-08-01", -2)).toBe("2026-07-30");
  });

  it("位移 0 天應回傳原日期", () => {
    expect(addDays("2026-08-13", 0)).toBe("2026-08-13");
  });
});

describe("buildDayWindow", () => {
  const days = [day("2026-08-13"), day("2026-08-14"), day("2026-08-15")];

  it("沒有行程日期時應回傳空陣列", () => {
    expect(buildDayWindow([], -2, 3)).toEqual([]);
  });

  it("應以第一天為基準，依 startOffset 與 size 取出固定長度的視窗", () => {
    const window = buildDayWindow(days, 0, 3);

    expect(window).toHaveLength(3);
    expect(window.map((slot) => slot.date)).toEqual(["2026-08-13", "2026-08-14", "2026-08-15"]);
    expect(window[0].day?.date).toBe("2026-08-13");
  });

  it("負的 startOffset 應往行程開始前延伸，並以 day:null 佔位", () => {
    const window = buildDayWindow(days, -2, 3);

    expect(window.map((slot) => slot.date)).toEqual(["2026-08-11", "2026-08-12", "2026-08-13"]);
    expect(window[0].day).toBeNull();
    expect(window[1].day).toBeNull();
    expect(window[2].day?.date).toBe("2026-08-13");
  });

  it("startOffset 超過行程結尾應往後延伸，並以 day:null 佔位", () => {
    const window = buildDayWindow(days, 2, 3);

    expect(window.map((slot) => slot.date)).toEqual(["2026-08-15", "2026-08-16", "2026-08-17"]);
    expect(window[0].day?.date).toBe("2026-08-15");
    expect(window[1].day).toBeNull();
    expect(window[2].day).toBeNull();
  });
});
