import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media-assets.swiggy.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'b.zmtcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.zomato.com',
        pathname: '/**',
      },
    ],
  },
  // Enable server actions for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
