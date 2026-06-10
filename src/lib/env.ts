export const env = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
} as const
