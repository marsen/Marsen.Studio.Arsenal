import { describe, expect, it } from "vitest";
import { outName, zipEntryNames } from "../background-remover";

describe("outName", () => {
  it("應該把副檔名換成 -removed.png", () => {
    expect(outName("cat.jpg")).toBe("cat-removed.png");
    expect(outName("IMG_1.HEIC")).toBe("IMG_1-removed.png");
  });
});

describe("zipEntryNames", () => {
  it("應該在沒有重複時保持原本的輸出檔名", () => {
    expect(zipEntryNames(["a.jpg", "b.png"])).toEqual([
      "a-removed.png",
      "b-removed.png",
    ]);
  });

  it("應該替同名檔案依序加上 -1、-2", () => {
    expect(zipEntryNames(["a.jpg", "a.jpg", "a.jpg"])).toEqual([
      "a-removed.png",
      "a-removed-1.png",
      "a-removed-2.png",
    ]);
  });

  it("應該把副檔名不同但輸出同名的檔案視為重複", () => {
    expect(zipEntryNames(["p.jpg", "p.webp"])).toEqual([
      "p-removed.png",
      "p-removed-1.png",
    ]);
  });

  it("應該不分大小寫判斷重複", () => {
    expect(zipEntryNames(["Cat.jpg", "cat.png"])).toEqual([
      "Cat-removed.png",
      "cat-removed-1.png",
    ]);
  });

  it("應該讓每個輸出檔名都不重複", () => {
    const names = zipEntryNames(Array(20).fill("same.jpg"));
    expect(new Set(names.map((n) => n.toLowerCase())).size).toBe(20);
  });

  it("應該在空清單時回傳空陣列", () => {
    expect(zipEntryNames([])).toEqual([]);
  });
});
