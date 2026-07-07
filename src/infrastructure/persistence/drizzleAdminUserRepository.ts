import { eq } from 'drizzle-orm';
import type { AdminUserRepository } from '@/domain/adminUser/adminUserRepository';
import type { AdminUser } from '@/domain/adminUser/adminUser';
import { createDb, type Db } from '@/infrastructure/db/client';
import { adminUsers } from '@/infrastructure/db/schema';

export class DrizzleAdminUserRepository implements AdminUserRepository {
  private readonly db: Db;

  constructor(db: Db = createDb()) {
    this.db = db;
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    const [row] = await this.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);
    return row ?? null;
  }
}
