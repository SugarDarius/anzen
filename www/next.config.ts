import type { NextConfig } from 'next'
import createMdx from '@next/mdx'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
}
const withMdx = createMdx({
  extension: /\.mdx?$/,
})

export default withMdx(nextConfig)
