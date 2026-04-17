import type { NextConfig } from 'next'

import { createMDX } from 'fumadocs-mdx/next'

const withMdx = createMDX()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@takumi-rs/image-response'],
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ]
  },
}

export default withMdx(nextConfig)
