import { describe, expect, it } from "vitest";
import { jpgName, validateFile, zipEntryNames } from "../heic-converter";

const MB = 1024 * 1024;

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe("validateFile", () => {
  describe("有效 HEIC 檔案", () => {
    it("應接受 image/heic MIME type", () => {
      const file = makeFile("photo.heic", "image/heic", MB);
      expect(validateFile(file)).toBeNull();
    });

    it("應接受 image/heif MIME type", () => {
      const file = makeFile("photo.heif", "image/heif", MB);
      expect(validateFile(file)).toBeNull();
    });

    it("應接受 image/heic-sequence MIME type", () => {
      const file = makeFile("burst.heic", "image/heic-sequence", MB);
      expect(validateFile(file)).toBeNull();
    });

    it("應接受 .heic 副檔名（即使 MIME type 為空）", () => {
      const file = makeFile("photo.heic", "", MB);
      expect(validateFile(file)).toBeNull();
    });

    it("應接受 .heif 副檔名（即使 MIME type 為空）", () => {
      const file = makeFile("photo.heif", "", MB);
      expect(validateFile(file)).toBeNull();
    });

    it("恰好 30MB 應接受（邊界值）", () => {
      const file = makeFile("photo.heic", "image/heic", 30 * MB);
      expect(validateFile(file)).toBeNull();
    });
  });

  describe("無效格式", () => {
    it("應拒絕 .jpg 檔案", () => {
      const file = makeFile("photo.jpg", "image/jpeg", MB);
      expect(validateFile(file)).toBe("errFormat");
    });

    it("應拒絕 .png 檔案", () => {
      const file = makeFile("photo.png", "image/png", MB);
      expect(validateFile(file)).toBe("errFormat");
    });

    it("應拒絕 .pdf 檔案", () => {
      const file = makeFile("doc.pdf", "application/pdf", MB);
      expect(validateFile(file)).toBe("errFormat");
    });
  });

  describe("超過大小限制", () => {
    it("應拒絕超過 30MB 的 HEIC 檔案", () => {
      const file = makeFile("large.heic", "image/heic", 30 * MB + 1);
      expect(validateFile(file)).toBe("errSize");
    });
  });
});

describe("jpgName", () => {
  it("應把 .heic 副檔名換成 .jpg", () => {
    expect(jpgName("photo.heic")).toBe("photo.jpg");
  });

  it("應把 .heif 副檔名換成 .jpg", () => {
    expect(jpgName("photo.heif")).toBe("photo.jpg");
  });

  it("應忽略副檔名大小寫", () => {
    expect(jpgName("IMG_1234.HEIC")).toBe("IMG_1234.jpg");
  });

  it("應只換掉最後一段副檔名，保留檔名中的點", () => {
    expect(jpgName("2026.summer.trip.heic")).toBe("2026.summer.trip.jpg");
  });

  it("沒有副檔名時應直接補上 .jpg", () => {
    expect(jpgName("photo")).toBe("photo.jpg");
  });

  it("非 HEIC 副檔名應保留原副檔名並補上 .jpg（避免誤刪原始資訊）", () => {
    expect(jpgName("photo.png")).toBe("photo.png.jpg");
  });
});

describe("zipEntryNames", () => {
  it("檔名各不相同時應原樣輸出", () => {
    expect(zipEntryNames(["a.heic", "b.heic"])).toEqual(["a.jpg", "b.jpg"]);
  });

  it("同名檔案應從第二個開始補 -1、-2 後綴", () => {
    expect(zipEntryNames(["IMG_1.heic", "IMG_1.heic", "IMG_1.heic"])).toEqual([
      "IMG_1.jpg",
      "IMG_1-1.jpg",
      "IMG_1-2.jpg",
    ]);
  });

  it("不同副檔名但轉換後同名也應視為重複", () => {
    expect(zipEntryNames(["p.heic", "p.heif"])).toEqual(["p.jpg", "p-1.jpg"]);
  });

  it("應只對重複者加後綴，不影響其他檔案", () => {
    expect(zipEntryNames(["a.heic", "b.heic", "a.heic"])).toEqual([
      "a.jpg",
      "b.jpg",
      "a-1.jpg",
    ]);
  });

  it("空清單應回傳空陣列", () => {
    expect(zipEntryNames([])).toEqual([]);
  });
});
