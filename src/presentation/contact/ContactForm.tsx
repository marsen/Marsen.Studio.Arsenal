'use client'

import { useState } from 'react'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm() {
  const [state, setState] = useState<State>('idle')
  const [errors, setErrors] = useState<{ name?: string[]; email?: string[]; message?: string[] }>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrors({})

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setState('success')
    } else {
      const body = await res.json()
      setErrors(body.errors ?? {})
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-lg border border-foreground/10 bg-foreground/5 p-6 text-center">
        <p className="font-medium">收到了，謝謝。</p>
        <p className="mt-1 text-sm text-foreground/60">我會盡快回覆你。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          怎麼稱呼你
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/50"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/50"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          你想做什麼
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/50"
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-[#F7F4EE] transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {state === 'submitting' ? '送出中…' : '送出'}
      </button>
    </form>
  )
}
