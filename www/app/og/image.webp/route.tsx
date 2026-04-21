import { generateRootOgImageResponse } from '../generate-root-image-response'

export const revalidate = false

export function GET() {
  return generateRootOgImageResponse()
}
