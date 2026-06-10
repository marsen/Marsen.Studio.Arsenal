// HEIC / HEIF 解碼共用模組
//
// 由 heic-converter（HEIC→JPG 工具）與 background-remover（圖片去背工具）共用，
// 避免重複實作 libheif 解碼。解碼與輸出格式解耦：
//   decodeHeicToCanvas → 純解碼，回傳已繪製的 canvas
//   heicToJpegBlob     → 在 canvas 上輸出 JPEG（HEIC 工具用）
//
// 去背工具則自行 canvas.toBlob("image/png") 取得 PNG 後餵給去背套件。

/**
 * 解碼 HEIC/HEIF 檔案，回傳已把影像繪製完成的 canvas。
 * 不綁定任何輸出格式，呼叫端自行決定 toBlob 的 mime/quality。
 */
export async function decodeHeicToCanvas(file: File): Promise<HTMLCanvasElement> {
  const arrayBuffer = await file.arrayBuffer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("libheif-js/wasm-bundle")) as any;
  const libheif = mod.default ?? mod;

  const decoder = new libheif.HeifDecoder();
  const data: unknown[] = decoder.decode(new Uint8Array(arrayBuffer));

  if (!data || data.length === 0) {
    throw new Error("無法解碼此 HEIC 檔案，格式可能不受支援");
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const image = data[0] as any;
    const width: number = image.get_width();
    const height: number = image.get_height();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("無法建立 Canvas 繪圖環境");

    const imageData = ctx.createImageData(width, height);

    await new Promise<void>((resolve, reject) => {
      image.display(imageData, (displayData: ImageData | null) => {
        if (!displayData) return reject(new Error("HEIC 圖片解碼失敗，此格式可能不受支援"));
        resolve();
      });
    });

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  } finally {
    // 釋放 libheif 在 WASM heap 配置的 image handle，避免批次解碼累積洩漏。
    // 多圖 HEIC（Live Photo / burst）只取首幀，其餘幀一併釋放。
    for (const img of data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const free = (img as any)?.free;
      if (typeof free === "function") free.call(img);
    }
  }
}

/**
 * 解碼 HEIC 並輸出 JPEG Blob（HEIC→JPG 工具用）。
 */
export async function heicToJpegBlob(file: File, quality: number): Promise<Blob> {
  const canvas = await decodeHeicToCanvas(file);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("圖片輸出失敗"))),
      "image/jpeg",
      quality,
    );
  });
}
