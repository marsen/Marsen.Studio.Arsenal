# Design: About 頁與首頁共用聯絡表單元件

**來源**：[story-20260706-01](../stories/story-20260706-01.md)

## 內容

### 現況

`src/presentation/components/landing/HeroCta.tsx` 已經是完整的聯絡表單（姓名 + Email + 訊息，收合式按鈕展開），目前只在首頁 Hero 使用，送出邏輯呼叫既有的 `/api/contact`（Resend 通知）不需要改動。

樣式目前寫死白色系（`text-white`、`bg-white/10` 等），因為 Hero 區塊背景是深色漸層。

### 改動範圍

1. **移動並改名元件**
   `src/presentation/components/landing/HeroCta.tsx` → `src/presentation/components/ContactForm.tsx`
   （移出 `landing/` 資料夾，因為不再是 landing 專屬；不建立新的 `shared/` 資料夾，目前只有這一個共用元件，等有第二個共用元件再考慮分類）

   元件內部邏輯、樣式、`useTranslations('home')` 呼叫**不變**——顏色是寫死的白色系，剛好與首頁 Hero 及 About 頁「有想法嗎？」區塊（`tone="plum"`，同樣是深色背景）都相容，不需要為了共用而做深淺色切換邏輯。

   **Props**：無（零參數元件，跟現在一樣）。不需要傳入 tone/color 之類的參數，因為色彩本來就寫死且兩處都適用——這也是為什麼不用做主題切換的具體原因。

   **型別**：檔案內既有的 `type State = 'idle' | 'submitting' | 'success' | 'error'` 不變，元件簽名從
   ```ts
   export default function HeroCta() { ... }
   ```
   改成
   ```ts
   export default function ContactForm() { ... }
   ```
   其餘內容逐行搬移，不修改邏輯。

2. **首頁引用路徑更新**
   `src/app/[locale]/page.tsx`：
   ```diff
   - import HeroCta from '@/presentation/components/landing/HeroCta';
   + import ContactForm from '@/presentation/components/ContactForm';
   ...
   - <HeroCta />
   + <ContactForm />
   ```

3. **About 頁串接**
   `src/app/[locale]/about/page.tsx` 現有的 connect 區塊：
   ```tsx
   <Block tone="plum">
     <h2 ...>{t('connectTitle')}</h2>
     <p ...>{t('connect')}</p>
     <div className="flex flex-wrap gap-3">
       <a href="https://github.com/marsen" ...>{t('github')} →</a>
       <a href="mailto:admin@marsen.me" ...>{t('emailMe')} →</a>
     </div>
   </Block>
   ```
   改為：
   ```tsx
   <Block tone="plum">
     <h2 ...>{t('connectTitle')}</h2>
     <p ...>{t('connect')}</p>
     <div className="flex flex-wrap items-start gap-3">
       <a href="https://github.com/marsen" ...>{t('github')} →</a>
       <ContactForm />
     </div>
   </Block>
   ```
   需加：`import ContactForm from '@/presentation/components/ContactForm';`
   `emailMe` 這個翻譯 key 保留在 messages 檔案（`about.emailMe`）但不再被 about/page.tsx 呼叫——不刪除是因為它可能仍被其他地方引用；若確認無其他呼叫點，之後可另外清理死翻譯 key，不在這次範圍內做（避免這次改動牽連到無關的清理工作）。

4. **API / 資料流：不需要改動**
   `src/app/api/contact/route.ts` 現有介面已經是 `{ name, email, message }`，與 `ContactForm`（原 `HeroCta`）送出的 payload 完全一致：

   ```
   ContactForm (About 頁或首頁皆同)
     → POST /api/contact  { name, email, message }
       → 檢查 env.resendApiKey 是否設定，未設定回 503
       → 檢查三欄皆非空，缺漏回 400
       → resend.emails.send({ to: 'admin@marsen.me', replyTo: email, ... })
       → 成功回 { ok: true } / 例外回 500
   ```

   完全沒有「表單是在哪一頁送出」的資訊會傳到後端，所以 API 端不需要任何修改，也不需要區分來源頁面。

5. **i18n 沿用現有 key**
   表單文案繼續讀 `home.*` namespace（`contactNameLabel`、`contactEmailLabel`、`contactPlaceholder`、`contactSubmit` 等），**不新增 `about.*` 對應 key、不搬動翻譯字串**。

   理由：這些字串本來就是通用的表單文案（不是「首頁專屬」的內容），搬動 key 需要同步改動 zh/en 兩份檔案與既有呼叫點，對目前規模的個人網站而言是不必要的風險與工作量，違反 YAGNI/最小改動原則。

   風險：`about/page.tsx` 內同時會出現 `useTranslations('about')`（頁面既有文案）與 `<ContactForm />` 內部各自的 `useTranslations('home')`——兩個 namespace 並存於同一頁面。這是元件封裝的自然結果（`ContactForm` 自己管理自己的文案來源），不是頁面呼叫端需要關心的細節。

### 驗證方式

1. `pnpm lint && pnpm test && pnpm build` 三項皆需通過（憲章「測試 + build 雙重驗證」）
2. 本機 `pnpm dev` 起服務後，手動檢查：
   - `/zh`、`/en` 首頁：CTA 按鈕仍能展開表單並送出（迴歸測試，確保搬移沒壞掉原有功能）
   - `/zh/about`、`/en/about`：底部區塊出現表單、GitHub 連結還在、mailto 連結消失
   - 實際送出一次表單，確認 `admin@marsen.me` 收到 Resend 通知信（沿用既有 `RESEND_API_KEY`，本機 `.env.local` 已有設定）
3. 確認沒有殘留對舊路徑 `@/presentation/components/landing/HeroCta` 的 import（`grep -r` 全專案）

### 為什麼不做的事

- **不做深/淺色雙主題適配**：目前唯一的兩個使用情境（首頁 Hero、About plum 區塊）都是深色背景，做主題切換是過度設計（YAGNI）。若之後真的要放到淺色區塊，屆時再處理，並在元件加上 `Design 待釐清` 一類的記錄。
- **不建立 `shared/` 元件資料夾**：只有一個共用元件時不需要，避免過早分類（DRY 原則：重複兩次才考慮抽取，這裡連「分類」都還談不上）。
- **不動資料庫 / /admin**：已在 story 層級排除，見 [story-20260706-01](../stories/story-20260706-01.md)。

### 開發原則檢查

- 專案 `CLAUDE.md` 明確覆寫全域 Clean Architecture 分層（「不需要 domain / application / infrastructure 層」）——這次改動全部落在 `presentation/components`，符合專案覆寫後的簡化分層。
- 全域憲章 IV（簡單設計 YAGNI + KISS + DRY）：本設計刻意不做主題切換、不預先分資料夾，符合「不確定需要就不做」。
- 全域憲章 V（漸進式交付）：改動範圍小，單一 commit 可完成，符合 baby-step。

## 待釐清

- [ ] About 頁近期會整頁重新設計（story 已記錄），屆時 `tone="plum"` 這個 Block 是否還存在、ContactForm 放置的確切位置可能需要再調整——這次先確保功能正確接上即可
