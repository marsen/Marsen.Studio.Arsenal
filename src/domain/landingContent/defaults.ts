import type { LandingContent } from './landingContent';

/**
 * 佔位內容——不是網站文案。
 *
 * 首頁與作品頁的實際文案存在資料庫（後台 /admin/content 編輯），DB 是唯一來源。
 * 這份只在「讀不到 DB」時撐住版面，讓頁面不至於空白或崩掉：
 *   1. 本機開發沒設定 DATABASE_URL（repository 會直接回 null）
 *   2. 新環境 / preview deployment，資料表還沒建起來
 *   3. SaveLandingContent 幫還沒有資料列的另一語系補列時的初始內容
 *
 * 刻意寫成一眼看得出是佔位字：畫面上出現這些字，就代表沒讀到 DB。
 * 不要把真文案複製回來——那樣會變成兩份會各自漂移的內容，正是這裡要避免的。
 *
 * 各陣列的長度必須維持真實內容的數量（3 張輪播、4 個服務、4 個案例）：
 * 後台編輯器只能編輯既有項目，不能新增或刪除，數量一旦少了就補不回去。
 */
const placeholderZh = '（佔位內容——未讀取到資料庫）';
const placeholderEn = '(Placeholder — no database content)';

export const defaultLandingContent: Record<'zh' | 'en', LandingContent> = {
  zh: {
    heroEyebrow: placeholderZh,
    heroSlides: [
      { heading: '尚未載入內容', sub: placeholderZh },
      { heading: '尚未載入內容', sub: placeholderZh },
      { heading: '尚未載入內容', sub: placeholderZh },
    ],
    heroCta: '（未設定按鈕文字）',
    servicesTitle: '（未設定服務區塊標題）',
    services: [
      { title: '服務 1', desc: placeholderZh },
      { title: '服務 2', desc: placeholderZh },
      { title: '服務 3', desc: placeholderZh },
      { title: '服務 4', desc: placeholderZh },
    ],
    casesTitle: '（未設定案例區塊標題）',
    projects: [
      { name: '案例 1', description: placeholderZh, tags: [] },
      { name: '案例 2', description: placeholderZh, tags: [] },
      { name: '案例 3', description: placeholderZh, tags: [] },
      { name: '案例 4', description: placeholderZh, tags: [] },
    ],
  },
  en: {
    heroEyebrow: placeholderEn,
    heroSlides: [
      { heading: 'Content not loaded', sub: placeholderEn },
      { heading: 'Content not loaded', sub: placeholderEn },
      { heading: 'Content not loaded', sub: placeholderEn },
    ],
    heroCta: '(No CTA label set)',
    servicesTitle: '(No services title set)',
    services: [
      { title: 'Service 1', desc: placeholderEn },
      { title: 'Service 2', desc: placeholderEn },
      { title: 'Service 3', desc: placeholderEn },
      { title: 'Service 4', desc: placeholderEn },
    ],
    casesTitle: '(No cases title set)',
    projects: [
      { name: 'Case 1', description: placeholderEn, tags: [] },
      { name: 'Case 2', description: placeholderEn, tags: [] },
      { name: 'Case 3', description: placeholderEn, tags: [] },
      { name: 'Case 4', description: placeholderEn, tags: [] },
    ],
  },
};
