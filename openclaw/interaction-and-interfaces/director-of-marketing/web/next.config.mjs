/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/newsletter',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/newsletter',
        permanent: false,
        basePath: false,
      },
    ]
  },
}

export default nextConfig
