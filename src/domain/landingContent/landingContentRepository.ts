import type { LandingContent } from './landingContent';

export type LandingContentRepository = {
  get(locale: string): Promise<LandingContent | null>;
  save(locale: string, content: LandingContent): Promise<void>;
};
