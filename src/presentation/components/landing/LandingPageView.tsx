import { Fragment, type ReactNode } from 'react';
import type { LandingContent } from '@/domain/landingContent/landingContent';
import Block from '@/presentation/components/layouts/Block';
import HeroCarousel from '@/presentation/components/landing/HeroCarousel';

const WANT_IMAGES = [
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop&auto=format',
];

export type LandingStaticText = {
  wantTitle: string;
  want1Title: string;
  want2Title: string;
  want3Title: string;
  want4Title: string;
  step1: string;
  step2: string;
  step3: string;
  demosSubtitle: string;
  demosTitle: string;
  demosVisit: string;
};

type Props = {
  content: LandingContent;
  staticText: LandingStaticText;
  /** 「查看作品」連結目標。純 href，不依賴 next-intl 的 Link（後台預覽沒有語系路由context）。 */
  demosHref: string;
  /**
   * Hero CTA 區塊——真實頁面用互動式 <ContactForm />，後台即時預覽用非互動的靜態按鈕。
   * 用插槽而非直接內嵌，避免這個共用元件依賴 next-intl context（ContactForm 內部會呼叫 useTranslations）。
   */
  ctaSlot: ReactNode;
  /**
   * 滿版斷裂背景是否撐出真實視窗寬度。公開頁面預設 true；
   * 後台即時預覽面板較窄，撐出視窗寬度會讓內容被裁到畫面外，設 false。
   */
  fullBleed?: boolean;
};

/**
 * 首頁（Landing Page）的實際渲染邏輯，抽成公開頁面與後台即時預覽共用的展示元件。
 * 不呼叫 useTranslations/getTranslations——所有文字皆由呼叫端以 props 傳入，
 * 讓它在有無 next-intl context 的環境都能渲染（見 design-live-preview.md）。
 */
export default function LandingPageView({ content, staticText: s, demosHref, ctaSlot, fullBleed = true }: Props) {
  return (
    <div className="flex flex-col">
      {/* Hero — full viewport */}
      <div
        className={`relative min-h-[70svh] flex items-end ${fullBleed ? 'left-1/2 w-screen -translate-x-1/2' : 'w-full'}`}
        style={{
          background: 'linear-gradient(45deg, #0D0D0F 0%, #1a1040 50%, #0D0D0F 100%)',
        }}
      >
        {/* 內容：貼底 */}
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-0 md:pb-16">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-accent">
            {content.heroEyebrow}
          </p>
          <HeroCarousel slides={content.heroSlides} />
          {ctaSlot}
        </div>
      </div>

      {/* 你有沒有想過？+ 流程 — 斜角疊入 Hero */}
      <div
        className={`relative -mt-10 ${fullBleed ? 'left-1/2 w-screen -translate-x-1/2' : 'w-full'}`}
        style={{
          backgroundColor: '#FAFAF8',
          clipPath: 'polygon(0 48px, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:pb-24">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-10 md:text-4xl">
            {s.wantTitle}
          </h2>

          {/* 4 個問句 — 橫式錯位 */}
          <div className="mb-16 space-y-3">
            {/* 前兩項：左上，右側內縮 */}
            <div className="flex gap-4 md:pr-[22%]">
              {([s.want1Title, s.want2Title] as const).map((title, i) => (
                <div key={i} className="group flex flex-1 items-center cursor-default">
                  <div className="flex items-center gap-3 ml-auto">
                    <p className="font-display text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug md:text-base text-right">
                      {title}
                    </p>
                    <img
                      src={WANT_IMAGES[i]}
                      alt=""
                      className="h-28 w-28 shrink-0 rounded-xl object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 後兩項：右下，左側內縮 */}
            <div className="flex gap-4 md:pl-[22%]">
              {([s.want3Title, s.want4Title] as const).map((title, i) => (
                <div key={i} className="group flex flex-1 items-center cursor-default">
                  <div className="flex items-center gap-3 ml-auto">
                    <p className="font-display text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug md:text-base text-right">
                      {title}
                    </p>
                    <img
                      src={WANT_IMAGES[i + 2]}
                      alt=""
                      className="h-28 w-28 shrink-0 rounded-xl object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 分隔線 */}
          <div className="border-t border-border mb-12" />

          {/* 3 步驟 */}
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {([s.step1, s.step2, s.step3] as const).map((step, i) => (
              <Fragment key={i}>
                <div className="group flex-1 relative overflow-hidden rounded-2xl bg-[#F4F4F2] px-8 py-10">
                  {/* 大數字水印 */}
                  <span className="pointer-events-none absolute -top-2 right-4 select-none font-mono text-[96px] font-bold leading-none text-foreground/[0.06]">
                    {i + 1}
                  </span>
                  {/* 頂部強調線 */}
                  <div className="mb-6 h-0.5 w-8 bg-accent" />
                  {/* 小標 */}
                  <p className="mb-3 font-mono text-xs text-accent">0{i + 1}</p>
                  {/* 步驟文字 */}
                  <p className="font-display relative z-10 text-xl font-semibold leading-snug text-foreground">
                    {step}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex items-center shrink-0 font-mono text-sm text-muted-foreground">
                    &gt;&gt;
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <Block tone="ink" fullBleed={fullBleed}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-10">
          {content.servicesTitle}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {content.services.map((service, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border px-6 py-8 md:px-8 transition-colors hover:border-accent"
            >
              <p className="text-xs text-muted-foreground mb-2">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* Case Studies */}
      <Block tone="ghost" fullBleed={fullBleed}>
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {content.casesTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.demosSubtitle}</p>
          </div>
          <a href={demosHref} className="shrink-0 text-sm font-medium text-accent hover:underline">
            {s.demosTitle} →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {content.projects.map((p, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-border bg-background px-6 py-7 transition-colors hover:border-accent"
            >
              <h3 className="font-display mb-3 text-lg font-semibold leading-snug text-foreground">
                {p.name}
              </h3>
              <p className="mb-4 flex-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((tag, ti) => (
                  <span
                    key={ti}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:underline"
              >
                {s.demosVisit}
              </a>
            </div>
          ))}
        </div>
      </Block>
    </div>
  );
}
