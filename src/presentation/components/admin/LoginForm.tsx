'use client';

import { useActionState } from 'react';
import { loginAction, type LoginState } from '@/app/actions/auth';

const initialState: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label htmlFor="username" className="mb-1 block font-medium text-foreground">
          帳號
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block font-medium text-foreground">
          密碼
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {isPending ? '登入中…' : '登入'}
      </button>
    </form>
  );
}
