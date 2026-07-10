import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import lastModified from 'fumadocs-mdx/plugins/last-modified'

import { shikiTokenClassTransformer } from './lib/shiki'

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: pageSchema,
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      engine: 'oniguruma',
      includeExplanation: 'scopeName',
      themes: {
        dark: 'vesper',
        light: 'github-light',
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        shikiTokenClassTransformer(),
      ],
    },
  },
  plugins: [lastModified()],
})
