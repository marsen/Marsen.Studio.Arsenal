import type { ContactSubmission, NewContactSubmission } from './ContactSubmission'

export interface IContactRepository {
  save(submission: NewContactSubmission): Promise<ContactSubmission>
  findAll(): Promise<ContactSubmission[]>
  markAsRead(id: number): Promise<void>
}
