import { NextRequest, NextResponse } from 'next/server'
import { DrizzleContactRepository } from '@/infrastructure/contact/DrizzleContactRepository'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const repo = new DrizzleContactRepository()
  await repo.markAsRead(Number(id))
  return NextResponse.json({ ok: true })
}
