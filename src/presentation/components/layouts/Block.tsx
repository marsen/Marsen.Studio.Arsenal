import type { CSSProperties, ReactNode } from 'react';

type ToneConfig = {
  bg: string;
  vars?: Record<string, string>;
};

const TONES: Record<string, ToneConfig> = {
  // Light sections
  neutral: { bg: 'var(--background)' },
  ghost: { bg: '#F4F4F5' },

  // Dark sections — override CSS vars so child components stay readable
  ink: {
    bg: 'linear-gradient(135deg, #0D0D0F 0%, #1a1040 60%, #0D0D0F 100%)',
    vars: {
      '--foreground': '#FAFAFA',
      '--muted-foreground': '#A1A1AA',
      '--border': '#3F3F46',
      '--card': '#1C1C1F',
      '--card-foreground': '#FAFAFA',
    },
  },
  plum: {
    bg: '#0F0A1E',
    vars: {
      '--foreground': '#FAFAFA',
      '--muted-foreground': '#A1A1AA',
      '--border': '#3F3F46',
    },
  },

  // Accent section (CTA)
  cta: {
    bg: '#4F46E5',
    vars: {
      '--foreground': '#FAFAFA',
      '--muted-foreground': 'rgba(255,255,255,0.7)',
      '--border': 'rgba(255,255,255,0.25)',
    },
  },
};

type Tone = keyof typeof TONES;

type Props = {
  tone?: Tone;
  children: ReactNode;
  /**
   * 滿版斷裂背景（撐出視窗寬度）依賴 100vw，計算基準是「真實瀏覽器視窗」，
   * 塞進較窄的容器（例如後台即時預覽面板）裡會裁到內容看不到。
   * 設 false 改用 w-full，背景只填滿目前容器寬度，不做斷裂延伸。
   */
  fullBleed?: boolean;
  /** 內容較短的區塊（例如頁面標題列）不需要 hero 等級的上下留白。 */
  compact?: boolean;
};

export default function Block({ tone = 'neutral', children, fullBleed = true, compact = false }: Props) {
  const { bg, vars } = TONES[tone] ?? TONES.neutral;
  const style: CSSProperties = {
    background: bg,
    ...(vars as CSSProperties),
  };

  return (
    <div
      className={fullBleed ? 'relative left-1/2 w-screen -translate-x-1/2' : 'w-full'}
      style={style}
    >
      <div className={`mx-auto max-w-7xl px-6 ${compact ? 'py-5 md:py-7' : 'py-20 md:py-28'}`}>
        {children}
      </div>
    </div>
  );
}
