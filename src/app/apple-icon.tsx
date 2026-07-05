import { ImageResponse } from 'next/og';
import { ArcMark } from '@/lib/brand-mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4F46E5',
        }}
      >
        <ArcMark size={100} thickness={21} color="#FAFAFA" holeColor="#4F46E5" />
      </div>
    ),
    { ...size }
  );
}
