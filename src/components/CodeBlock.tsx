interface CodeBlockProps {
  language: string
  code: string
  caption?: string
}

export function CodeBlock({ language, code, caption }: CodeBlockProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{language}</span>
        <button type="button" className="copy-btn" onClick={handleCopy}>
          Копировать
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {caption && <p className="code-caption">{caption}</p>}
    </div>
  )
}
