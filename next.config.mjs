/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  env: {
    // Make GEOAPIFY_KEY available on client-side during build
    NEXT_PUBLIC_GEOAPIFY_API_KEY: process.env.GEOAPIFY_KEY,
  },
  // Note: For static export, redirects and canonical enforcement 
  // must be handled at the hosting level (Netlify, Cloudflare, etc.)
}

export default nextConfig
