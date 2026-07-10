import type { MetadataRoute } from 'next'

import { baseUrl } from '~/config/site'
import { source } from '~/lib/source'

export const revalidate = false

const url = (path: string) => new URL(path, baseUrl).toString()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = source.getPages()

  return [
    {
      changeFrequency: 'monthly',
      lastModified: new Date().toISOString().split('T')[0],
      priority: 1,
      url: `${baseUrl}/`,
    },
    {
      changeFrequency: 'monthly',
      lastModified: new Date().toISOString().split('T')[0],
      priority: 0.8,
      url: url('/docs'),
    },
    ...pages.map(
      (page) =>
        ({
          changeFrequency: 'weekly',
          lastModified: page.data.lastModified
            ? new Date(page.data.lastModified).toISOString().split('T')[0]
            : undefined,
          priority: 0.5,
          url: url(page.url),
        }) as MetadataRoute.Sitemap[number],
    ),
  ]
}
