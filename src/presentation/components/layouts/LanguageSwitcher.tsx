'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const next = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggle}
      className="text-sm text-muted-foreground hover:text-accent transition-colors"
    >
      {locale === 'en' ? '中文' : 'EN'}
    </button>
  );
}
