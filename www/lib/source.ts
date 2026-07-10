import { docs } from 'collections/server'
import { loader } from 'fumadocs-core/source'
import type { InferPageType, StaticSource } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'

export const source = loader({
  baseUrl: '/docs',
  plugins: [lucideIconsPlugin()],
  /**
   * `toFumadocsSource()` widens page data to `PageData` in npm workspaces
   * but we need to preserve collection types explicitly.
   */
  source: docs.toFumadocsSource() as StaticSource<{
    pageData: (typeof docs)['docs'][number]
    metaData: (typeof docs)['meta'][number]
  }>,
})

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
  slug: string[] | undefined,
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
