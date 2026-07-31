import { PDFDocument } from "pdf-lib";
import type { PageSizePt, SignatureEmbed } from "./types";

let workerConfigured = false;

/** `pdfjs-dist` 需要瀏覽器環境，動態載入避免 SSR 時被解析到伺服器端。 */
async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerConfigured = true;
  }
  return pdfjsLib;
}

/** 取得 PDF 總頁數，供選頁 UI 使用。 */
export async function getPdfPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdfjsLib = await loadPdfjs();
  // pdfjs-dist 可能會轉移傳入 buffer 的所有權，複製一份避免影響呼叫端持有的原始資料。
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  return pdf.numPages;
}

/** 用 pdfjs-dist 把指定頁面渲染到傳入的 canvas，並回傳該頁的 PDF point 尺寸供座標換算使用。 */
export async function renderPageToCanvas(
  pdfBytes: Uint8Array,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<PageSizePt> {
  const pdfjsLib = await loadPdfjs();
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const page = await pdf.getPage(pageIndex + 1); // pdfjs-dist 頁碼從 1 開始
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context unavailable");
  await page.render({ canvasContext: context, viewport, canvas }).promise;

  const nativeViewport = page.getViewport({ scale: 1 });
  return { widthPt: nativeViewport.width, heightPt: nativeViewport.height };
}

/** 用 pdf-lib 讀取原始 PDF，依 placements 逐一嵌入簽名圖片，輸出簽署後的 PDF bytes。 */
export async function embedSignatures(
  pdfBytes: Uint8Array,
  placements: SignatureEmbed[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();

  for (const placement of placements) {
    const page = pages[placement.pageIndex];
    if (!page) continue;
    const image = await doc.embedPng(placement.imageBytes);
    page.drawImage(image, {
      x: placement.xPt,
      y: placement.yPt,
      width: placement.widthPt,
      height: placement.heightPt,
    });
  }

  return doc.save();
}
