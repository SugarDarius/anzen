import type { NextConfig } from 'next'
import createMdx from '@next/mdx'

import { visit } from 'unist-util-visit'
import rehypePrettyCode, { type Options } from 'rehype-pretty-code'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
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
    rehypePlugins: [
      rehypeSlug,
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'pre') {
            const [codeEl] = node.children
            if (codeEl.tagName !== 'code') {
              return
            }
            node.__meta__ = codeEl.data?.meta ?? ''
            node.__rawString__ = codeEl.children?.[0].value
          }
        })
      },
      [rehypePrettyCode, prettyCodeOptions],
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'figure') {
            if (!('data-rehype-pretty-code-figure' in node.properties)) {
              return
            }

            const preElement = node.children.at(-1)
            if (preElement.tagName !== 'pre') {
              return
            }

            preElement.properties['__rawString__'] = node.__rawString__
            if (node.__meta__ && node.__meta__.length > 0) {
              const titleMatch = node.__meta__.match(/title="([^"]+)"/)
              const title = titleMatch ? titleMatch[1] : undefined

              preElement.properties['__title__'] = title
            }
          }
        })
      },
      [
        rehypeAutolinkHeadings,
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
