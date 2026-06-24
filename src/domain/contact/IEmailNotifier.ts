import type { ContactSubmission } from './ContactSubmission'

export interface IEmailNotifier {
  notifyNewContact(submission: ContactSubmission): Promise<void>
}
