import { useLanguage } from '../i18n/LanguageContext'

interface ScrollProgressBarProps {
  progress: number
}

export function ScrollProgressBar({ progress }: ScrollProgressBarProps) {
  const { t } = useLanguage()

  return (
    <div
      className="scroll-progress-track"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t('common.scrollProgress')}
    >
      <div
        className="scroll-progress-fill"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
