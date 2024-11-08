import createNextBundleAnalyzerPlugin from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

const withBundleAnalyzer = createNextBundleAnalyzerPlugin({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['mui-tel-input'],
  images: {
    // @TODO: domains deprecated but it is not working without it somehow
    domains: [process.env.NEXT_UPLOADS_HOSTNAME],
    remotePatterns: [
      {
        protocol: process.env.NEXT_UPLOADS_PROTOCOL,
        hostname: process.env.NEXT_UPLOADS_HOSTNAME,
        port: process.env.NEXT_UPLOADS_PORT,
        pathname: process.env.NEXT_UPLOADS_PATHNAME,
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

if (process.env.NODE_ENV !== 'production') {
  // nextConfig.experimental = {
  //   swcPlugins: [
  //     ['@swc-jotai/react-refresh', {}],
  //     ['@swc-jotai/debug-label', {}],
  //   ],
  // };
}

export default withBundleAnalyzer(withNextIntl(nextConfig));
