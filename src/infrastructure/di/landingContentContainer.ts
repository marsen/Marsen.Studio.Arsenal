import type { LandingContentRepository } from '@/domain/landingContent/landingContentRepository';
import { DrizzleLandingContentRepository } from '@/infrastructure/persistence/drizzleLandingContentRepository';

export function getLandingContentRepository(): LandingContentRepository {
  return new DrizzleLandingContentRepository();
}
