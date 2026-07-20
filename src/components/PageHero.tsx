import { useCallback, useState, type ReactNode } from 'react'
import { HeroVideoBackground } from './HeroVideoBackground'
import { HeroWelcomeText } from './HeroWelcomeText'

export interface HeroMetric {
  label: string
  value: string
  delta?: string
  live?: boolean
}

interface PageHeroWelcome {
  titlePrefix: string
  titleAccent: string
  subtitle: string
}

interface PageHeroProps {
  badge?: string
  title?: ReactNode
  subtitle?: ReactNode
  welcome?: PageHeroWelcome
  trustLine?: string
  actions?: ReactNode
  metrics?: HeroMetric[]
  showVideo?: boolean
}

export function PageHero({
  badge,
  title,
  subtitle,
  welcome,
  trustLine,
  actions,
  metrics,
  showVideo = true,
}: PageHeroProps) {
  const [welcomeDone, setWelcomeDone] = useState(!welcome)
  const handleWelcomeComplete = useCallback(() => setWelcomeDone(true), [])

  return (
    <section className="basedash-hero basedash-hero--terminal">
      {showVideo && <HeroVideoBackground />}

      <div className="basedash-hero-inner">
        <div className="basedash-hero-stack">
          {badge && <div className="basedash-hero-badge">{badge}</div>}

          {welcome ? (
            <HeroWelcomeText
              titlePrefix={welcome.titlePrefix}
              titleAccent={welcome.titleAccent}
              subtitle={welcome.subtitle}
              onComplete={handleWelcomeComplete}
            />
          ) : (
            <>
              {title && <h1 className="basedash-hero-title">{title}</h1>}
              {subtitle && (
                <p className="basedash-hero-subtitle">{subtitle}</p>
              )}
            </>
          )}

          {actions && (
            <div
              className={`basedash-hero-actions basedash-hero-reveal${welcomeDone ? ' is-visible' : ''}`}
            >
              {actions}
            </div>
          )}

          {trustLine && (
            <p
              className={`basedash-hero-trust basedash-hero-reveal${welcomeDone ? ' is-visible' : ''}`}
            >
              {trustLine}
            </p>
          )}
        </div>
      </div>

      {metrics && metrics.length > 0 && (
        <div
          className={`basedash-hero-metrics basedash-hero-reveal${welcomeDone ? ' is-visible' : ''}`}
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="basedash-metric-card">
              <div className="basedash-metric-card-top">
                <span className="basedash-metric-label">{metric.label}</span>
                {metric.live && (
                  <span className="basedash-live-badge">
                    <span className="basedash-live-dot" aria-hidden="true" />
                    Live
                  </span>
                )}
              </div>
              <div className="basedash-metric-value">{metric.value}</div>
              {metric.delta && (
                <div className="basedash-metric-delta">{metric.delta}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
