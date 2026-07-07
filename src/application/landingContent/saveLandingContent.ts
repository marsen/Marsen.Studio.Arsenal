import type { LandingContentRepository } from '@/domain/landingContent/landingContentRepository';
import type { LandingContent } from '@/domain/landingContent/landingContent';

export class InvalidLandingContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLandingContentError';
  }
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) throw new InvalidLandingContentError(`${field} 不可留空`);
}

/**
 * 驗證必填欄位皆非空字串，通過才寫入。任一欄位空白時丟出
 * InvalidLandingContentError，呼叫端（Server Action）轉成使用者看得懂的錯誤訊息。
 */
function validate(content: LandingContent): void {
  assertNonEmpty(content.heroEyebrow, 'Hero 標語小標');
  assertNonEmpty(content.heroCta, 'Hero CTA 文字');
  content.heroSlides.forEach((slide, i) => {
    assertNonEmpty(slide.heading, `輪播 ${i + 1} 標題`);
    assertNonEmpty(slide.sub, `輪播 ${i + 1} 副標`);
  });
  assertNonEmpty(content.servicesTitle, '服務區塊標題');
  content.services.forEach((service, i) => {
    assertNonEmpty(service.title, `服務 ${i + 1} 標題`);
    assertNonEmpty(service.desc, `服務 ${i + 1} 描述`);
  });
  assertNonEmpty(content.casesTitle, '案例區塊標題');
  content.projects.forEach((project, i) => {
    assertNonEmpty(project.name, `案例 ${i + 1} 名稱`);
    assertNonEmpty(project.description, `案例 ${i + 1} 描述`);
    assertNonEmpty(project.url, `案例 ${i + 1} 連結`);
  });
}

export class SaveLandingContent {
  constructor(private readonly repo: LandingContentRepository) {}

  async execute(locale: 'zh' | 'en', content: LandingContent): Promise<void> {
    validate(content);
    await this.repo.save(locale, content);
  }
}
