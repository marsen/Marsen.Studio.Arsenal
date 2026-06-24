import { DrizzleContactRepository } from '@/infrastructure/contact/DrizzleContactRepository'
import { InboxList } from './InboxList'

export const dynamic = 'force-dynamic'

export default async function AdminInboxPage() {
  const repo = new DrizzleContactRepository()
  const submissions = await repo.findAll()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">收件匣</h1>
      <InboxList submissions={submissions} />
    </div>
  )
}
