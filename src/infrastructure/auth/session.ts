import { SignJWT, jwtVerify } from 'jose';
import { requireAuthSecret, env } from '@/lib/env';

/**
 * 後台 session token：jose 簽發/驗證的 JWT（HS256），存於 httpOnly cookie。
 * Edge runtime（middleware）相容。
 */

export type SessionPayload = { sub: string };

function getSecret() {
  return new TextEncoder().encode(requireAuthSecret());
}

export async function createSessionToken(subject: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(env.authTokenTtl)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== 'string') return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
