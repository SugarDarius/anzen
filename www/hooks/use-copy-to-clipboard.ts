import { useCallback, useEffect, useState } from 'react'

export function useCopyToClipboard(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState<boolean>(false)
  const copy = useCallback((text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
    })
  }, [])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  return [copied, copy]
}
