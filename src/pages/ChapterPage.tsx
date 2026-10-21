import { useParams, Link, Navigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Route } from 'lucide-react'
import { getChapterBySlug, chapters } from '../content'
import { getNextSlugInTrack, learningTracks } from '../content/tracks'
import { ChapterView } from '../components/ChapterView'
import { ChapterTocSidebar } from '../components/ChapterTocSidebar'
import { localizeChapter } from '../i18n/localizeChapter'
import { useLanguage } from '../i18n/LanguageContext'

function getActiveTrackId(slug: string): string | undefined {
  return learningTracks.find((track) => track.slugs.includes(slug))?.id
}

export function ChapterPage() {
  const { slug } = useParams<{ slug: string }>()
  const { locale, t } = useLanguage()
  const raw = slug ? getChapterBySlug(slug) : undefined

  if (!raw) {
    return <Navigate to="/" replace />
  }

  const chapter = localizeChapter(raw, locale)
  const currentIndex = chapters.findIndex((c) => c.slug === slug)
  const prevRaw = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextRaw = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null
  const prev = prevRaw ? localizeChapter(prevRaw, locale) : null
  const next = nextRaw ? localizeChapter(nextRaw, locale) : null
  const trackId = slug ? getActiveTrackId(slug) : undefined
  const trackNextSlug =
    trackId && slug ? getNextSlugInTrack(trackId, slug) : undefined
  const trackNextRaw = trackNextSlug ? getChapterBySlug(trackNextSlug) : undefined
  const trackNext = trackNextRaw ? localizeChapter(trackNextRaw, locale) : null
  const showTrackNext =
    trackNext && (!next || trackNext.slug !== next.slug)

  return (
    <div className="chapter-page">
      <div className="chapter-page-layout">
        <ChapterView chapter={chapter} />
        <ChapterTocSidebar chapter={chapter} />
      </div>

      {showTrackNext && (
        <Link to={`/chapter/${trackNext.slug}`} className="track-next-banner">
          <Route size={18} />
          <div>
            <span className="nav-label">{t('chapter.recommendedNext')}</span>
            <span className="nav-title">{trackNext.title}</span>
          </div>
          <ChevronRight size={18} />
        </Link>
      )}

      <nav className="chapter-nav">
        {prev ? (
          <Link to={`/chapter/${prev.slug}`} className="chapter-nav-link prev">
            <ChevronLeft size={18} />
            <div>
              <span className="nav-label">{t('chapter.navPrev')}</span>
              <span className="nav-title">{prev.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link to={`/chapter/${next.slug}`} className="chapter-nav-link next">
            <div>
              <span className="nav-label">{t('chapter.navNext')}</span>
              <span className="nav-title">{next.title}</span>
            </div>
            <ChevronRight size={18} />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  )
}
