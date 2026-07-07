import { eq } from 'drizzle-orm';
import type { LandingContentRepository } from '@/domain/landingContent/landingContentRepository';
import type { LandingContent } from '@/domain/landingContent/landingContent';
import { createDb, type Db } from '@/infrastructure/db/client';
import { landingContent } from '@/infrastructure/db/schema';
import { env } from '@/lib/env';

/**
 * db 建立延遲到實際呼叫 get/save 時才發生（而非建構時），
 * 讓 get() 能在資料庫尚未設定時明確回傳 null（視同「查無資料」，
 * 呼叫端本來就會處理這個情況），而不需要在上層加 try-catch。
 * 資料庫已設定但連線/查詢本身失敗，則正常往外拋，不吞掉。
 */
export class DrizzleLandingContentRepository implements LandingContentRepository {
  constructor(private readonly dbOverride?: Db) {}

  private getDb(): Db {
    return this.dbOverride ?? createDb();
  }

  async get(locale: string): Promise<LandingContent | null> {
    if (!this.dbOverride && !env.databaseUrl) return null;

    const [row] = await this.getDb()
      .select()
      .from(landingContent)
      .where(eq(landingContent.locale, locale))
      .limit(1);
    return row ? row.data : null;
  }

  async save(locale: string, content: LandingContent): Promise<void> {
    await this.getDb()
      .insert(landingContent)
      .values({ locale, data: content })
      .onConflictDoUpdate({
        target: landingContent.locale,
        set: { data: content, updatedAt: new Date() },
      });
  }
}
