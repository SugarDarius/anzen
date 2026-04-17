import { loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'
import { type InferPageType } from 'fumadocs-core/source'
import { docs } from 'collections/server'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
})

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.webp']

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  }
}
