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
  // Fix for "Missing origin header" error in Server Actions
  // when running behind a reverse proxy (Digital Ocean App Platform)
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'partners.omniwallet.net',
        '*.ondigitalocean.app'
      ]
    }
  }
}

module.exports = nextConfig
