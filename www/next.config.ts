import type { NextConfig } from 'next'
import createMdx from '@next/mdx'

import { visit } from 'unist-util-visit'
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
    rehypePlugins: [
      rehypeSlug,
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'pre') {
            const [codeEl] = node.children
            if (codeEl.tagName !== 'code') {
              return
            }

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
            if (node.__codesrc__) {
              preElement.properties['__codesrc__'] = node.__codesrc__
            }
          }
        })
      },
    ],
  },
})

export default withMdx(nextConfig)
