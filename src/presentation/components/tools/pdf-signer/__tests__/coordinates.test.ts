import { describe, expect, it } from "vitest";
import { toPdfPoint } from "../coordinates";

describe("toPdfPoint", () => {
  it("scale 為 1 時應直接做 Y 軸翻轉", () => {
    const result = toPdfPoint(
      { xPx: 100, yPx: 100, widthPx: 150, heightPx: 50 },
      { widthPt: 595, heightPt: 842 },
      1,
    );

    expect(result).toEqual({ xPt: 100, yPt: 692, widthPt: 150, heightPt: 50 });
  });

  it("應依 scale 縮放位置與尺寸", () => {
    const result = toPdfPoint(
      { xPx: 200, yPx: 200, widthPx: 300, heightPx: 100 },
      { widthPt: 595, heightPt: 842 },
      2,
    );

    expect(result).toEqual({ xPt: 100, yPt: 692, widthPt: 150, heightPt: 50 });
  });

  it("貼齊畫布底部時，yPt 應接近 0", () => {
    const result = toPdfPoint(
      { xPx: 0, yPx: 792, widthPx: 100, heightPx: 50 },
      { widthPt: 595, heightPt: 842 },
      1,
    );

    expect(result.yPt).toBe(0);
  });

  it("貼齊畫布頂部時，yPt 應等於頁高減去簽名高度", () => {
    const result = toPdfPoint(
      { xPx: 0, yPx: 0, widthPx: 100, heightPx: 50 },
      { widthPt: 595, heightPt: 842 },
      1,
    );

    expect(result.yPt).toBe(792);
  });
});
