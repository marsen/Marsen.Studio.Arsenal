import { cookies } from 'next/headers';
import type { AdminUser } from '@/domain/adminUser/adminUser';
import { verifySessionToken } from './session';
import { getAdminUserRepository } from '@/infrastructure/di/adminUserContainer';

/**
 * 由 session cookie 取得目前登入的管理員（找不到/無效則 null）。
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return getAdminUserRepository().findByUsername(payload.sub);
}
