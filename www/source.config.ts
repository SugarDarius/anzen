import { defineDocs, defineConfig } from 'fumadocs-mdx/config'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins'
import lastModified from 'fumadocs-mdx/plugins/last-modified'
import { shikiTokenClassTransformer } from '~/lib/shiki'
import { SHIKI_DUAL_THEMES } from '~/lib/shiki-themes'

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      engine: 'oniguruma',
      themes: SHIKI_DUAL_THEMES,
      includeExplanation: 'scopeName',
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        shikiTokenClassTransformer(),
      ],
    },
  },
  plugins: [lastModified()],
})
