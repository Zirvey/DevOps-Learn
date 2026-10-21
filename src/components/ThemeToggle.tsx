import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'
import { useLanguage } from '../i18n/LanguageContext'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? t('common.themeSwitchToLight') : t('common.themeSwitchToDark')}
      title={isDark ? t('common.themeSwitchToLight') : t('common.themeSwitchToDark')}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}
