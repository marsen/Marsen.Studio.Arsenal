import { ImageResponse } from 'next/og';
import { ArcMark } from '@/lib/brand-mark';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <ArcMark size={18} thickness={4} color="#FAFAFA" holeColor="#4F46E5" />
      </div>
    ),
    { ...size }
  );
}
