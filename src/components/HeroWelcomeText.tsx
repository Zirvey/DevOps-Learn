import { useEffect } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'

interface HeroWelcomeTextProps {
  titlePrefix: string
  titleAccent: string
  subtitle: string
  onComplete?: () => void
}

export function HeroWelcomeText({
  titlePrefix,
  titleAccent,
  subtitle,
  onComplete,
}: HeroWelcomeTextProps) {
  const prefix = useTypewriter([titlePrefix], {
    speed: 38,
    delay: 600,
  })

  const accent = useTypewriter([titleAccent], {
    speed: 42,
    delay: 120,
    enabled: prefix.done,
  })

  const subtitleWriter = useTypewriter([subtitle], {
    speed: 26,
    delay: 180,
    enabled: accent.done,
  })

  useEffect(() => {
    if (accent.done && subtitleWriter.done) {
      onComplete?.()
    }
  }, [accent.done, subtitleWriter.done, onComplete])

  const showAccent = prefix.started && (prefix.done || accent.started)
  const titleTyping = prefix.isTyping || accent.isTyping

  return (
    <>
      <h1 className="basedash-hero-title">
        <span className="typewriter-line hero-welcome-terminal-prefix">
          {prefix.visibleLines[0]}
          {showAccent && (
            <span className="hero-title-devops">{accent.visibleLines[0]}</span>
          )}
          {titleTyping && (
            <span className="typewriter-cursor" aria-hidden="true" />
          )}
        </span>
      </h1>

      {accent.done && (
        <p className="basedash-hero-subtitle">
          {subtitleWriter.visibleLines[0]}
          {subtitleWriter.isTyping && (
            <span className="typewriter-cursor" aria-hidden="true" />
          )}
        </p>
      )}
    </>
  )
}
