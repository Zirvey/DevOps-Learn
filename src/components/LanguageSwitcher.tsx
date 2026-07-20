import { useLanguage } from '../i18n/LanguageContext'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage()

  return (
    <div
      className={`lang-switcher${className ? ` ${className}` : ''}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`lang-switcher-btn${locale === 'en' ? ' active' : ''}`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-switcher-btn${locale === 'ru' ? ' active' : ''}`}
        onClick={() => setLocale('ru')}
        aria-pressed={locale === 'ru'}
      >
        RU
      </button>
    </div>
  )
}
