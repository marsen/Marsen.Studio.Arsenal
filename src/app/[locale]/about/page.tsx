import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display mb-8 text-3xl font-bold">{t('title')}</h1>

      <p className="mb-16 text-lg leading-relaxed text-foreground/80">{t('intro')}</p>

      <section className="mb-12">
        <h2 className="font-display mb-4 text-xl font-semibold tracking-tight">{t('storyTitle')}</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/70">{t('story1')}</p>
        <p className="text-sm leading-relaxed text-foreground/70">{t('story2')}</p>
      </section>

      <section className="mb-12">
        <h2 className="font-display mb-4 text-xl font-semibold tracking-tight">{t('philosophyTitle')}</h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/70">{t('philosophy1')}</p>
        <p className="text-sm leading-relaxed text-foreground/70">{t('philosophy2')}</p>
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-semibold tracking-tight">{t('connectTitle')}</h2>
        <p className="mb-6 text-sm leading-relaxed text-foreground/70">{t('connect')}</p>
        <a
          href="https://github.com/marsen"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
        >
          {t('github')} →
        </a>
      </section>
    </div>
  );
}
