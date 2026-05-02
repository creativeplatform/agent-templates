/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * No basePath: Pinata path routes strip the prefix before the request hits the container
   * (see https://docs.pinata.cloud — Domains & Routes). External URL still uses path `/newsletter`
   * in manifest `routes`, but this process receives `/` and `/_next/...`.
   */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/newsletter', destination: '/', permanent: false },
      { source: '/newsletter/:path*', destination: '/:path*', permanent: false },
    ]
  },
}

export default nextConfig
