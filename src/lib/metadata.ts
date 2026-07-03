import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  zh: 'zh_TW',
};

type PageMetadataInput = {
  locale: string;
  /** Path after the locale segment, e.g. '', '/about', '/demos'. */
  path: string;
  title: string;
  description: string;
};

export function buildPageMetadata({ locale, path, title, description }: PageMetadataInput): Metadata {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`]));

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { ...languages, 'x-default': `/${routing.defaultLocale}${path}` },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      locale: OG_LOCALES[locale] ?? locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
