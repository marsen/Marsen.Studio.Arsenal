import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { loadGoogleFont } from '@/lib/og-font';
import { ArcMark } from '@/lib/brand-mark';

export const alt = 'Marsen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ locale: string }> };

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tagline = t('heroEyebrow');

  const fontFamily = locale === 'zh' ? 'Noto Sans TC' : null;
  const fontData = fontFamily ? await loadGoogleFont(fontFamily, `Marsen${tagline}`) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '96px',
          background: 'linear-gradient(135deg, #0D0D0F 0%, #1a1040 60%, #0D0D0F 100%)',
          ...(fontFamily ? { fontFamily } : {}),
        }}
      >
        <div style={{ display: 'flex', marginBottom: 40 }}>
          {/* holeColor approximates the gradient's color in the top-left corner, where the mark sits */}
          <ArcMark size={68} thickness={14} color="#818CF8" holeColor="#0D0D0F" />
        </div>
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 700, color: '#FAFAFA' }}>
          Marsen
        </div>
        <div style={{ display: 'flex', fontSize: 36, color: '#A1A1AA', marginTop: 16 }}>
          {tagline}
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData && fontFamily
        ? { fonts: [{ name: fontFamily, data: fontData, style: 'normal' as const, weight: 700 as const }] }
        : {}),
    }
  );
}
