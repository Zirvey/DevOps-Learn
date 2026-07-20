import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

interface HeaderControlsProps {
  className?: string
}

export function HeaderControls({ className }: HeaderControlsProps) {
  return (
    <div className={`header-controls${className ? ` ${className}` : ''}`}>
      <ThemeToggle />
      <LanguageSwitcher />
    </div>
  )
}
