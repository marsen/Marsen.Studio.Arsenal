# Design: PDF 線上簽名器

**來源**：[story-20260731-01](../stories/story-20260731-01.md)、[story-20260731-02](../stories/story-20260731-02.md)

## 可行性驗證（已完成）

在設計介面前先用小工具驗證過，避免做到一半才發現套件不可行：

- **`pdf-lib`**（Node 端腳本驗證）：讀取既有 PDF、在指定頁面座標嵌入圖片、輸出真實 PDF，頁數與內容都正確。
- **`pdfjs-dist`**（瀏覽器端頁面驗證）：在本專案 Next.js 16 + Turbopack 環境下，成功載入 PDF 並把指定頁面渲染到 canvas，無 worker 版本不符或 SSR 相容性問題。

兩者驗證用的檔案都是一次性腳本/頁面，驗證完已刪除，未進正式程式碼。

## 架構分層

延續專案「精簡分層」（跟 itinerary、heic-converter 同一套），純前端、無後端依賴：

```
app/[locale]/tools/pdf-signer/page.tsx        — 頁面殼
presentation/components/tools/pdf-signer/
  ├─ index.tsx        — 主流程串接（上傳、選頁、放置簽名、下載）
  ├─ SignaturePad.tsx  — 手寫簽名畫布 + 上傳簽名圖片
  ├─ storage.ts        — 簽名資料存 localStorage
  ├─ pdf.ts            — 直接呼叫 pdfjs-dist / pdf-lib 的兩個函式
  ├─ coordinates.ts    — 畫布座標 ↔ PDF 座標換算（純函式，可單元測試）
  └─ types.ts          — SignaturePlacement 等共用型別
```

## PDF 讀寫（`pdf.ts`，不抽介面）

可行性已經用小工具驗證過（見上），套件相容性風險已解除；這塊本來就是 View 層在操作瀏覽器端的渲染與匯出，不是在包 DB／外部 API 這類基礎設施依賴，硬套 port/adapter 不符合精簡分層的精神，也違反「不確定需要就不做」。改成直接寫兩個單純函式：

```ts
// pdf.ts —— 直接 import pdfjs-dist / pdf-lib，不包介面
export async function renderPageToCanvas(
  pdfBytes: Uint8Array,
  pageIndex: number,
  canvas: HTMLCanvasElement,
  scale: number,
): Promise<{ widthPt: number; heightPt: number }> { /* pdfjs-dist 實作 */ }

export async function embedSignatures(
  pdfBytes: Uint8Array,
  placements: SignaturePlacement[],
): Promise<Uint8Array> { /* pdf-lib 實作 */ }
```

`renderPageToCanvas` 用 `pdfjs-dist` 把指定頁面畫到 canvas，同時回傳該頁 PDF point 尺寸供座標換算使用；`embedSignatures` 用 `pdf-lib` 重新載入原始 bytes，依 placements 逐一 `embedPng` + `drawImage`，`save()` 輸出簽署後的 bytes。兩個函式各自獨立操作同一份原始 bytes，職責單純：一個只管「看」，一個只管「輸出」。

`index.tsx` 直接 import 這兩個函式使用。哪天真的要換套件，再把它們抽介面也不遲，改動範圍很小（只有這一個檔案）。

## 座標換算（`coordinates.ts`，純函式，寫單元測試）

畫布上點擊/拖曳出來的位置是「螢幕像素、左上角原點、隨 `scale` 縮放」；`pdf-lib` 的 `drawImage` 要的是「PDF point、左下角原點、不受畫面縮放影響」。換算規則：

```
xPt = canvasX / scale
yPt = pageHeightPt - (canvasY + canvasHeight) / scale   // Y 軸翻轉
widthPt = canvasWidth / scale
heightPt = canvasHeight / scale
```

這條換算不牽涉任何瀏覽器 API，是這個功能裡最容易算錯、最值得寫測試的邏輯。

## 簽名儲存（`storage.ts`）

比照 itinerary 工具的既有寫法：用 `useSyncExternalStore` 讀寫 localStorage，不用 `useEffect + setState`（專案的 `react-hooks/set-state-in-effect` eslint 規則會擋）。存的是簽名圖片的 dataURL（手寫或上傳皆轉成同一種格式），供 story-01 的「重複使用同一組簽名」需求。

## 多重簽名位置（story-02）

`index.tsx` 維護 `SignaturePlacement[]` 陣列（畫面用的版本座標是螢幕像素，送進 `embedSignatures` 前才用 `coordinates.ts` 轉成 PDF point）。每個 placement 可獨立調整位置/大小、可個別移除。下載時一次呼叫 `embedSignatures(placements)` 取得完整簽署後的 PDF bytes，觸發瀏覽器下載。

## 錯誤處理

上傳檔案交給 `renderPageToCanvas`；`pdfjs-dist` 對非 PDF／損毀／加密檔案會 reject，`index.tsx` 用 try/catch 接住，顯示翻譯過的錯誤訊息（比照 `bgRemoval`/`heic` 工具現有的 `errFormat` 模式），讓訪客重新選擇檔案。

## 測試策略

| 項目 | 測試方式 |
|---|---|
| `coordinates.ts` 座標換算 | 單元測試（純函式） |
| `pdf.ts`（實際渲染/嵌入） | 瀏覽器手動驗證（本來就是 View 層操作瀏覽器 API，無法用 jsdom 有意義地測 canvas 渲染） |
| `SignaturePad.tsx` 畫布繪圖 | 瀏覽器手動驗證 |
| 整體流程（上傳→選頁→簽名→下載） | 瀏覽器手動驗證 |

## 待釐清
- [ ] `pdf-lib` 對「加密但無密碼保護的檢視限制」PDF 的相容性尚未測試，遇到再處理
- [ ] 簽名圖片統一存 PNG dataURL，若使用者上傳超大圖片是否要壓縮/限制檔案大小，留到實作階段依 bgRemoval 工具現有的檔案大小限制模式處理
