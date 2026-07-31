import { describe, expect, it } from "vitest";
import { formatOffsetDiff, formatUtcOffset, getUtcOffsetMinutes } from "../timezone";

describe("getUtcOffsetMinutes", () => {
  it("應算出台北的 UTC 偏移", () => {
    expect(getUtcOffsetMinutes("2026-08-13", "Asia/Taipei")).toBe(8 * 60);
  });

  it("夏令時間應反映在偏移中（布拉格夏天 UTC+2）", () => {
    expect(getUtcOffsetMinutes("2026-08-14", "Europe/Prague")).toBe(2 * 60);
  });

  it("冬令時間應反映在偏移中（布拉格冬天 UTC+1）", () => {
    expect(getUtcOffsetMinutes("2026-01-14", "Europe/Prague")).toBe(1 * 60);
  });

  it("無效的時區代碼應回傳 null", () => {
    expect(getUtcOffsetMinutes("2026-08-13", "Not/A_Timezone")).toBeNull();
  });
});

describe("formatUtcOffset", () => {
  it("整點偏移應格式化為 GMT+N", () => {
    expect(formatUtcOffset(480)).toBe("GMT+8");
    expect(formatUtcOffset(-300)).toBe("GMT-5");
    expect(formatUtcOffset(0)).toBe("GMT+0");
  });

  it("非整點偏移應保留分鐘", () => {
    expect(formatUtcOffset(330)).toBe("GMT+5:30");
    expect(formatUtcOffset(-210)).toBe("GMT-3:30");
  });
});

describe("formatOffsetDiff", () => {
  it("應格式化為帶正負號的小時差", () => {
    expect(formatOffsetDiff(-360)).toBe("-6h");
    expect(formatOffsetDiff(120)).toBe("+2h");
  });

  it("非整數小時應四捨五入到小數第一位", () => {
    expect(formatOffsetDiff(-90)).toBe("-1.5h");
  });
});
