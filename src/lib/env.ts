import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_TOKEN_TTL: z.string().min(1).optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const missing = Object.keys(parsed.error.flatten().fieldErrors)
  throw new Error(`[env] Invalid environment variables: ${missing.join(', ')}`)
}

const _env = parsed.data

export const env = {
  baseUrl: _env.NEXT_PUBLIC_BASE_URL,
  isProduction: _env.NODE_ENV === 'production',
  resendApiKey: _env.RESEND_API_KEY,
  resendFromEmail: _env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
  databaseUrl: _env.DATABASE_URL,
  authSecret: _env.AUTH_SECRET,
  authTokenTtl: _env.AUTH_TOKEN_TTL ?? '7d',
} as const

/**
 * SEO 相關功能（sitemap、robots、canonical URL）需要明確設定的網站網址。
 * 不提供程式碼內建預設值——沒設定就 fail fast，避免用錯網址被默默蓋掉。
 */
export function requireBaseUrl(): string {
  if (!env.baseUrl) {
    throw new Error(
      '[env] NEXT_PUBLIC_BASE_URL is required for SEO metadata (sitemap/robots/canonical URLs). ' +
        'Set it in .env.local for local dev, or in Vercel project settings for deployments.'
    )
  }
  return env.baseUrl
}

/**
 * 後台功能（登入、內容管理）需要資料庫連線。
 * 不提供預設值——沒設定就 fail fast，公開頁面不受影響（不需要資料庫）。
 */
export function requireDatabaseUrl(): string {
  if (!env.databaseUrl) {
    throw new Error(
      '[env] DATABASE_URL is required for admin features (login/content management). ' +
        'Set it in .env.local for local dev, or in Vercel project settings for deployments.'
    )
  }
  return env.databaseUrl
}

/**
 * 後台 session 簽章金鑰。同樣只在後台功能被實際呼叫時才要求存在。
 */
export function requireAuthSecret(): string {
  if (!env.authSecret) {
    throw new Error(
      '[env] AUTH_SECRET is required for admin session signing. ' +
        'Set it in .env.local for local dev, or in Vercel project settings for deployments.'
    )
  }
  return env.authSecret
}
