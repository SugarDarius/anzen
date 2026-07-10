import { transformerIcon } from 'fumadocs-core/mdx-plugins/rehype-code.core'
/**
 * Same SVG/HTML strings as MDX code blocks (`rehype-code` + `transformerIcon`).
 * @see https://fumadocs.dev/docs/headless/mdx/rehype-code
 */
const fumadocsLangIcon = transformerIcon()

export function getFumadocsCodeBlockIconHtml(lang: string): string | undefined {
  const pre = {
    type: 'element' as const,
    tagName: 'pre' as const,
    properties: {} as { icon?: string },
    children: [],
  }

  const run = fumadocsLangIcon.pre
  if (!run) {
    return undefined
  }

  run.call({ options: { lang } } as never, pre as never)

  const icon = pre.properties.icon
  return icon
}
