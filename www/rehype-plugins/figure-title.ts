import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

interface FigureElement extends Element {
  __rawString__?: string
  __meta__?: string
}

const isFigureElement = (node: unknown): node is FigureElement => {
  return (
    typeof node === 'object' &&
    node !== null &&
    (node as Element).type === 'element' &&
    (node as Element).tagName === 'figure'
  )
}

export default function rehypeFigureTitle() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!isFigureElement(node)) {
        return
      }

      if (
        !node.properties ||
        !('data-rehype-pretty-code-figure' in node.properties)
      ) {
        return
      }

      const lastChild = node.children.at(-1)
      if (
        !lastChild ||
        lastChild.type !== 'element' ||
        lastChild.tagName !== 'pre'
      ) {
        return
      }

      const preElement = lastChild
      if (!preElement.properties) {
        preElement.properties = {}
      }

      preElement.properties['__rawString__'] = node.__rawString__

      if (node.__meta__ && node.__meta__.length > 0) {
        const titleMatch = node.__meta__.match(/title="([^"]+)"/)
        const title = titleMatch ? titleMatch[1] : undefined
        preElement.properties['__title__'] = title
      }
    })
  }
}
