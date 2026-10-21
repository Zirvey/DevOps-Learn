import { Link } from 'react-router-dom'
import { ArrowRight, UserRound } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { HeaderControls } from './HeaderControls'
import { BrandLogo } from './BrandLogo'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'

export function SiteHeader() {
  const { t } = useLanguage()
  const { session, isAuthenticated } = useAuth()

  return (
    <header className="site-header">
      <Link to="/" className="site-header-logo">
        <BrandLogo />
      </Link>

      <div className="site-header-search">
        <SearchBar />
      </div>

      <div className="site-header-actions">
        <Link to="/glossary" className="site-header-link">
          {t('glossary.navLink')}
        </Link>
        <Link to="/account" className="site-header-link site-header-account">
          <UserRound size={16} />
          <span>
            {isAuthenticated
              ? session?.displayName ?? t('account.navLink')
              : t('account.navLink')}
          </span>
        </Link>
        <HeaderControls />
        <Link to="/chapter/what-is-devops" className="btn btn-primary site-header-cta">
          {t('header.startLearning')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  )
}
