import { describe, expect, it } from "vitest";
import {
  computeTimelineWindow,
  findFreeSlots,
  formatDuration,
  formatMinutes,
  toMinutes,
  totalFreeMinutes,
} from "../freeSlots";
import type { Itinerary, ItineraryItem } from "../types";

const WINDOW = { dayStart: "09:00", dayEnd: "22:00" };

function item(start?: string, end?: string): ItineraryItem {
  return { title: "test", start, end };
}

describe("toMinutes", () => {
  it("應將 HH:mm 轉為當日分鐘數", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("09:30")).toBe(570);
    expect(toMinutes("23:59")).toBe(1439);
  });

  it("應接受個位數小時", () => {
    expect(toMinutes("9:05")).toBe(545);
  });

  it("應忽略前後空白", () => {
    expect(toMinutes(" 09:30 ")).toBe(570);
  });

  it("格式不合法應回傳 null", () => {
    expect(toMinutes("")).toBeNull();
    expect(toMinutes(undefined)).toBeNull();
    expect(toMinutes("上午九點")).toBeNull();
    expect(toMinutes("0930")).toBeNull();
  });

  it("超出範圍應回傳 null", () => {
    expect(toMinutes("24:00")).toBeNull();
    expect(toMinutes("12:60")).toBeNull();
  });
});

describe("formatMinutes", () => {
  it("應補零成 HH:mm", () => {
    expect(formatMinutes(0)).toBe("00:00");
    expect(formatMinutes(545)).toBe("09:05");
    expect(formatMinutes(1439)).toBe("23:59");
  });
});

describe("formatDuration", () => {
  it("不足一小時只顯示分鐘", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("整點只顯示小時", () => {
    expect(formatDuration(180)).toBe("3h");
  });

  it("有零有整應同時顯示", () => {
    expect(formatDuration(200)).toBe("3h 20m");
  });
});

describe("findFreeSlots", () => {
  it("沒有任何行程時，整個時窗都是空檔", () => {
    expect(findFreeSlots([], WINDOW)).toEqual([{ start: "09:00", end: "22:00", minutes: 780 }]);
  });

  it("應找出行程之間的空檔", () => {
    const slots = findFreeSlots([item("11:00", "16:40"), item("20:00", "23:00")], WINDOW);

    expect(slots).toEqual([
      { start: "09:00", end: "11:00", minutes: 120 },
      { start: "16:40", end: "20:00", minutes: 200 },
    ]);
  });

  it("行程佔滿整個時窗時應無空檔", () => {
    expect(findFreeSlots([item("08:00", "23:00")], WINDOW)).toEqual([]);
  });

  it("應合併重疊的行程，不重複扣除", () => {
    const slots = findFreeSlots([item("10:00", "14:00"), item("12:00", "16:00")], WINDOW);

    expect(slots).toEqual([
      { start: "09:00", end: "10:00", minutes: 60 },
      { start: "16:00", end: "22:00", minutes: 360 },
    ]);
  });

  it("應忽略短於 minGapMinutes 的零碎空檔", () => {
    const items = [item("09:00", "12:00"), item("12:30", "22:00")];

    expect(findFreeSlots(items, WINDOW)).toEqual([]);
    expect(findFreeSlots(items, { ...WINDOW, minGapMinutes: 30 })).toEqual([
      { start: "12:00", end: "12:30", minutes: 30 },
    ]);
  });

  it("結束早於開始應視為跨午夜，截到時窗結尾", () => {
    expect(findFreeSlots([item("20:00", "03:00")], WINDOW)).toEqual([
      { start: "09:00", end: "20:00", minutes: 660 },
    ]);
  });

  it("沒有 start 的全天項目不應佔用時段", () => {
    expect(findFreeSlots([{ title: "國慶日" }], WINDOW)).toEqual([
      { start: "09:00", end: "22:00", minutes: 780 },
    ]);
  });

  it("沒有 end 的瞬時項目不應佔用時段", () => {
    expect(findFreeSlots([item("06:45")], WINDOW)).toEqual([
      { start: "09:00", end: "22:00", minutes: 780 },
    ]);
  });

  it("完全落在時窗外的行程應被忽略", () => {
    expect(findFreeSlots([item("00:30", "06:00")], WINDOW)).toEqual([
      { start: "09:00", end: "22:00", minutes: 780 },
    ]);
  });

  it("部分超出時窗的行程應被裁切", () => {
    expect(findFreeSlots([item("07:00", "11:00")], WINDOW)).toEqual([
      { start: "11:00", end: "22:00", minutes: 660 },
    ]);
  });

  it("時窗設定不合法時應回傳空陣列", () => {
    expect(findFreeSlots([], { dayStart: "22:00", dayEnd: "09:00" })).toEqual([]);
  });

  it("未指定時窗時應套用預設值 09:00–22:00", () => {
    expect(findFreeSlots([])).toEqual([{ start: "09:00", end: "22:00", minutes: 780 }]);
  });
});

describe("totalFreeMinutes", () => {
  it("應加總所有空檔長度", () => {
    const slots = findFreeSlots([item("11:00", "16:40")], WINDOW);

    expect(totalFreeMinutes(slots)).toBe(440);
  });

  it("沒有空檔時應為 0", () => {
    expect(totalFreeMinutes([])).toBe(0);
  });
});

describe("computeTimelineWindow", () => {
  function itinerary(overrides: Partial<Itinerary>): Itinerary {
    return { days: [], ...overrides };
  }

  it("沒有任何行程項目時，應採用行程層級的 dayStart/dayEnd", () => {
    expect(
      computeTimelineWindow(
        itinerary({ dayStart: "09:00", dayEnd: "22:00", days: [{ date: "2026-01-01", items: [] }] }),
      ),
    ).toEqual({ start: 540, end: 1320 });
  });

  it("未指定時應套用預設值 09:00–22:00", () => {
    expect(computeTimelineWindow(itinerary({ days: [{ date: "2026-01-01", items: [] }] }))).toEqual({
      start: 540,
      end: 1320,
    });
  });

  it("行程項目超出活動時窗時應擴大範圍並對齊整點", () => {
    const result = computeTimelineWindow(
      itinerary({
        dayStart: "09:00",
        dayEnd: "22:00",
        days: [
          {
            date: "2026-01-01",
            items: [{ title: "早班機", start: "06:45" }, { title: "深夜活動", start: "23:00", end: "23:50" }],
          },
        ],
      }),
    );

    expect(result).toEqual({ start: 360, end: 1440 });
  });

  it("跨午夜項目應視為延伸到 24:00", () => {
    const result = computeTimelineWindow(
      itinerary({
        dayStart: "09:00",
        dayEnd: "22:00",
        days: [{ date: "2026-01-01", items: [{ title: "派對", start: "20:00", end: "03:00" }] }],
      }),
    );

    expect(result.end).toBe(1440);
  });

  it("個別日期覆寫 dayStart/dayEnd 時應納入計算", () => {
    const result = computeTimelineWindow(
      itinerary({
        dayStart: "09:00",
        dayEnd: "22:00",
        days: [{ date: "2026-01-01", dayStart: "07:00", dayEnd: "23:00", items: [] }],
      }),
    );

    expect(result).toEqual({ start: 420, end: 1380 });
  });
});
