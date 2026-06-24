import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { SubmitContactUseCase } from '@/application/contact/SubmitContactUseCase'
import { DrizzleContactRepository } from '@/infrastructure/contact/DrizzleContactRepository'
import { ResendEmailNotifier } from '@/infrastructure/contact/ResendEmailNotifier'

const schema = z.object({
  name: z.string().trim().min(1, '請填寫你的稱呼'),
  email: z.string().email(),
  message: z.string().trim().min(1, '請填寫你想做什麼'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 })
  }

  const useCase = new SubmitContactUseCase(
    new DrizzleContactRepository(),
    new ResendEmailNotifier(),
  )

  await useCase.execute(result.data)
  return NextResponse.json({ ok: true })
}
