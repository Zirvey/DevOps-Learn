import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownContentProps {
  content: string
}

function labelMarkdownTables(root: HTMLElement) {
  root.querySelectorAll('table').forEach((table) => {
    const headers = [...table.querySelectorAll('thead th')].map(
      (th) => th.textContent?.trim() ?? '',
    )
    if (headers.length === 0) return

    table.querySelectorAll('tbody tr').forEach((tr) => {
      tr.querySelectorAll('td').forEach((td, index) => {
        const label = headers[index]
        if (label) td.setAttribute('data-label', label)
        else td.removeAttribute('data-label')
      })
    })
  })
}

const markdownComponents: Components = {
  table: ({ children }) => (
    <div className="md-table-wrap">
      <table>{children}</table>
    </div>
  ),
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    labelMarkdownTables(root)
  }, [content])

  return (
    <div className="markdown-content" ref={rootRef}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
