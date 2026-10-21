import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { glossaryTerms } from '../content/glossary'
import { getChapterBySlug } from '../content'
import { localizeChapter } from '../i18n/localizeChapter'
import { useLanguage } from '../i18n/LanguageContext'

export function GlossaryPage() {
  const { locale, t } = useLanguage()
  const [query, setQuery] = useState('')

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = [...glossaryTerms].filter((term) => {
      if (!q) return true
      const name = (locale === 'en' ? term.termEn : term.termRu).toLowerCase()
      const def = (
        locale === 'en' ? term.definitionEn : term.definitionRu
      ).toLowerCase()
      return name.includes(q) || def.includes(q) || term.id.includes(q)
    })
    return list.sort((a, b) => {
      const ta = locale === 'en' ? a.termEn : a.termRu
      const tb = locale === 'en' ? b.termEn : b.termRu
      return ta.localeCompare(tb, locale === 'en' ? 'en' : 'ru')
    })
  }, [locale, query])

  return (
    <div className="glossary-page">
      <header className="glossary-header">
        <BookOpen size={28} />
        <div>
          <h1>{t('glossary.title')}</h1>
          <p>{t('glossary.subtitle')}</p>
        </div>
      </header>

      <label className="glossary-filter">
        <Search size={16} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('glossary.filterPlaceholder')}
          aria-label={t('glossary.filterAria')}
        />
      </label>

      {sorted.length === 0 ? (
        <p className="glossary-filter-empty">{t('glossary.filterEmpty')}</p>
      ) : (
        <div className="glossary-list">
          {sorted.map((term) => {
            const name = locale === 'en' ? term.termEn : term.termRu
            const definition =
              locale === 'en' ? term.definitionEn : term.definitionRu
            return (
              <article key={term.id} id={term.id} className="glossary-term">
                <h2>{name}</h2>
                <p>{definition}</p>
                {term.relatedSlugs && term.relatedSlugs.length > 0 && (
                  <div className="glossary-related">
                    <span>{t('glossary.related')}</span>
                    {term.relatedSlugs.map((slug) => {
                      const raw = getChapterBySlug(slug)
                      if (!raw) return null
                      const ch = localizeChapter(raw, locale)
                      return (
                        <Link key={slug} to={`/chapter/${slug}`}>
                          {ch.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
