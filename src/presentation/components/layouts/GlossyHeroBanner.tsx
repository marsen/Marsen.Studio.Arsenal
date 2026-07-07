'use client';

import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fullBleed?: boolean;
  compact?: boolean;
  /** 外層深色區塊的額外 class（例如首頁 Hero 需要的 min-h/flex 對齊）。 */
  className?: string;
  /** 內容容器的 class，設定時取代 compact 的預設留白，供 Hero 使用自己的排版。 */
  contentClassName?: string;
};

const DARK_VARS: CSSProperties = {
  '--foreground': '#FAFAFA',
  '--muted-foreground': '#A1A1AA',
  '--border': '#3F3F46',
  '--card': '#1C1C1F',
  '--card-foreground': '#FAFAFA',
} as CSSProperties;

type Ripple = { id: number; x: number; y: number };

const RIPPLE_INTERVAL_MS = 70;
const RIPPLE_LIFETIME_MS = 2200;
const MAX_RIPPLES = 14;

let nextRippleId = 0;

export default function GlossyHeroBanner({
  children,
  fullBleed = true,
  compact = false,
  className = '',
  contentClassName,
}: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const lastSpawnAt = useRef(0);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${(x / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--y', `${(y / rect.height) * 100}%`);

    const now = performance.now();
    if (now - lastSpawnAt.current < RIPPLE_INTERVAL_MS) return;
    lastSpawnAt.current = now;

    const id = nextRippleId++;
    setRipples((prev) => [...prev.slice(-(MAX_RIPPLES - 1)), { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, RIPPLE_LIFETIME_MS);
  }

  return (
    <div className={fullBleed ? 'relative left-1/2 w-screen -translate-x-1/2' : 'w-full'}>
      <div
        onMouseMove={handleMouseMove}
        className={`group relative overflow-hidden ${className}`}
        style={{
          background: 'linear-gradient(45deg, #0D0D0F 0%, #1a1040 50%, #0D0D0F 100%)',
          ...DARK_VARS,
        }}
      >
        {/* 跟隨滑鼠的柔光 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.14), rgba(140,130,255,0.07) 35%, transparent 60%)',
          }}
        />

        {/* 水波紋：滑鼠移動時沿路徑產生擴散圈 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {ripples.map((r) => (
            <span
              key={r.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
              style={{
                left: r.x,
                top: r.y,
                animation: `ripple-expand ${RIPPLE_LIFETIME_MS}ms ease-out forwards`,
              }}
            />
          ))}
        </div>

        <div className={contentClassName ?? `relative mx-auto max-w-7xl px-6 ${compact ? 'py-5 md:py-7' : 'py-20 md:py-28'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
