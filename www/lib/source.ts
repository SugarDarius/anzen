import { loader } from 'fumadocs-core/source'
import type { InferPageType, LoaderOutput, Meta, Page } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'
import { docs } from 'collections/server'

type DocsFumadocsSource = ReturnType<typeof docs.toFumadocsSource>
type DocsPageFile = Extract<DocsFumadocsSource['files'][number], { type: 'page' }>
type DocsMetaFile = Extract<DocsFumadocsSource['files'][number], { type: 'meta' }>

/**
 * `loader()` does not infer MDX fields (`body`, `toc`, `getText`, …) from
 * `docs.toFumadocsSource()` in fumadocs-core 16.8.x; it falls back to core `PageData`.
 * The runtime shape is correct — this assertion restores accurate types.
 */
type AnzenDocsLoader = LoaderOutput<{
  page: Page<undefined, DocsPageFile['data']>
  meta: Meta<undefined, DocsMetaFile['data']>
  i18n: undefined
}>

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
}) as unknown as AnzenDocsLoader

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.webp']

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  }
}

/**
 * `getPageImage` URLs end with `image.webp`
 *  strip that for `source.getPage` to work
 */
export function pageSlugFromOgDocsPath(
  slug: string[] | undefined
): string[] | undefined {
  if (!slug?.length) {
    return slug
  }
  if (slug.at(-1) !== 'image.webp') {
    return slug
  }
  const rest = slug.slice(0, -1)
  return rest.length ? rest : undefined
}
