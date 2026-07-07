import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

/**
 * /admin/* 是純中文後台介面，不吃 next-intl（見 design-admin-auth.md），
 * 也不在 [locale] 底下，需要自己的根 layout 提供 html/body 與樣式。
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
