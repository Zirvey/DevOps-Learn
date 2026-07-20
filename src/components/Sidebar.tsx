import { Link, useLocation } from 'react-router-dom'
import {
  Rocket,
  Terminal,
  Box,
  Layers,
  GitBranch,
  FileCode,
  Cloud,
  Activity,
  Shield,
  GraduationCap,
  CheckCircle2,
  Circle,
  Server,
  Network,
  Wifi,
  ShieldCheck,
  Headphones,
  type LucideIcon,
} from 'lucide-react'
import { modules } from '../content/modules'
import { getChaptersByModule } from '../content'
import { useProgress } from '../hooks/useProgressState'
import { getLocalizedChapterTitle, getLocalizedModule } from '../i18n/contentLabels'
import { useLanguage } from '../i18n/LanguageContext'
import { BrandLogo } from './BrandLogo'

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Terminal,
  Box,
  Layers,
  GitBranch,
  FileCode,
  Cloud,
  Activity,
  Shield,
  GraduationCap,
  Server,
  Network,
  Wifi,
  ShieldCheck,
  Headphones,
}

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const completed = useProgress()
  const location = useLocation()
  const { locale } = useLanguage()
  const currentSlug = location.pathname.startsWith('/chapter/')
    ? location.pathname.replace('/chapter/', '')
    : undefined

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="logo" onClick={onNavigate}>
          <BrandLogo />
        </Link>
      </div>

      <nav className="sidebar-nav">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((module) => {
            const Icon = iconMap[module.icon] ?? Terminal
            const moduleChapters = getChaptersByModule(module.id)
            const localizedModule = getLocalizedModule(module.id, locale) ?? module

            return (
              <div key={module.id} className="nav-module">
                <div className="nav-module-title">
                  <Icon size={15} />
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
                            <CheckCircle2 size={14} className="check-icon done" />
                          ) : (
                            <Circle size={14} className="check-icon" />
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
