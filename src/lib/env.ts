import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
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
} as const
