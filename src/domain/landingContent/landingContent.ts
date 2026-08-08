export type HeroSlide = {
  heading: string;
  sub: string;
};

export type Service = {
  title: string;
  desc: string;
};

export type Project = {
  name: string;
  description: string;
  tags: string[];
  /** 公開網址。沒有對外站台的案例（例如只在 LINE 上服役的 AIris）留空。 */
  url?: string;
  /** 預覽圖路徑（public/ 下的靜態檔）。舊資料可能沒有，缺少時作品頁不顯示圖片區。 */
  image?: string;
  /** 誠實標示這個案例的份量：技術驗證／為真實需求而做／每天在用。 */
  badge?: string;
};

export type LandingContent = {
  heroEyebrow: string;
  heroSlides: HeroSlide[];
  heroCta: string;
  servicesTitle: string;
  services: Service[];
  casesTitle: string;
  projects: Project[];
};
