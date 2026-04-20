import { transformerIcon } from 'fumadocs-core/mdx-plugins/rehype-code.core'
import type { Element } from 'hast'

/**
 * Same SVG/HTML strings as MDX code blocks (`rehype-code` + `transformerIcon`).
 * @see https://fumadocs.dev/docs/headless/mdx/rehype-code
 */
const fumadocsLangIcon = transformerIcon()

export function getFumadocsCodeBlockIconHtml(lang: string): string | undefined {
  const pre: Element = {
    type: 'element',
    tagName: 'pre',
    properties: {},
    children: [],
  }
  const run = fumadocsLangIcon.pre
  if (!run) return undefined
  run.call({ options: { lang } } as never, pre)
  const icon = pre.properties.icon
  return typeof icon === 'string' ? icon : undefined
}
