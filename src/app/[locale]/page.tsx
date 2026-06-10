import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
        {t('greeting')}
      </h1>
      <p className="text-muted">{t('tagline')}</p>
      <div className="mt-4 flex gap-4">
        <Link
          href="/demos"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-[#F7F4EE] hover:bg-accent-hover transition-colors"
        >
          {t('viewDemos')}
        </Link>
        <Link
          href="/tools"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
        >
          {t('tools')}
        </Link>
      </div>
    </div>
  );
}
