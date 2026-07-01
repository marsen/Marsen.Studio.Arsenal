import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground leading-snug max-w-xl mb-4">
          {t('heroHeading')}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{t('heroSub')}</p>
        <a
          href="mailto:admin@marsen.me"
          className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-background hover:bg-accent-hover transition-colors"
        >
          {t('heroCta')}
        </a>
      </section>

      {/* Problem */}
      <section className="py-16 border-t border-border">
        <p className="text-base leading-relaxed text-foreground/70 max-w-2xl">
          {t('problemText')}
        </p>
      </section>

      {/* Solution */}
      <section className="py-16 border-t border-border">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-2">
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
      </section>

      {/* Proof */}
      <section className="py-16 border-t border-border">
        <blockquote className="font-display text-2xl font-semibold text-foreground mb-4 leading-snug">
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
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="text-base text-foreground/70 mb-8">{t('ctaDesc')}</p>
        <a
          href="mailto:admin@marsen.me"
          className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
        >
          {t('ctaButton')}
        </a>
      </section>
    </div>
  );
}
