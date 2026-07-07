import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GetLandingContent } from '@/application/landingContent/getLandingContent';
import { getLandingContentRepository } from '@/infrastructure/di/landingContentContainer';
import { AdminNav } from '@/presentation/components/admin/AdminNav';
import { ContentEditor } from '@/presentation/components/admin/ContentEditor';
import type { LandingStaticText } from '@/presentation/components/landing/LandingPageView';

export const metadata: Metadata = {
  title: '編輯首頁內容',
  robots: { index: false },
};

// 後台編輯器必須每次載入最新內容，不可靜態烘焙
export const dynamic = 'force-dynamic';

async function loadStaticText(locale: 'zh' | 'en'): Promise<LandingStaticText> {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tDemos = await getTranslations({ locale, namespace: 'demos' });
  return {
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
}

export default async function AdminContentPage() {
  const useCase = new GetLandingContent(getLandingContentRepository());
  const [zh, en, staticTextZh, staticTextEn] = await Promise.all([
    useCase.execute('zh'),
    useCase.execute('en'),
    loadStaticText('zh'),
    loadStaticText('en'),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminNav />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">編輯首頁內容</h1>
        <ContentEditor
          initial={{ zh, en }}
          staticText={{ zh: staticTextZh, en: staticTextEn }}
        />
      </main>
    </div>
  );
}
