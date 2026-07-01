'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function NavBar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastY.current || y < 60);
      setScrolled(y > 60);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/40' : ''}`}
    >
      <nav className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-bold tracking-tight text-foreground">
          ◆
        </Link>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
