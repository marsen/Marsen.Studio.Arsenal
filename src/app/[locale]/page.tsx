import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/metadata';
import { GetLandingContent } from '@/application/landingContent/getLandingContent';
import { getLandingContentRepository } from '@/infrastructure/di/landingContentContainer';
import ContactForm from '@/presentation/components/ContactForm';
import LandingPageView, { type LandingStaticText } from '@/presentation/components/landing/LandingPageView';

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

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const localeKey = locale === 'zh' ? 'zh' : 'en';
  const content = await new GetLandingContent(getLandingContentRepository()).execute(localeKey);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tDemos = await getTranslations({ locale, namespace: 'demos' });

  const staticText: LandingStaticText = {
    wantTitle: t('wantTitle'),
    want1Title: t('want1Title'),
    want2Title: t('want2Title'),
    want3Title: t('want3Title'),
    want4Title: t('want4Title'),
    step1: t('step1'),
    step2: t('step2'),
    step3: t('step3'),
    demosSubtitle: tDemos('subtitle'),
    demosTitle: tDemos('title'),
    demosVisit: tDemos('visit'),
  };

  return (
    <LandingPageView
      content={content}
      staticText={staticText}
      demosHref={`/${locale}/demos`}
      ctaSlot={<ContactForm ctaLabel={content.heroCta} />}
    />
  );
}
