import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { HeaderControls } from './HeaderControls'
import { BrandLogo } from './BrandLogo'
import { useLanguage } from '../i18n/LanguageContext'

export function SiteHeader() {
  const { t } = useLanguage()

  return (
    <header className="site-header">
      <Link to="/" className="site-header-logo">
        <BrandLogo />
      </Link>

      <div className="site-header-search">
        <SearchBar />
      </div>

      <div className="site-header-actions">
        <HeaderControls />
        <Link to="/chapter/what-is-devops" className="btn btn-primary site-header-cta">
          {t('header.startLearning')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  )
}
