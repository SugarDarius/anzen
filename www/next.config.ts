import type { NextConfig } from 'next'
import withMdx from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

export default withMdx()(nextConfig)
