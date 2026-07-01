import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Block from '@/presentation/components/layouts/Block';

const SERVICES = [1, 2, 3, 4] as const;

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <Block tone="neutral">
        <p className="text-xs font-medium tracking-widest text-accent mb-4">{t('heroEyebrow')}</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-2xl mb-6">
          {t('heroHeading')}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{t('heroSub')}</p>
        <a
          href="mailto:admin@marsen.me"
          className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-background hover:bg-accent-hover transition-colors"
        >
          {t('heroCta')}
        </a>
      </Block>

      {/* Services */}
      <Block tone="forest">
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

      {/* Problem */}
      <Block tone="neutral">
        <p className="text-base leading-relaxed text-foreground/70 max-w-2xl">
          {t('problemText')}
        </p>
      </Block>

      {/* Solution */}
      <Block tone="steel">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2">
          {t('solutionTitle')}
        </h2>
        <p className="text-base text-foreground/70 mb-10">{t('solutionDesc')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="text-xs text-muted-foreground mb-2">01</p>
            <p className="font-medium text-foreground mb-2">{t('step1')}</p>
            <p className="text-sm text-foreground/60 leading-relaxed">{t('step1Desc')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">02</p>
            <p className="font-medium text-foreground mb-2">{t('step2')}</p>
            <p className="text-sm text-foreground/60 leading-relaxed">{t('step2Desc')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">03</p>
            <p className="font-medium text-foreground mb-2">{t('step3')}</p>
            <p className="text-sm text-foreground/60 leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </Block>

      {/* Proof */}
      <Block tone="plum">
        <blockquote className="font-display text-3xl font-bold text-foreground mb-4 leading-snug">
          {t('proofQuote')}
        </blockquote>
        <p className="text-sm text-muted-foreground mb-1">{t('proofName')}</p>
        <p className="text-sm text-foreground/60 mb-8">{t('proofDesc')}</p>
        <Link
          href="/demos"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          {t('proofCta')}
        </Link>
      </Block>

      {/* CTA */}
      <Block tone="amber">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="text-base text-foreground/70 mb-8">{t('ctaDesc')}</p>
        <a
          href="mailto:admin@marsen.me"
          className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
        >
          {t('ctaButton')}
        </a>
      </Block>
    </div>
  );
}
