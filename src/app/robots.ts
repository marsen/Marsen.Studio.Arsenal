import type { MetadataRoute } from 'next';
import { requireBaseUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${requireBaseUrl()}/sitemap.xml`,
  };
}
