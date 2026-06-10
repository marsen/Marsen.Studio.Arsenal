import { useTranslations } from 'next-intl';

export default function ToolsPage() {
  const t = useTranslations();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {t('tools.title')}
      </h1>
      <p className="mt-4 text-muted">{t('common.comingSoon')}</p>
    </div>
  );
}
