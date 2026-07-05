import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';
import Block from '@/presentation/components/layouts/Block';
import ContactForm from '@/presentation/components/ContactForm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.meta' });

  return buildPageMetadata({
    locale,
    path: '/about',
    title: t('title'),
    description: t('description'),
  });
}

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="flex flex-col">
      <Block tone="neutral">
        <h1 className="font-display text-5xl font-bold tracking-tight text-foreground mb-6">
          {t('title')}
        </h1>
        <p className="text-lg leading-relaxed text-foreground/80 max-w-2xl">{t('intro')}</p>
      </Block>

      <Block tone="ghost">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
          {t('storyTitle')}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/70 max-w-2xl">{t('story1')}</p>
        <p className="text-sm leading-relaxed text-foreground/70 max-w-2xl">{t('story2')}</p>
      </Block>

      <Block tone="neutral">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
          {t('philosophyTitle')}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-foreground/70 max-w-2xl">{t('philosophy1')}</p>
        <p className="text-sm leading-relaxed text-foreground/70 max-w-2xl">{t('philosophy2')}</p>
      </Block>

      <Block tone="plum">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
          {t('connectTitle')}
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-foreground/70 max-w-2xl">{t('connect')}</p>
        <div className="flex flex-wrap items-start gap-3">
          <a
            href="https://github.com/marsen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            {t('github')} →
          </a>
          <ContactForm />
        </div>
      </Block>
    </div>
  );
}
