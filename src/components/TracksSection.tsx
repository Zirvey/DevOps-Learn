import { Link } from 'react-router-dom'
import { learningTracks } from '../content/tracks'
import { useProgress } from '../hooks/useProgressState'
import { useLanguage } from '../i18n/LanguageContext'
import { getChapterBySlug } from '../content'
import { getTrackIcon, PixelArrowRightIcon } from './moduleIcons'

export function TracksSection() {
  const { locale, t } = useLanguage()
  const completed = useProgress()

  return (
    <section className="tracks-section">
      <div className="section-header">
        <h2>{t('tracks.title')}</h2>
        <p className="section-header-sub">{t('tracks.subtitle')}</p>
      </div>
      <div className="tracks-grid">
        {learningTracks.map((track) => {
          const title = locale === 'en' ? track.titleEn : track.titleRu
          const description =
            locale === 'en' ? track.descriptionEn : track.descriptionRu
          const done = track.slugs.filter((s) => completed.has(s)).length
          const nextSlug =
            track.slugs.find((s) => !completed.has(s)) ?? track.slugs[0]
          const nextChapter = getChapterBySlug(nextSlug)
          const percent = Math.round((done / track.slugs.length) * 100)
          const Icon = getTrackIcon(track.id)

          return (
            <article key={track.id} className="track-card">
              <div className="track-card-top">
                <Icon size={20} aria-hidden />
                <h3>{title}</h3>
              </div>
              <p>{description}</p>
              <div className="track-progress">
                <div className="track-progress-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <span>
                  {done}/{track.slugs.length} · {percent}%
                </span>
              </div>
              {nextChapter && (
                <Link to={`/chapter/${nextChapter.slug}`} className="track-cta">
                  {done === 0 ? t('tracks.start') : t('tracks.continue')}
                  <PixelArrowRightIcon size={16} aria-hidden />
                </Link>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
