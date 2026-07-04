import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // icon/apple-icon are root-level generated routes (no file extension in the URL,
  // unlike robots.txt/sitemap.xml) — exclude them so locale routing doesn't 404 them.
  matcher: '/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)',
};
