import { describe, expect, it } from "vitest";
import { parseItinerary } from "../parse";

const MINIMAL = JSON.stringify({
  days: [{ date: "2026-08-13", items: [{ title: "出發" }] }],
});

describe("parseItinerary", () => {
  it("應解析最小合法結構", () => {
    const result = parseItinerary(MINIMAL);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.days).toHaveLength(1);
  });

  it("items 省略時應預設為空陣列", () => {
    const result = parseItinerary(JSON.stringify({ days: [{ date: "2026-08-13" }] }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.days[0].items).toEqual([]);
  });

  it("JSON 語法錯誤應回傳 errJson", () => {
    const result = parseItinerary("{ days: [ }");

    expect(result).toMatchObject({ ok: false, errorKey: "errJson" });
  });

  it("days 為空應回傳 errShape", () => {
    const result = parseItinerary(JSON.stringify({ days: [] }));

    expect(result).toMatchObject({ ok: false, errorKey: "errShape" });
  });

  it("日期格式錯誤應回傳 errShape 並指出欄位", () => {
    const result = parseItinerary(JSON.stringify({ days: [{ date: "8/13", items: [] }] }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorKey).toBe("errShape");
      expect(result.detail).toContain("days.0.date");
    }
  });

  it("時間格式錯誤應回傳 errShape", () => {
    const result = parseItinerary(
      JSON.stringify({ days: [{ date: "2026-08-13", items: [{ title: "x", start: "2000" }] }] }),
    );

    expect(result).toMatchObject({ ok: false, errorKey: "errShape" });
  });

  it("未知的 kind 應回傳 errShape", () => {
    const result = parseItinerary(
      JSON.stringify({ days: [{ date: "2026-08-13", items: [{ title: "x", kind: "party" }] }] }),
    );

    expect(result).toMatchObject({ ok: false, errorKey: "errShape" });
  });

  it("非物件的頂層輸入應回傳 errShape", () => {
    expect(parseItinerary("[]")).toMatchObject({ ok: false, errorKey: "errShape" });
    expect(parseItinerary("null")).toMatchObject({ ok: false, errorKey: "errShape" });
  });
});
