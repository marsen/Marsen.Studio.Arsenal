import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { signAdminToken } from '@/lib/auth/session'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const expected = Buffer.from(env.adminPassword)
  const received = Buffer.from(typeof password === 'string' ? password : '')
  const valid =
    expected.length === received.length && timingSafeEqual(expected, received)

  if (!valid) {
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 })
  }

  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/admin',
    maxAge: 60 * 60 * 24 * 7,
    secure: env.isProduction,
  })
  return res
}
