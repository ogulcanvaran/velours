import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
    unoptimized: true,
    domains: ['localhost']
  },
  serverExternalPackages: ['@prisma/client'],
  // Static file serving için
  async rewrites() {
    return [
      {
        source: '/urun-gorsel/:path*',
        destination: '/urun-gorsel/:path*',
      },
    ];
  },
};

export default nextConfig;
