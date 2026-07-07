import type { LandingContent } from './landingContent';

/**
 * 資料庫尚無對應 locale 的資料列時使用的預設內容。
 * 內容與目前 messages/{locale}.json 的既有文案一致，
 * 確保後台第一次儲存前，網站行為與現在完全相同。
 */
export const defaultLandingContent: Record<'zh' | 'en', LandingContent> = {
  zh: {
    heroEyebrow: 'AI 開發陪跑',
    heroSlides: [
      { heading: '你早就知道要做什麼了。', sub: '只是不知道怎麼開始。' },
      { heading: '那個想法你放心裡多久了？', sub: '是時候讓它變成真的了。' },
      { heading: '水不冷。', sub: '你只是還沒跳進去。' },
    ],
    heroCta: '讓我推你一把 →',
    servicesTitle: '我們的服務',
    services: [
      { title: 'AI 輔助開發陪跑', desc: '從你的卡點開始，兩小時內用 AI 做出第一個能動的版本。你在場，看著它被造出來。' },
      { title: '技術顧問與架構諮詢', desc: '系統架構設計審查、新創技術顧問、監控與可觀測性建置——用 20 年的工程經驗，陪你一次把系統做對。' },
      { title: '技術工作坊', desc: '資料分析、敏捷開發、Web 安全、前端效能——針對團隊需求客製的實作型工作坊，不是照本宣科。' },
      { title: '工程師職涯健檢', desc: '履歷、作品集、面試準備，一次 30 分鐘，講真話。' },
    ],
    casesTitle: '成功案例',
    projects: [
      {
        name: '工程師的品牌電商',
        description:
          '「一個人能蓋出完整的商業場景嗎？」—— 這個問題催生了 AI.Did。以 AI 為共同開發者，從零打造完整的 B2C 電商：前台支援多主題切換、完整購物流程；後台管理商品、訂單與會員；金流串接 TapPay 信用卡付款。底層採 Clean Architecture，每一層都可以被替換。不是為了賣東西，是為了證明一件事。',
        tags: ['Next.js', 'TypeScript', 'Clean Architecture', 'TapPay', 'Drizzle ORM'],
        url: 'https://marsen-ai-did.vercel.app/',
      },
      {
        name: '衝浪教練的教學網站',
        description:
          '衝浪教練 Becca 不需要複雜的系統，她需要的是讓學員第一眼就想下水的頁面。一頁式前台展示課程方案、教學影片與海外行程；後台讓她自己更新文案與圖片，不用依賴工程師。簡單，但夠用。',
        tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        url: 'https://becca-surf-app.vercel.app/',
      },
      {
        name: '蚵蜊攤商下單小工具',
        description:
          '蛤蜊選物電商 MVP，為實體小農品牌打造的第一個數位門市。以 LIFF 深度整合 LINE 生態系：使用者在 LINE 內完成瀏覽、下單到通知，不需另開 App。前台輕量、後台自助更新，目標是讓品牌主自己能跑，不依賴工程師。',
        tags: ['Next.js', 'TypeScript', 'LIFF', 'LINE', 'Drizzle ORM'],
        url: 'https://amy-clam-site.vercel.app/',
      },
    ],
  },
  en: {
    heroEyebrow: 'AI-ASSISTED CO-BUILDING',
    heroSlides: [
      { heading: "You already know what you want to build.", sub: "You just don't know how to start." },
      { heading: 'How long have you been sitting on that idea?', sub: 'Time to make it real.' },
      { heading: "The water isn't cold.", sub: "You just haven't jumped in yet." },
    ],
    heroCta: "Let me give you a push →",
    servicesTitle: 'Our services',
    services: [
      {
        title: 'AI-Assisted Co-Building',
        desc: "Start with your blocker. In two hours, there's a working first version — built with AI, with you in the room.",
      },
      {
        title: 'Technical & Architecture Consulting',
        desc: 'Architecture reviews, startup advisory, observability setup — 20 years of engineering experience, helping you get it right the first time.',
      },
      {
        title: 'Technical Workshops',
        desc: 'Data analysis, agile practice, web security, frontend performance — hands-on workshops built around what your team actually needs, not a canned syllabus.',
      },
      {
        title: 'Engineer Career Check-up',
        desc: 'Résumé, portfolio, interview prep. 30 minutes, straight talk.',
      },
    ],
    casesTitle: 'Case Studies',
    projects: [
      {
        name: "An Engineer's Brand Store",
        description:
          '"Can one person build a complete commercial product?" — that question drove AI.Did into existence. Built with AI as a co-developer from scratch: a multi-theme storefront with full checkout flow, an admin panel for products, orders, and members, and a real payment integration with TapPay. Clean Architecture underneath so every layer is replaceable. Not built to sell — built to prove a point.',
        tags: ['Next.js', 'TypeScript', 'Clean Architecture', 'TapPay', 'Drizzle ORM'],
        url: 'https://marsen-ai-did.vercel.app/',
      },
      {
        name: "A Surf Coach's Teaching Site",
        description:
          "Surf instructor Becca didn't need a complex system — she needed something that made you want to paddle out the moment you saw it. A single-page front with lesson packages, teaching videos, and overseas trip listings. An admin panel she can update herself without calling a developer. Simple, and exactly enough.",
        tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        url: 'https://becca-surf-app.vercel.app/',
      },
      {
        name: "A Clam Vendor's Order Tool",
        description:
          "An e-commerce MVP for a small-farm clam brand — their first digital storefront. Deep LINE integration via LIFF: users browse, order, and receive notifications entirely inside LINE, no extra app needed. Lightweight storefront, self-serve admin, built so the owner can run it independently without a developer on call.",
        tags: ['Next.js', 'TypeScript', 'LIFF', 'LINE', 'Drizzle ORM'],
        url: 'https://amy-clam-site.vercel.app/',
      },
    ],
  },
};
