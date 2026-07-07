'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminCredentials } from '@/application/adminUser/verifyAdminCredentials';
import { getAdminUserRepository } from '@/infrastructure/di/adminUserContainer';
import { createSessionToken } from '@/infrastructure/auth/session';
import { env } from '@/lib/env';

export type LoginState = { error?: string };

const SESSION_COOKIE = 'session';
const SEVEN_DAYS = 60 * 60 * 24 * 7;

/** 只允許站內絕對路徑，避免 open redirect */
function safeRedirect(target: string): string {
  if (target.startsWith('/') && !target.startsWith('//')) return target;
  return '/admin';
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = safeRedirect(String(formData.get('redirect') ?? '/admin'));

  const user = await verifyAdminCredentials(getAdminUserRepository(), username, password);
  if (!user) return { error: '帳號或密碼錯誤' };

  const token = await createSessionToken(user.username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS,
  });

  redirect(redirectTo);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
