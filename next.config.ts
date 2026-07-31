import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: '**.imgur.com' },
      { protocol: 'https', hostname: '**.ibb.co' },
    ],
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      '@workspace/api-client-react': './lib/api-client/index.ts',
      '@/lib/api-client': './lib/api-client/index.ts',
      '@': './app',
    },
  },
};

export default nextConfig;
