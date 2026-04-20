import type { MetadataRoute } from 'next'
import { baseUrl } from '~/config/site'
import { source } from '~/lib/source'

export const revalidate = false

const url = (path: string) => new URL(path, baseUrl).toString()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = source.getPages()

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'monthly',
      priority: 1,
      lastModified: new Date().toISOString().split('T')[0],
    },
    {
      url: url('/docs'),
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: new Date().toISOString().split('T')[0],
    },
    ...pages.map(
      (page) =>
        ({
          url: url(page.url),
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: page.data.lastModified
            ? new Date(page.data.lastModified).toISOString().split('T')[0]
            : undefined,
        }) as MetadataRoute.Sitemap[number]
    ),
  ]
}
