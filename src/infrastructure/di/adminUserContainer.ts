import type { AdminUserRepository } from '@/domain/adminUser/adminUserRepository';
import { DrizzleAdminUserRepository } from '@/infrastructure/persistence/drizzleAdminUserRepository';

export function getAdminUserRepository(): AdminUserRepository {
  return new DrizzleAdminUserRepository();
}
