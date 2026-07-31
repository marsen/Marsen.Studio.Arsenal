/** 使用者在畫布上安排的一個簽名位置（畫面座標系：像素、左上角原點，對應某個渲染中的頁面）。 */
export type SignaturePlacement = {
  id: string;
  /** 0-based 頁碼。 */
  pageIndex: number;
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  /** 新增這個位置當下所使用的簽名快照（dataURL），之後更換簽名不會影響已放置的位置。 */
  signatureDataUrl: string;
};

/** PDF 頁面的原生尺寸（point，PDF 座標系用，左下角原點）。 */
export type PageSizePt = {
  widthPt: number;
  heightPt: number;
};

/** 換算成 PDF point 座標、準備嵌入用的簽名位置。 */
export type SignatureEmbed = {
  pageIndex: number;
  xPt: number;
  yPt: number;
  widthPt: number;
  heightPt: number;
  imageBytes: Uint8Array;
};
