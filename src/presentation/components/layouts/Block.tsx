import type { ReactNode } from 'react';

const TONES = {
  neutral: 'var(--background)',
  forest: '#16211C',
  steel: '#1A1F2E',
  plum: '#211A2E',
  amber: '#2E2419',
} as const;

type Tone = keyof typeof TONES;

type Props = {
  tone?: Tone;
  children: ReactNode;
};

export default function Block({ tone = 'neutral', children }: Props) {
  return (
    <div
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ backgroundColor: TONES[tone] }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">{children}</div>
    </div>
  );
}
