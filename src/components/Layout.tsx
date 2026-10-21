import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, UserRound, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { SearchBar } from './SearchBar'
import { SiteHeader } from './SiteHeader'
import { HeaderControls } from './HeaderControls'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import { ScrollProgressBar } from './ScrollProgressBar'
import { useLessonScrollProgress } from '../hooks/useLessonScrollProgress'
import { useScrollToTop } from '../hooks/useScrollToTop'

export function Layout() {
  const { t } = useLanguage()
  const { session, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHomeShell =
    location.pathname === '/' ||
    location.pathname === '/glossary' ||
    location.pathname === '/account'
  const lessonScroll = useLessonScrollProgress(!isHomeShell)

  useScrollToTop()

  return (
    <div className={`layout ${isHomeShell ? 'layout--home' : 'layout--lesson'}`}>
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>
      {!isHomeShell && <ScrollProgressBar progress={lessonScroll} />}
      {!isHomeShell && (
        <>
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('common.menu')}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {mobileOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <div className={`sidebar-wrap ${mobileOpen ? 'open' : ''}`}>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <main id="main-content" className="main-content" tabIndex={-1}>
        {isHomeShell ? (
          <>
            <SiteHeader />
            <div className="page-content page-content--home">
              <Outlet />
            </div>
          </>
        ) : (
          <>
            <header className="top-bar">
              <SearchBar />
              <Link to="/account" className="top-bar-account" title={t('account.navLink')}>
                <UserRound size={16} />
                <span>
                  {isAuthenticated
                    ? session?.displayName ?? t('account.navLink')
                    : t('account.navLink')}
                </span>
              </Link>
              <HeaderControls className="top-bar-controls" />
            </header>
            <div className="page-content">
              <Outlet />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
