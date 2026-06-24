import type { IContactRepository } from '@/domain/contact/IContactRepository'
import type { IEmailNotifier } from '@/domain/contact/IEmailNotifier'
import type { NewContactSubmission } from '@/domain/contact/ContactSubmission'

export class SubmitContactUseCase {
  constructor(
    private readonly repo: IContactRepository,
    private readonly notifier: IEmailNotifier,
  ) {}

  async execute(input: NewContactSubmission): Promise<void> {
    const submission = await this.repo.save(input)
    await this.notifier.notifyNewContact(submission)
  }
}
