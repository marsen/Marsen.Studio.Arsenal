import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import type { LandingContent } from '@/domain/landingContent/landingContent';

/**
 * 後台管理員帳號。單人網站，不需要 role/權限分級（YAGNI，見 design-admin-auth.md）。
 */
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 首頁（Landing Page）內容，一個 locale 一份文件（單例，見 design-landing-content-cms.md）。
 */
export const landingContent = pgTable('landing_content', {
  locale: text('locale').primaryKey(),
  data: jsonb('data').$type<LandingContent>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
