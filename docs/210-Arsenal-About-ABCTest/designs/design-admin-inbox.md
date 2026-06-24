# Design: 後台收件匣

**來源**：[story-20260621-03](../stories/story-20260621-03.md)

## 新增環境變數

```
ADMIN_PASSWORD        # 後台登入密碼（明文，env 管理）
ADMIN_SESSION_SECRET  # JWT 簽名 secret（至少 32 字元隨機字串）
```

## 套件

`jose`（JWT 簽發與驗證，Edge-compatible）— 與 AI.Did auth guard 相同做法

## 路由結構

```
/admin               → redirect to /admin/inbox（未登入→ /admin/login）
/admin/login         → 登入頁（公開）
/admin/inbox         → 收件匣（需認證）
```

Admin 路由**不加 locale prefix**，獨立於 `[locale]` 之外。

## 認證流程

### 登入

1. `POST /api/admin/login`
2. 以 `crypto.timingSafeEqual` 比對 `ADMIN_PASSWORD`
3. 通過 → 用 `jose` 簽發 JWT，payload：`{ role: 'admin' }`，TTL 7 天
4. 設定 httpOnly cookie：`admin_session`，path `/admin`，SameSite=Strict

### 保護路由（middleware.ts）

- matcher：`/admin/:path*`（排除 `/admin/login`）
- 驗證 `admin_session` cookie：
  - 有效 → 通過
  - 無效 / 過期 / 不存在 → redirect 到 `/admin/login`

## 層次對應

| 層 | 檔案 | 說明 |
|----|------|------|
| Infrastructure | 共用 `DrizzleContactRepository` | 新增 `findAll()`, `markAsRead(id)` |
| API | `src/app/api/admin/login/route.ts` | POST 登入，set cookie |
| API | `src/app/api/admin/contacts/[id]/read/route.ts` | PATCH 標記已讀 |
| App | `src/app/admin/login/page.tsx` | 登入頁（server component + client form） |
| App | `src/app/admin/inbox/page.tsx` | 收件匣（server component，直接讀 DB） |
| Middleware | `middleware.ts` | 擴充現有 middleware，加 admin 保護邏輯 |

## 收件匣頁面

- Server component，直接用 `DrizzleContactRepository.findAll()` 讀取
- 依 `submitted_at` 倒序排列
- 每筆顯示：email、message（截斷超過 200 字）、送出時間、已讀/未讀標記
- 「標記已讀」按鈕 → `PATCH /api/admin/contacts/[id]/read` → 頁面重整（`router.refresh()`）

## IContactRepository 新增方法

```ts
findAll(): Promise<ContactSubmission[]>
markAsRead(id: number): Promise<void>
```

## middleware.ts

新建 `src/middleware.ts`，整合 next-intl routing + admin auth。`src/proxy.ts` 刪除。

```ts
// src/middleware.ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
```

## 待釐清

- [ ] （無）
