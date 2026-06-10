@AGENTS.md

# Marsen.Studio.Arsenal - 個人作品集

> 此檔案會在每次 Claude Code 啟動時自動載入。

## 專案概述

個人作品集網站，包含作品展示（Demos）與日常小工具（Tools）。採用「先討論再動手」的開發方式。

## 技術棧

- **框架**：Next.js 16 (App Router) + TypeScript strict mode
- **樣式**：Tailwind CSS v4
- **套件管理**：pnpm
- **i18n**：next-intl（/en/、/zh/ URL routing，瀏覽器語言自動偵測）
- **字型**：Fraunces（標題）、Geist / Geist Mono（內文）
- **測試**：Vitest（單元測試）
- **程式碼風格**：ESLint + Prettier

## 架構

精簡版分層，依賴方向：`app → presentation → lib`

- `app/[locale]/` — Next.js 路由（頁面）
- `app/api/` — API Routes（外部回調，如 Instagram OAuth）
- `presentation/components/` — React 元件
- `presentation/lib/` — 前端工具函式
- `lib/` — 純工具函式（hangul、env）
- `messages/` — i18n 翻譯文字（en.json、zh.json）

> **不需要** domain / application / infrastructure 層，目前沒有資料庫或複雜業務邏輯。

## 開發流程

與 Marsen.AI.Did 相同：`/flow:pbi → /flow:spec → /flow:design → 實作`

## 版本控制規範

- **禁止直接在 main 上 commit**，所有變更必須走 feature branch
- 分支命名：`<type>/短名稱`（例：`feat/demos-page`、`fix/bg-remover-coi`）
- Commit 格式：Conventional Commits（`feat:`、`fix:`、`docs:` 等）
- 合併方式：`git merge`（產生 merge commit）

## 命名慣例

| 對象 | 慣例 | 範例 |
|---|---|---|
| 檔案（元件） | PascalCase | `BackgroundRemover.tsx` |
| 檔案（非元件） | camelCase | `heic.ts`、`env.ts` |
| 資料夾 | kebab-case | `korean-phonics/`、`background-removal/` |
| TypeScript 型別 | PascalCase | `Quality`、`FormState` |
| 常數 | UPPER_SNAKE_CASE | `MAX_FILES`、`SESSION_COOKIE` |
| Interface | 不加 `I` 前綴 | `OAuthSession`（不是 `IOAuthSession`） |

## 環境變數規範

- 集中在 `src/lib/env.ts`，以 Zod schema 驗證，模組載入時即執行
- 各模組 import `env`，不直接存取 `process.env`
- `NEXT_PUBLIC_` 前綴僅限 Client Component 使用

## 測試規範

- 測試框架：Vitest
- 檔案放置：Co-location（測試與原始碼同層）
- 命名：`*.test.ts` / `*.test.tsx`
- 測試描述：中文，`describe('類別名')` + `it('應該做什麼')`

## AI 協作準則

- 溝通語言：中文
- 架構決策記錄在 `docs/` 而非 CLAUDE.md
- CLAUDE.md 只保留規範與指引

## 常用指令

```bash
pnpm dev      # 啟動開發伺服器
pnpm build    # 正式環境建置（確認無 type error）
pnpm lint     # 執行 linter
pnpm test     # 執行測試
```

## 進度與工作項

工作項一律記錄在 **GitHub Backlog**（`marsen/Marsen.Backlog`），本專案 issue 加 `[Marsen.Studio.Arsenal]` 前綴，母工作項為 [#202](https://github.com/marsen/Marsen.Backlog/issues/202)。
