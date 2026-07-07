import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { verifySessionToken } from '@/infrastructure/auth/session';

const intlMiddleware = createMiddleware(routing);

/**
 * /admin/* 走登入守衛（不吃 next-intl，純中文介面），其餘路徑走既有的語系路由。
 * 兩者合併在同一個 proxy 函式裡分流，而非用 matcher 排除 /admin——
 * /admin 跟先前的 /icon、/apple-icon 一樣沒有副檔名，排除式 matcher 容易漏判。
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const token = request.cookies.get('session')?.value;
    const payload = token ? await verifySessionToken(token) : null;
    if (!payload) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // icon/apple-icon are root-level generated routes (no file extension in the URL,
  // unlike robots.txt/sitemap.xml) — exclude them so locale routing doesn't 404 them.
  matcher: '/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)',
};
