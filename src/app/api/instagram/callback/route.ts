import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

const SESSION_COOKIE = 'ig_oauth_session'
const TOOL_PATH = '/tools/ig-token'

interface OAuthSession {
  appId: string
  appSecret: string
  redirectUri: string
}

interface ShortLivedTokenResponse {
  access_token: string
  user_id: number
}

interface LongLivedTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const jar = await cookies()
  const sessionRaw = jar.get(SESSION_COOKIE)?.value

  if (!sessionRaw) {
    return NextResponse.redirect(new URL(`${TOOL_PATH}?error=session_expired`, req.url))
  }

  jar.delete(SESSION_COOKIE)

  let session: OAuthSession
  try {
    session = JSON.parse(Buffer.from(sessionRaw, 'base64').toString()) as OAuthSession
  } catch {
    return NextResponse.redirect(new URL(`${TOOL_PATH}?error=invalid_session`, req.url))
  }

  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL(`${TOOL_PATH}?error=no_code`, req.url))
  }

  // 換 short-lived token
  const formData = new FormData()
  formData.append('client_id', session.appId)
  formData.append('client_secret', session.appSecret)
  formData.append('grant_type', 'authorization_code')
  formData.append('redirect_uri', session.redirectUri)
  formData.append('code', code)

  const shortTokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: formData,
  })

  if (!shortTokenRes.ok) {
    return NextResponse.redirect(new URL(`${TOOL_PATH}?error=token_exchange_failed`, req.url))
  }

  const { access_token: shortToken } = await shortTokenRes.json() as ShortLivedTokenResponse

  // 換 long-lived token
  const longTokenUrl = new URL('https://graph.instagram.com/access_token')
  longTokenUrl.searchParams.set('grant_type', 'ig_exchange_token')
  longTokenUrl.searchParams.set('client_secret', session.appSecret)
  longTokenUrl.searchParams.set('access_token', shortToken)

  const longTokenRes = await fetch(longTokenUrl.toString())

  if (!longTokenRes.ok) {
    return NextResponse.redirect(new URL(`${TOOL_PATH}?error=long_token_failed`, req.url))
  }

  const { access_token: longToken, expires_in } = await longTokenRes.json() as LongLivedTokenResponse

  const baseUrl = env.baseUrl ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const resultUrl = new URL(TOOL_PATH, baseUrl)
  resultUrl.searchParams.set('token', longToken)
  resultUrl.searchParams.set('expires', expires_in.toString())

  return NextResponse.redirect(resultUrl)
}
