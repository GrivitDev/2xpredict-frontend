import type { NextConfig } from 'next';

import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.thesportsdb.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'crests.football-data.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },

  turbopack: {},
};

export default withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);