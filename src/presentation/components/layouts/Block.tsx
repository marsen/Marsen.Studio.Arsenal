import type { ReactNode } from 'react';

type Props = {
  tone?: 'base' | 'alt';
  children: ReactNode;
};

export default function Block({ tone = 'base', children }: Props) {
  return (
    <div className={`relative left-1/2 w-screen -translate-x-1/2 ${tone === 'alt' ? 'bg-card' : 'bg-background'}`}>
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">{children}</div>
    </div>
  );
}
