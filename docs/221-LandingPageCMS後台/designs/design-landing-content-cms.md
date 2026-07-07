# Design: 首頁內容後台編輯（即時生效）

**來源**：[story-20260706-02](../stories/story-20260706-02.md)
**依賴**：[design-admin-auth](design-admin-auth.md)（後台登入與路由守衛）

## 內容

### 為什麼跟隨 Becca 的 SiteContent 模式

Becca 已經有「單一 JSONB 文件存整份可編輯內容、後台編輯、`revalidatePath` 即時生效」這一整套機制（`domain/siteContent`）。Arsenal 的需求規模比 Becca 小很多（Becca 是可自訂增刪排序的 block 陣列系統；Arsenal 這次只需要編輯幾個固定欄位），所以只複製「單一文件 + repository + Server Action + revalidate」這個骨架，**不複製** Becca 的可擴充 block 系統（過度工程，YAGNI）。

### 範圍確認（含與 /demos 頁的資料共用）

首頁「成功案例」卡片（AI.Did / Becca / Amy 三個作品的名稱、描述、標籤、連結）目前與 `/demos` 頁共用同一份資料（`demos.projects`）。討論後確認：**這次連卡片內容一起搬進資料庫**，`/demos` 頁改讀同一個資料來源，兩頁自動同步。

### 內容模型

```ts
// src/domain/landingContent/landingContent.ts
export type HeroSlide = { heading: string; sub: string };
export type Service = { title: string; desc: string };
export type Project = { name: string; description: string; tags: string[]; url: string };

export type LandingContent = {
  heroEyebrow: string;
  heroSlides: HeroSlide[];   // 固定 3 筆，輪播
  heroCta: string;
  servicesTitle: string;
  services: Service[];       // 固定 4 筆
  casesTitle: string;
  projects: Project[];       // 目前 3 筆，AI.Did / Becca / Amy
};
```

不做 Becca 那種「可增刪排序的 block 陣列」，欄位是固定形狀（fixed shape），符合目前的實際需求（4 個服務、3 個案例都是已知數量，不是開放式內容）。

### 多語系：一個 locale 一份文件（而非欄位內雙語）

```ts
export const landingContent = pgTable('landing_content', {
  locale: text('locale').primaryKey(), // 'zh' | 'en'
  data: jsonb('data').$type<LandingContent>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

對應 story 確認的「切換標籤、分開編輯」：後台一次只讀寫一個 locale 的那一整份 JSONB。這跟 Becca 的 `id=1` 單例模式相同，只是把 primary key 從固定的 `1` 換成 `locale`，很自然的延伸，不是新發明的模式。

**已知取捨（記錄不處理）**：`tags`、`url` 這兩個欄位理論上不分語言（網址、技術棧名稱中英文通常一樣），但既然採「一個 locale 一份文件」，這兩個欄位會在 zh/en 兩份文件裡各存一次，编輯時要手動同步兩邊。這是簡化模型的代價；目前只有 3 筆案例、改動頻率低，人工同步的成本可以接受，不特別做欄位層級的「共用不分語言」機制（YAGNI）。

### 即時生效機制

沿用 Becca 驗證過的做法：**DB 存資料 + `revalidatePath` 即時刷新快取**，不是每次請求都直接打 DB（避免不必要的資料庫負載）。

1. 後台儲存 Server Action 呼叫 use case 寫入 DB
2. 寫入成功後呼叫 `revalidatePath('/[locale]', 'page')` 或明確列出 `/zh`、`/en`、`/zh/demos`、`/en/demos` 四個路徑（因為案例資料同時影響首頁與 /demos 頁）
3. 下一位訪客請求時，Next.js 重新產生頁面、讀到資料庫最新內容

### 讀取路徑（首頁 / /demos 頁怎麼拿到內容）

**不修改** `src/i18n/request.ts` 全域注入（會讓所有頁面、包含 /about、/tools 都多一次資料庫查詢，不必要的效能成本）。改成只在需要的兩個頁面元件各自讀取：

```ts
// src/app/[locale]/page.tsx（首頁）
const content = await getLandingContent(locale); // application 層 use case
// content.heroEyebrow / content.heroSlides / content.services / content.projects
// 其餘不在這次範圍的文字（want*、step*、contact*）仍用既有 useTranslations('home')
```

```ts
// src/app/[locale]/demos/page.tsx
const content = await getLandingContent(locale);
// content.projects 取代原本的 t.raw('projects')
// title/subtitle/intro 等頁面標題文字不在範圍內，仍用既有 useTranslations('demos')
```

`getLandingContent(locale)`（application 層）：DB 無資料時（尚未經過任何一次後台儲存）回傳目前 `messages/{locale}.json` 裡對應欄位的內容作為預設值——不需要額外寫遷移腳本，首次上線前網站行為與現在完全一致，只有 Marsen 進後台存過一次之後才會改由 DB 接手。

### 後台編輯畫面

- 路徑：`/admin/content`（不吃 next-intl，純中文介面）
- 語言標籤（中文／English）切換要編輯的版本，一次只顯示一種語言的表單
- 表單直接對應 `LandingContent` 的欄位（多個文字輸入框 + 案例/服務的重複區塊，各 3～4 筆固定數量，不提供新增/刪除案例的介面——固定筆數，不做動態增刪，避免此次範圍失控）
- 必填驗證：儲存前檢查每個欄位皆非空字串，任一為空則擋下並提示，不送出

### 分層

```
src/
  domain/landingContent/
    landingContent.ts            # 型別
    landingContentRepository.ts  # port
  application/landingContent/
    getLandingContent.ts         # 讀取 + fallback 到靜態預設值
    saveLandingContent.ts        # 寫入
  infrastructure/persistence/
    drizzleLandingContentRepository.ts
  infrastructure/di/
    landingContentContainer.ts
  app/
    admin/content/page.tsx        # 後台編輯頁（受 /admin 路由守衛保護）
    actions/landingContent.ts     # saveLandingContentAction（Server Action，含 revalidatePath）
```

### 為什麼不做的事

- **不做草稿/預覽**：story 已確認「直接儲存即發布」
- **不做內容版本歷史／還原**：story 待釐清項目已決定先不做，YAGNI
- **不做案例/服務的新增刪除 UI**：目前固定 4 服務 3 案例，做成動態列表是為不存在的需求預先設計，過度工程

## 待釐清
- [ ] 文案長度限制／排版提示——story 已標記「先不管，出問題 Marsen 自己會發現」，這裡不重複處理
