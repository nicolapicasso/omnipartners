/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.omniwallet.net',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
