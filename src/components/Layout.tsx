import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { SearchBar } from './SearchBar'
import { SiteHeader } from './SiteHeader'
import { HeaderControls } from './HeaderControls'
import { useLanguage } from '../i18n/LanguageContext'
import { ScrollProgressBar } from './ScrollProgressBar'
import { useLessonScrollProgress } from '../hooks/useLessonScrollProgress'
import { useScrollToTop } from '../hooks/useScrollToTop'

export function Layout() {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const lessonScroll = useLessonScrollProgress(!isHome)

  useScrollToTop()

  return (
    <div className={`layout ${isHome ? 'layout--home' : 'layout--lesson'}`}>
      {!isHome && <ScrollProgressBar progress={lessonScroll} />}
      {!isHome && (
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

      <main className="main-content">
        {isHome ? (
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
