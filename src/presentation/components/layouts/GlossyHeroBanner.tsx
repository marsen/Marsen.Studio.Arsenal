'use client';

import type { CSSProperties, MouseEvent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fullBleed?: boolean;
  compact?: boolean;
};

const DARK_VARS: CSSProperties = {
  '--foreground': '#FAFAFA',
  '--muted-foreground': '#A1A1AA',
  '--border': '#3F3F46',
  '--card': '#1C1C1F',
  '--card-foreground': '#FAFAFA',
} as CSSProperties;

function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
  e.currentTarget.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
}

export default function GlossyHeroBanner({ children, fullBleed = true, compact = false }: Props) {
  return (
    <div className={fullBleed ? 'relative left-1/2 w-screen -translate-x-1/2' : 'w-full'}>
      <div
        onMouseMove={handleMouseMove}
        className="group relative overflow-hidden"
        style={{
          background: 'linear-gradient(45deg, #0D0D0F 0%, #1a1040 50%, #0D0D0F 100%)',
          ...DARK_VARS,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.16), rgba(140,130,255,0.08) 35%, transparent 60%)',
          }}
        />
        <div className={`relative mx-auto max-w-7xl px-6 ${compact ? 'py-5 md:py-7' : 'py-20 md:py-28'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
