# Design: Site Shell

**來源**：[story-20260610-01](../stories/story-20260610-01.md)、[story-20260610-02](../stories/story-20260610-02.md)、[story-20260610-03](../stories/story-20260610-03.md)、[story-20260610-04](../stories/story-20260610-04.md)、[story-20260610-05](../stories/story-20260610-05.md)、[story-20260610-06](../stories/story-20260610-06.md)

## 內容

### Tech Stack

- **框架**：Next.js 16（App Router）+ TypeScript（strict mode）
- **套件管理**：pnpm（corepack）
- **Styling**：Tailwind CSS
- **部署**：TBD（需要 server runtime 以支援 IG Token OAuth callback）

### 路由結構

```
/               首頁
/about          關於我
/demos          作品列表
/demos/[slug]   作品詳細頁
/tools          工具列表
/tools/[slug]   各工具頁（background-removal、heic-to-jpg、ig-token、korean-phonics）
```

Blog 相關路由 TBD，之後補入。

### 資料夾結構

```
src/
  app/
    layout.tsx          全域 layout（nav + footer）
    page.tsx            首頁
    about/
    demos/
      page.tsx
      [slug]/page.tsx
    tools/
      page.tsx
      [slug]/page.tsx   動態路由，載入對應工具元件
  presentation/
    components/
      layouts/          NavBar、Footer
      tools/            各工具 React 元件（從 AI.Did 搬入）
      demos/            作品卡 DemoCard
      ui/               共用 UI 元件
```

### 導覽列（NavBar）

- 左：Logo / 網站名稱
- 右：About、Demos、Tools
- RWD：手機版 hamburger menu

### 工具頁 Template

四個工具共用同一個 `/tools/[slug]` 動態路由，根據 slug 載入對應工具元件。工具元件從 `Marsen.AI.Did` 搬入，路徑：`src/presentation/components/tools/`。

## 待釐清

- [ ] 部署目標：Vercel？Railway？GitHub Pages（需確認 IG Token 方案）
- [ ] 首頁內容：純導覽，還是有簡短自我介紹 hero section？
- [ ] Domain：marsen.me？或沿用 demo.marsen.me 下的子路徑？
