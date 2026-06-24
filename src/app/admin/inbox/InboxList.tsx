'use client'

import { useRouter } from 'next/navigation'
import type { ContactSubmission } from '@/domain/contact/ContactSubmission'

export function InboxList({ submissions }: { submissions: ContactSubmission[] }) {
  const router = useRouter()

  if (submissions.length === 0) {
    return <p className="text-sm text-foreground/50">還沒有任何聯絡。</p>
  }

  async function markAsRead(id: number) {
    await fetch(`/api/admin/contacts/${id}/read`, { method: 'PATCH' })
    router.refresh()
  }

  return (
    <ul className="flex flex-col gap-4">
      {submissions.map((s) => (
        <li
          key={s.id}
          className={`rounded-lg border p-4 ${s.isRead ? 'border-foreground/10 opacity-60' : 'border-foreground/30'}`}
        >
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-sm font-medium">{s.name}・{s.email}</span>
            <span className="text-xs text-foreground/40">
              {new Date(s.submittedAt).toLocaleString('zh-TW')}
            </span>
          </div>
          <p className="mb-3 text-sm text-foreground/70">{s.message}</p>
          {!s.isRead && (
            <button
              onClick={() => markAsRead(s.id)}
              className="text-xs text-accent hover:underline"
            >
              標記已讀
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
