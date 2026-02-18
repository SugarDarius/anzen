import type { NextConfig } from 'next'
import createMdx from '@next/mdx'
import path from 'path'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

// Resolve plugin paths to absolute strings so they are serializable (Turbopack requires JSON-serializable loader options)
const rehypeRawStringMetaPath = path.resolve(process.cwd(), 'rehype-plugins/raw-string-meta.ts')
const rehypeFigureTitlePath = path.resolve(process.cwd(), 'rehype-plugins/figure-title.ts')

const withMdx = createMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [
      'rehype-slug',
      rehypeRawStringMetaPath,
      ['rehype-pretty-code', { keepBackground: false, theme: 'vesper' }],
      rehypeFigureTitlePath,
      [
        'rehype-autolink-headings',
        {
          properties: {
            className: 'mdx-subheading-link',
          },
          behavior: 'wrap',
        },
      ],
    ],
  },
})

export default withMdx(nextConfig)
