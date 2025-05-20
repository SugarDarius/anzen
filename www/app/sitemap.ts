import type { MetadataRoute } from 'next'
import { baseUrl } from '~/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString().split('T')[0],
    },
  ]
}
