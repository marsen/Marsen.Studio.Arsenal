import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/lib/env'

const secret = new TextEncoder().encode(env.adminSessionSecret)
const TTL = 60 * 60 * 24 * 7 // 7 days

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${TTL}s`)
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}
