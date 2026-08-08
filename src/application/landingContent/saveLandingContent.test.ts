import { describe, it, expect } from 'vitest';
import { SaveLandingContent, InvalidLandingContentError } from './saveLandingContent';
import { defaultLandingContent } from '@/domain/landingContent/defaults';
import type { LandingContent } from '@/domain/landingContent/landingContent';
import type { LandingContentRepository } from '@/domain/landingContent/landingContentRepository';

function createFakeRepo(initial: Record<string, LandingContent> = {}) {
  const rows: Record<string, LandingContent> = { ...initial };
  const repo: LandingContentRepository = {
    async get(locale) {
      return rows[locale] ?? null;
    },
    async save(locale, content) {
      rows[locale] = content;
    },
  };
  return { repo, rows };
}

describe('SaveLandingContent', () => {
  it('應該把內容寫入指定語系', async () => {
    const { repo, rows } = createFakeRepo();
    const content = { ...defaultLandingContent.zh, heroCta: '改過的 CTA' };

    await new SaveLandingContent(repo).execute('zh', content);

    expect(rows.zh.heroCta).toBe('改過的 CTA');
  });

  it('應該在另一語系還沒有資料時，用預設值幫它補一列', async () => {
    const { repo, rows } = createFakeRepo();

    await new SaveLandingContent(repo).execute('zh', defaultLandingContent.zh);

    // 兩個語系必須同時存在，否則會一邊讀 DB、一邊讀 defaults.ts
    expect(rows.en).toEqual(defaultLandingContent.en);
  });

  it('應該不覆蓋另一語系已經存在的內容', async () => {
    const edited = { ...defaultLandingContent.en, heroCta: 'Edited in admin' };
    const { repo, rows } = createFakeRepo({ en: edited });

    await new SaveLandingContent(repo).execute('zh', defaultLandingContent.zh);

    expect(rows.en.heroCta).toBe('Edited in admin');
  });

  it('應該在必填欄位留空時丟出錯誤，且不寫入任何語系', async () => {
    const { repo, rows } = createFakeRepo();
    const invalid = { ...defaultLandingContent.zh, heroCta: '   ' };

    await expect(new SaveLandingContent(repo).execute('zh', invalid)).rejects.toBeInstanceOf(
      InvalidLandingContentError
    );
    expect(rows).toEqual({});
  });

  it('應該允許案例不填連結（例如沒有對外站台的 AIris）', async () => {
    const { repo } = createFakeRepo();
    const content: LandingContent = {
      ...defaultLandingContent.zh,
      projects: [{ name: 'AIris', description: '只在 LINE 上服役', tags: [], url: undefined }],
    };

    await expect(new SaveLandingContent(repo).execute('zh', content)).resolves.toBeUndefined();
  });
});
