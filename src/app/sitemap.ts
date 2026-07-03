import type { MetadataRoute } from 'next';
import { requireBaseUrl } from '@/lib/env';
import { routing } from '@/i18n/routing';

const ROUTES = [
  { path: '', priority: 1, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/demos', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/tools', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/tools/background-removal', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/tools/heic-to-jpg', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/tools/korean-phonics', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/tools/ig-token', priority: 0.5, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = requireBaseUrl();

  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}/${routing.defaultLocale}${path}`,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`])
      ),
    },
  }));
}
