import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(32),
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
  databaseUrl: _env.DATABASE_URL,
  resendApiKey: _env.RESEND_API_KEY,
  resendFromEmail: _env.RESEND_FROM_EMAIL,
  adminEmail: _env.ADMIN_EMAIL,
  adminPassword: _env.ADMIN_PASSWORD,
  adminSessionSecret: _env.ADMIN_SESSION_SECRET,
} as const
