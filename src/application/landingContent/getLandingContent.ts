import type { LandingContentRepository } from '@/domain/landingContent/landingContentRepository';
import type { LandingContent } from '@/domain/landingContent/landingContent';
import { defaultLandingContent } from '@/domain/landingContent/defaults';

/**
 * 取得指定語系的首頁內容；資料庫尚無對應資料時（含資料庫尚未設定的情況，
 * 見 DrizzleLandingContentRepository）回傳預設內容（現有靜態文案）。
 * 只處理這個已知情境，其餘意外錯誤不攔截，讓它自然往上拋。
 */
export class GetLandingContent {
  constructor(private readonly repo: LandingContentRepository) {}

  async execute(locale: 'zh' | 'en'): Promise<LandingContent> {
    return (await this.repo.get(locale)) ?? defaultLandingContent[locale];
  }
}
