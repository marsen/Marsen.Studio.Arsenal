# Design: 後台管理員登入

**來源**：[story-20260706-01](../stories/story-20260706-01.md)

## 內容

### 為什麼跟隨 Becca.Surf.App 的模式

Becca 已經解決過完全一樣的問題（單人／少量管理員、Neon + Drizzle、後台 session），程式碼與資料表結構可以直接參考複製，不用重新設計。這裡列出對應關係與 Arsenal 的簡化調整。

### 分層（首次在 Arsenal 引入 Clean Architecture）

```
src/
  domain/adminUser/
    adminUser.ts              # AdminUser 型別（純資料）
    adminUserRepository.ts    # port（interface）
  application/adminUser/
    verifyAdminCredentials.ts # 帳密核對 use case
  infrastructure/
    db/
      client.ts                     # Neon + Drizzle client（複製 Becca 寫法）
      schema.ts                     # drizzle schema
    auth/
      session.ts                    # jose 簽發/驗證 JWT
      currentAdmin.ts                # 由 cookie 取得目前登入者
    persistence/
      drizzleAdminUserRepository.ts # port 的 DB 實作
    di/
      adminUserContainer.ts         # 組裝 repository 實例（依循 Becca 的 DI 慣例）
  app/
    admin/
      page.tsx           # 後台首頁（登入後導向的落地頁）
      login/page.tsx      # 登入頁（不需要 next-intl 語系前綴，見下）
    actions/
      auth.ts             # loginAction / logoutAction（Server Actions）
  proxy.ts                # 路由守衛：擴充既有 i18n middleware，加入 /admin 分支
```

### 與 Becca 的差異（刻意簡化）

- **不做 role/多帳號權限**：Becca 的 `adminUsers.role`（'super' | 'admin'）是因為它有真的多人協作情境；Arsenal 目前確定「只有 Marsen 一個帳號」（story 已載明），`role` 欄位這次不建，避免用不到的欄位（YAGNI）。若日後真的要開放第二個帳號，再評估要不要加。
- **後台介面不吃 next-intl**：`/admin/*` 是純中文介面（Marsen 自己用），不放在 `[locale]` 路由下，也不需要 `useTranslations`。這跟前台的雙語系需求是兩回事。

### 資料表

```ts
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

帳號透過 `pnpm db:seed`（比照 Becca/AI.Did 既有慣例）建立第一筆，密碼用 bcryptjs 雜湊後存入，不落地明碼（憲章 VII 資安原則）。

### 登入流程

1. `POST` 表單（Server Action `loginAction`）帶 `username` + `password`
2. `verifyAdminCredentials`：`repo.findByUsername` → 找不到或 `enabled=false` 回 null → `bcrypt.compare` 比對雜湊
3. 驗證失敗：回傳統一錯誤訊息「帳號或密碼錯誤」（不區分帳號不存在還是密碼錯，避免帳號列舉，對應 story 的業務規則）
4. 驗證成功：`createSessionToken(username)`（jose 簽發 JWT，`HS256`，`sub=username`），寫入 `httpOnly` + `secure`（正式環境）+ `sameSite=lax` cookie
5. 導向登入前原本要去的頁面（`redirect` query 參數，需檢查是站內絕對路徑，避免 open redirect，比照 Becca 的 `safeRedirect`）

### Session 有效期間（回應 story 的待釐清）

跟隨 Becca：7 天（`60 * 60 * 24 * 7` 秒）。單人後台、非高敏感金融操作，7 天在「不用一直重登入」與「session 太久沒人管」之間是合理折衷。到期後導回登入頁重新輸入帳密即可，不做 refresh token 之類的複雜機制（YAGNI）。

### 路由守衛（回應 story：未登入不能進後台）

擴充現有 `src/proxy.ts`（目前只跑 next-intl 的 `createMiddleware(routing)`）：

```ts
export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const token = request.cookies.get('session')?.value;
    const payload = token ? await verifySessionToken(token) : null;
    if (!payload) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  return intlMiddleware(request); // 既有的 next-intl middleware
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)'],
};
```

`/admin` 路徑本來就沒有副檔名，原本會被既有 matcher 排除邏輯誤判成一般頁面（跟先前 `/icon`、`/apple-icon` 踩過的坑一樣）——這次直接在 middleware 函式內部分流處理，不靠 matcher 排除，兩種情境都在同一個檔案內決斷。

### 登入失敗次數限制（回應 story 的待釐清）

**這次不做**。理由：
- 單一帳號、非公開註冊，暴力破解的實際風險遠低於多租戶系統
- bcrypt 本身的計算成本已經是暴力破解的天然阻力
- 加限流/鎖定機制需要額外的狀態儲存（例如 Redis 或 DB 記錄失敗次數），對目前威脅模型是過度工程
若之後真的觀察到異常登入嘗試，再視情況加 rate limit（例如用 Vercel 的 edge middleware 做簡單 IP 限流）。

### 忘記密碼（回應 story 的待釐清）

**這次不做自助復原**。密碼寫死由 `db:seed`／手動 SQL 更新，Marsen 本人可直接操作資料庫重設。單人系統加一套忘記密碼的 email 驗證流程，複雜度不成比例（YAGNI）。

## 待釐清
- [ ] 無（story 中列的三項待釐清皆已在上方回應）
