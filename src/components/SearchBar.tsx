import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchChapters } from '../content'
import { getLocalizedChapterTitle } from '../i18n/contentLabels'
import { localizeChapter } from '../i18n/localizeChapter'
import { useLanguage } from '../i18n/LanguageContext'

export function SearchBar() {
  const { locale, t } = useLanguage()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const results = searchChapters(query, locale).slice(0, 8)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = (slug: string) => {
    navigate(`/chapter/${slug}`)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={`search-bar ${open ? 'open' : ''}`}>
      <div className="search-input-wrap">
        <Search size={16} className="search-icon" />
        <input
          ref={inputRef}
          type="search"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && query && results.length > 0 && (
        <ul className="search-results">
          {results.map((chapter) => {
            const localized = localizeChapter(chapter, locale)
            return (
              <li key={chapter.slug}>
                <button type="button" onClick={() => handleSelect(chapter.slug)}>
                  <span className="result-title">
                    {getLocalizedChapterTitle(chapter.slug, chapter.title, locale)}
                  </span>
                  <span className="result-desc">{localized.description}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {open && query && results.length === 0 && (
        <div className="search-empty">{t('search.empty')}</div>
      )}
    </div>
  )
}
