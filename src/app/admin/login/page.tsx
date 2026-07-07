import type { Metadata } from 'next';
import { LoginForm } from '@/presentation/components/admin/LoginForm';

export const metadata: Metadata = {
  title: '後台登入',
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { redirect } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold text-foreground">後台登入</h1>
        <p className="mb-6 mt-1 text-sm text-foreground/60">請輸入管理員帳號密碼。</p>
        <LoginForm redirectTo={redirect ?? '/admin'} />
      </div>
    </main>
  );
}
