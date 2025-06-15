import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.mds.yandex.net',
      },
      new URL('https://i.ibb.co/**'),
    ],
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@tailwindcss/oxide'],
    optimizePackageImports: [
      '@tailwindcss/postcss',
      "react-datepicker"
    ]
  }
};

export default nextConfig;
