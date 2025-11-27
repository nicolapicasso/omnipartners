/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
