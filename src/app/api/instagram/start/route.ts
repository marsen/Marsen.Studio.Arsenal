import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

const SESSION_COOKIE = 'ig_oauth_session'
const MAX_AGE = 60 * 5 // 5 分鐘

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json() as { appId?: string; appSecret?: string }
  const { appId, appSecret } = body

  if (!appId || !appSecret) {
    return NextResponse.json({ error: 'Missing appId or appSecret' }, { status: 400 })
  }

  const baseUrl = env.baseUrl ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const redirectUri = `${baseUrl}/api/instagram/callback`

  const session = Buffer.from(JSON.stringify({ appId, appSecret, redirectUri })).toString('base64')

  const authUrl = new URL('https://www.instagram.com/oauth/authorize')
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_content_publish')

  const jar = await cookies()
  jar.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })

  return NextResponse.json({ authUrl: authUrl.toString() })
}
