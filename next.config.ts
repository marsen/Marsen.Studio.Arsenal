import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's.wordpress.com' },
    ],
  },
  async redirects() {
    return [
      // 舊網址 /tools/itinerary 已改名為 /tools/26-balove，保留導向避免既有連結失效
      { source: '/tools/itinerary', destination: '/tools/26-balove', permanent: true },
      { source: '/:locale/tools/itinerary', destination: '/:locale/tools/26-balove', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // WASM multi-threading (SharedArrayBuffer) 需要 Cross-Origin Isolation
        source: '/:locale/tools/background-removal',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
