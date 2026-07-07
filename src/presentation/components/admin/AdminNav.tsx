import Link from 'next/link';
import { getCurrentAdmin } from '@/infrastructure/auth/currentAdmin';
import { logoutAction } from '@/app/actions/auth';

export async function AdminNav() {
  const admin = await getCurrentAdmin();

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex h-14 max-w-4xl items-center gap-6 px-4">
        <span className="font-bold text-foreground">Marsen 後台</span>
        <Link href="/admin/content" className="text-sm text-foreground/70 hover:text-accent">
          編輯首頁內容
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {admin && <span className="text-xs text-foreground/50">{admin.username}</span>}
          <form action={logoutAction}>
            <button className="text-sm text-foreground/60 hover:text-red-600">登出</button>
          </form>
        </div>
      </nav>
    </header>
  );
}
