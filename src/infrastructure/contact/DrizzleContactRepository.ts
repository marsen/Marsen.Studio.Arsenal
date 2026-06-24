import { db } from '@/infrastructure/db'
import { contactSubmissions } from '@/infrastructure/db/schema'
import type { IContactRepository } from '@/domain/contact/IContactRepository'
import type { ContactSubmission, NewContactSubmission } from '@/domain/contact/ContactSubmission'
import { desc, eq } from 'drizzle-orm'

export class DrizzleContactRepository implements IContactRepository {
  async save(input: NewContactSubmission): Promise<ContactSubmission> {
    const [row] = await db.insert(contactSubmissions).values(input).returning()
    return row
  }

  async findAll(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.submittedAt))
  }

  async markAsRead(id: number): Promise<void> {
    await db.update(contactSubmissions).set({ isRead: true }).where(eq(contactSubmissions.id, id))
  }
}
