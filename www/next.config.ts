import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const withMdx = createMDX()

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: 'Link',
            value:
              '</.well-known/api-catalog>; rel="api-catalog", </docs>; rel="service-doc", </llms.txt>; rel="describedby"',
          },
        ],
        source: '/',
      },
    ]
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        destination: '/llms.mdx/docs/:path*',
        source: '/docs/:path*.mdx',
      },
    ]
  },
  serverExternalPackages: ['@takumi-rs/image-response'],
}

export default withMdx(nextConfig)
