'use server';

import { revalidatePath } from 'next/cache';
import type { LandingContent } from '@/domain/landingContent/landingContent';
import { SaveLandingContent, InvalidLandingContentError } from '@/application/landingContent/saveLandingContent';
import { getLandingContentRepository } from '@/infrastructure/di/landingContentContainer';

export type SaveLandingContentState = { error?: string; success?: boolean };

/**
 * 儲存首頁內容（後台，受 middleware 保護）。存檔即生效：
 * 寫入 DB 後立即 revalidate 首頁與 /demos 頁（案例卡片資料共用）。
 */
export async function saveLandingContentAction(
  locale: 'zh' | 'en',
  content: LandingContent
): Promise<SaveLandingContentState> {
  try {
    await new SaveLandingContent(getLandingContentRepository()).execute(locale, content);
  } catch (err) {
    if (err instanceof InvalidLandingContentError) {
      return { error: err.message };
    }
    throw err;
  }

  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}/demos`);
  return { success: true };
}
