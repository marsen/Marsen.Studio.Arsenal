import type { PageSizePt } from "./types";

type PxRect = { xPx: number; yPx: number; widthPx: number; heightPx: number };
type PtRect = { xPt: number; yPt: number; widthPt: number; heightPt: number };

/**
 * 把畫布座標（像素、左上角原點、隨 scale 縮放）換算成 PDF point 座標（左下角原點）。
 * canvas 的 y 軸往下增加，PDF 的 y 軸往上增加，換算時要做 Y 軸翻轉。
 */
export function toPdfPoint(rect: PxRect, pageSize: PageSizePt, scale: number): PtRect {
  const widthPt = rect.widthPx / scale;
  const heightPt = rect.heightPx / scale;
  const xPt = rect.xPx / scale;
  const yPt = pageSize.heightPt - rect.yPx / scale - heightPt;
  return { xPt, yPt, widthPt, heightPt };
}
