import type { NextConfig } from 'next'

import { createMDX } from 'fumadocs-mdx/next'

const withMdx = createMDX()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@takumi-rs/image-response'],
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value:
              '</.well-known/api-catalog>; rel="api-catalog", </docs>; rel="service-doc", </llms.txt>; rel="describedby"',
          },
        ],
      },
    ]
  },
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
