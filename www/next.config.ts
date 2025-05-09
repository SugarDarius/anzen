import type { NextConfig } from 'next'
import createMdx from '@next/mdx'

import rehypePrettyCode, { type Options } from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

const prettyCodeOptions: Options = {
  keepBackground: false,
  theme: 'vesper',
}

const withMdx = createMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
  },
})

export default withMdx(nextConfig)
