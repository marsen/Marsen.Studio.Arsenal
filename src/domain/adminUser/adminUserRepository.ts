import type { AdminUser } from './adminUser';

export type AdminUserRepository = {
  findByUsername(username: string): Promise<AdminUser | null>;
};
