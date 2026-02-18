import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

interface CodeElement extends Element {
  data?: { meta?: string }
}

interface PreElement extends Element {
  __meta__?: string
  __rawString__?: string
}

const isCodeElement = (node: unknown): node is CodeElement => {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Element
  return n.type === 'element' && n.tagName === 'code'
}

const isPreWithCode = (node: unknown): node is PreElement => {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const n = node as Element
  if (n.type !== 'element' || n.tagName !== 'pre') {
    return false
  }

  return isCodeElement(n.children?.[0])
}

export default function rehypeRawStringMeta() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!isPreWithCode(node)) {
        return
      }

      const [codeEl] = node.children as CodeElement[]

      node.__meta__ = codeEl.data?.meta ?? ''

      const firstChild = codeEl.children?.[0]
      const rawValue =
        firstChild && firstChild.type === 'text' ? firstChild.value : ''
      node.__rawString__ = rawValue
    })
  }
}
