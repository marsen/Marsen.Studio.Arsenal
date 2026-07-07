import bcrypt from 'bcryptjs';
import type { AdminUser } from '@/domain/adminUser/adminUser';
import type { AdminUserRepository } from '@/domain/adminUser/adminUserRepository';

/**
 * 驗證管理員帳密。帳號需存在、enabled、且 bcrypt 比對通過，回傳該帳號；否則 null。
 * 呼叫端統一回覆「帳號或密碼錯誤」，不區分是哪一項錯，避免帳號列舉。
 */
export async function verifyAdminCredentials(
  repo: AdminUserRepository,
  username: string,
  password: string
): Promise<AdminUser | null> {
  const user = await repo.findByUsername(username);
  if (!user || !user.enabled) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
