import { describe, expect, it } from "vitest";
import { combineModelProgress } from "../background-remover";

describe("combineModelProgress", () => {
  it("兩個都是 null 時應該回傳 null（隱藏進度條）", () => {
    expect(combineModelProgress(null, null)).toBeNull();
  });

  it("只有預載有值時應該回傳預載進度", () => {
    expect(combineModelProgress(0.3, null)).toBe(0.3);
  });

  it("只有佇列有值時應該回傳佇列進度", () => {
    expect(combineModelProgress(null, 0.6)).toBe(0.6);
  });

  it("兩個都有值時應該取較大者", () => {
    expect(combineModelProgress(0.2, 0.7)).toBe(0.7);
    expect(combineModelProgress(0.9, 0.4)).toBe(0.9);
  });

  it("進度為 0 時應該視為有值，不當成 null", () => {
    expect(combineModelProgress(0, null)).toBe(0);
    expect(combineModelProgress(null, 0)).toBe(0);
  });

  it("兩邊交錯回報時合併值應該只增不減", () => {
    const reports: Array<[number | null, number | null]> = [
      [0.1, null],
      [0.1, 0.05],
      [0.4, 0.05],
      [0.4, 0.3],
      [0.6, 0.3],
      [0.6, 0.8],
    ];
    const combined = reports.map(([a, b]) => combineModelProgress(a, b)!);
    for (let i = 1; i < combined.length; i++) {
      expect(combined[i]).toBeGreaterThanOrEqual(combined[i - 1]);
    }
  });
});
