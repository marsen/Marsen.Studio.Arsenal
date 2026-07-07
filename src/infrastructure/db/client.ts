import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { requireDatabaseUrl } from '@/lib/env';
import * as schema from './schema';

/**
 * 建立 Drizzle DB client（Neon HTTP driver）。
 * 只在後台功能實際被呼叫時建立，公開頁面不需要資料庫連線。
 */
export function createDb() {
  const sql = neon(requireDatabaseUrl());
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createDb>;
