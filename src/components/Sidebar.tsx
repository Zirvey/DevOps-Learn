import { Link, useLocation } from 'react-router-dom'
import { modules } from '../content/modules'
import { getChaptersByModule } from '../content'
import { useProgress } from '../hooks/useProgressState'
import { getLocalizedChapterTitle, getLocalizedModule } from '../i18n/contentLabels'
import { useLanguage } from '../i18n/LanguageContext'
import { BrandLogo } from './BrandLogo'
import {
  getModuleIcon,
  PixelBookOpenIcon,
  PixelCheckIcon,
  PixelCircleIcon,
} from './moduleIcons'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const completed = useProgress()
  const location = useLocation()
  const { locale, t } = useLanguage()
  const currentSlug = location.pathname.startsWith('/chapter/')
    ? location.pathname.replace('/chapter/', '')
    : undefined
  const glossaryActive = location.pathname === '/glossary'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="logo" onClick={onNavigate}>
          <BrandLogo />
        </Link>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-module">
          <Link
            to="/glossary"
            className={`nav-chapter sidebar-glossary-link ${glossaryActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <PixelBookOpenIcon size={14} className="check-icon" aria-hidden />
            <span>{t('glossary.navLink')}</span>
          </Link>
        </div>
        {modules
          .sort((a, b) => a.order - b.order)
          .map((module) => {
            const Icon = getModuleIcon(module.icon)
            const moduleChapters = getChaptersByModule(module.id)
            const localizedModule = getLocalizedModule(module.id, locale) ?? module

            return (
              <div key={module.id} className="nav-module">
                <div className="nav-module-title">
                  <Icon size={15} aria-hidden />
                  {localizedModule.title}
                </div>
                <ul className="nav-chapters">
                  {moduleChapters.map((chapter) => {
                    const isActive = chapter.slug === currentSlug
                    const isDone = completed.has(chapter.slug)
                    const title = getLocalizedChapterTitle(chapter.slug, chapter.title, locale)

                    return (
                      <li key={chapter.slug}>
                        <Link
                          to={`/chapter/${chapter.slug}`}
                          className={`nav-chapter ${isActive ? 'active' : ''}`}
                          onClick={onNavigate}
                        >
                          {isDone ? (
                            <PixelCheckIcon size={14} className="check-icon done" aria-hidden />
                          ) : (
                            <PixelCircleIcon size={14} className="check-icon" aria-hidden />
                          )}
                          <span>{title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
      </nav>
    </aside>
  )
}
