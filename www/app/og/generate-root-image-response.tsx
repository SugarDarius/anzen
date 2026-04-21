import { ImageResponse } from '@takumi-rs/image-response'

import { baseUrl, siteConfig } from '~/config/site'
import { OgImage } from './_components/og-image'

export function generateRootOgImageResponse() {
  const url = new URL(baseUrl).toString().replace('https://', '').slice(0, -1)

  return new ImageResponse(
    <OgImage
      title={siteConfig.title}
      description={siteConfig.description}
      url={url}
    />,
    {
      width: 1200,
      height: 630,
      format: 'webp',
    }
  )
}
