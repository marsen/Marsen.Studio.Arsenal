import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function NavBar() {
  const t = useTranslations('nav');

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          ◆
        </Link>
        <ul className="flex items-center gap-6 text-sm text-muted-foreground">
          <li>
            <Link href="/about" className="hover:text-accent transition-colors">
              {t('about')}
            </Link>
          </li>
          <li>
            <Link href="/demos" className="hover:text-accent transition-colors">
              {t('demos')}
            </Link>
          </li>
          <li>
            <Link href="/tools" className="hover:text-accent transition-colors">
              {t('tools')}
            </Link>
          </li>
          <li>
            <LanguageSwitcher />
          </li>
        </ul>
      </nav>
    </header>
  );
}
