import { Fragment } from 'react';
import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buildPageMetadata } from '@/lib/metadata';
import Block from '@/presentation/components/layouts/Block';
import ContactForm from '@/presentation/components/ContactForm';
import HeroCarousel from '@/presentation/components/landing/HeroCarousel';

type Project = {
  name: string;
  description: string;
  tags: string[];
  url: string;
};

const SERVICES = [1, 2, 3, 4] as const;

const WANT_IMAGES = [
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop&auto=format',
];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });

  return buildPageMetadata({
    locale,
    path: '',
    title: t('title'),
    description: t('description'),
  });
}

export default function Home() {
  const t = useTranslations('home');
  const tDemos = useTranslations('demos');

  return (
    <div className="flex flex-col">
      {/* Hero — full viewport */}
      <div
        className="relative left-1/2 w-screen -translate-x-1/2 min-h-[70svh] flex items-end"
        style={{
          background: 'linear-gradient(45deg, #0D0D0F 0%, #1a1040 50%, #0D0D0F 100%)',
        }}
      >
        {/* ── 之後換背景素材時：取消下方 video 或 img 的註解，刪掉上面的 gradient ──
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          autoPlay muted loop playsInline
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <img
          src="/hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        ── */}

        {/* 內容：貼底 */}
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-14 pt-0 md:pb-16">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-accent">
            {t('heroEyebrow')}
          </p>
          <HeroCarousel />
          <ContactForm />
        </div>
      </div>

      {/* 你有沒有想過？+ 流程 — 斜角疊入 Hero */}
      <div
        className="relative left-1/2 w-screen -translate-x-1/2 -mt-10"
        style={{
          backgroundColor: '#FAFAF8',
          clipPath: 'polygon(0 48px, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:pb-24">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-10 md:text-4xl">
            {t('wantTitle')}
          </h2>

          {/* 4 個問句 — 橫式錯位 */}
          <div className="mb-16 space-y-3">
            {/* 前兩項：左上，右側內縮 */}
            <div className="flex gap-4 md:pr-[22%]">
              {([1, 2] as const).map((n) => (
                <div key={n} className="group flex flex-1 items-center cursor-default">
                  <div className="flex items-center gap-3 ml-auto">
                    <p className="font-display text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug md:text-base text-right">
                      {t(`want${n}Title`)}
                    </p>
                    {/* 圖片 — 換成 <img src="你的圖片"> */}
                    <img
                      src={WANT_IMAGES[n - 1]}
                      alt=""
                      className="h-28 w-28 shrink-0 rounded-xl object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 後兩項：右下，左側內縮 */}
            <div className="flex gap-4 md:pl-[22%]">
              {([3, 4] as const).map((n) => (
                <div key={n} className="group flex flex-1 items-center cursor-default">
                  <div className="flex items-center gap-3 ml-auto">
                    <p className="font-display text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-snug md:text-base text-right">
                      {t(`want${n}Title`)}
                    </p>
                    <img
                      src={WANT_IMAGES[n - 1]}
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
            {([1, 2, 3] as const).map((n) => (
              <Fragment key={n}>
                <div className="group flex-1 relative overflow-hidden rounded-2xl bg-[#F4F4F2] px-8 py-10">
                  {/* 大數字水印 */}
                  <span className="pointer-events-none absolute -top-2 right-4 select-none font-mono text-[96px] font-bold leading-none text-foreground/[0.06]">
                    {n}
                  </span>
                  {/* 頂部強調線 */}
                  <div className="mb-6 h-0.5 w-8 bg-accent" />
                  {/* 小標 */}
                  <p className="mb-3 font-mono text-xs text-accent">0{n}</p>
                  {/* 步驟文字 */}
                  <p className="font-display relative z-10 text-xl font-semibold leading-snug text-foreground">
                    {t(`step${n}`)}
                  </p>
                </div>
                {n < 3 && (
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
      <Block tone="ink">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-10">
          {t('servicesTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICES.map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border px-6 py-8 md:px-8 transition-colors hover:border-accent"
            >
              <p className="text-xs text-muted-foreground mb-2">{String(n).padStart(2, '0')}</p>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {t(`service${n}Title`)}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t(`service${n}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </Block>

      {/* Case Studies */}
      <Block tone="ghost">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {t('casesTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{tDemos('subtitle')}</p>
          </div>
          <Link
            href="/demos"
            className="shrink-0 text-sm font-medium text-accent hover:underline"
          >
            {tDemos('title')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(tDemos.raw('projects') as Project[]).map((p) => (
            <div
              key={p.name}
              className="flex flex-col rounded-2xl border border-border bg-background px-6 py-7 transition-colors hover:border-accent"
            >
              <h3 className="font-display mb-3 text-lg font-semibold leading-snug text-foreground">
                {p.name}
              </h3>
              <p className="mb-4 flex-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
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
                {tDemos('visit')}
              </a>
            </div>
          ))}
        </div>
      </Block>

    </div>
  );
}
