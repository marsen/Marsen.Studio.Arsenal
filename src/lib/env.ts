import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
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
} as const
