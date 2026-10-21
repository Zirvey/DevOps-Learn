import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  LogOut,
  Route,
  Shield,
  Terminal,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { chapters } from '../content'
import { learningTracks } from '../content/tracks'
import { getProgressPercent } from '../hooks/useProgress'
import { useProgress } from '../hooks/useProgressState'
import { countPracticeDone } from '../hooks/usePracticeProgress'
import { countTerminalLabsDone } from '../hooks/useTerminalProgress'
import { getChapterBySlug } from '../content'
import { localizeChapter } from '../i18n/localizeChapter'
import { useLanguage } from '../i18n/LanguageContext'

type AuthMode = 'login' | 'register'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c

  return (
    <div className="account-ring" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle className="account-ring-track" cx="50" cy="50" r={r} />
        <circle
          className="account-ring-value"
          cx="50"
          cy="50"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="account-ring-label">
        <strong>{percent}%</strong>
      </div>
    </div>
  )
}

export function AccountPage() {
  const { t, locale } = useLanguage()
  const { session, isAuthenticated, login, register, logout, setDisplayName } =
    useAuth()
  const completed = useProgress()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayNameInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [nameDraft, setNameDraft] = useState(session?.displayName ?? '')
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setNameDraft(session?.displayName ?? '')
  }, [session?.displayName])

  const percent = getProgressPercent(chapters.length)
  const practice = countPracticeDone()
  const terminalLabs = countTerminalLabsDone()

  const trackStats = useMemo(
    () =>
      learningTracks.map((track) => {
        const done = track.slugs.filter((s) => completed.has(s)).length
        const nextSlug =
          track.slugs.find((s) => !completed.has(s)) ?? track.slugs[0]
        return {
          id: track.id,
          title: locale === 'en' ? track.titleEn : track.titleRu,
          done,
          total: track.slugs.length,
          percent: Math.round((done / track.slugs.length) * 100),
          nextSlug,
        }
      }),
    [completed, locale],
  )

  const continueChapter = useMemo(() => {
    const next =
      learningTracks[0].slugs.find((s) => !completed.has(s)) ??
      chapters.find((c) => !completed.has(c.slug))?.slug
    if (!next) return null
    const raw = getChapterBySlug(next)
    return raw ? localizeChapter(raw, locale) : null
  }, [completed, locale])

  const mapError = (code: string) => {
    if (code === 'invalid-email') return t('account.errorInvalidEmail')
    if (code === 'weak-password') return t('account.errorWeakPassword')
    if (code === 'email-taken') return t('account.errorEmailTaken')
    if (code === 'invalid-credentials') return t('account.errorCredentials')
    return t('account.errorGeneric')
  }

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result =
      mode === 'login'
        ? await login({ email, password })
        : await register({ email, password, displayName })
    setBusy(false)
    if (!result.ok) {
      setError(mapError(result.error))
      return
    }
    setPassword('')
  }

  if (!isAuthenticated || !session) {
    return (
      <div className="account-page">
        <div className="account-shell account-shell--guest">
          <aside className="account-aside">
            <span className="account-eyebrow">
              <Shield size={14} />
              {t('account.navLink')}
            </span>
            <h1 className="account-title">{t('account.title')}</h1>
            <p className="account-lead">{t('account.subtitleGuest')}</p>
            <ul className="account-perk-list">
              <li>
                <BookOpen size={16} />
                {t('account.perkProgress')}
              </li>
              <li>
                <Route size={16} />
                {t('account.perkTracks')}
              </li>
              <li>
                <Terminal size={16} />
                {t('account.perkLocal')}
              </li>
            </ul>
          </aside>

          <div className="account-auth-card">
            <div className="account-auth-chrome">
              <span className="account-auth-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="account-auth-path">~/cabinet/auth</span>
            </div>

            <div className="account-auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
              >
                {t('account.login')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={mode === 'register' ? 'active' : ''}
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
              >
                {t('account.register')}
              </button>
            </div>

            <form className="account-form" onSubmit={(e) => void handleAuth(e)}>
              {mode === 'register' && (
                <label>
                  <span>{t('account.displayName')}</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    autoComplete="nickname"
                    placeholder={t('account.displayNamePlaceholder')}
                  />
                </label>
              )}
              <label>
                <span>{t('account.email')}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
              <label>
                <span>{t('account.password')}</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="account-error">{error}</p>}

              <button type="submit" className="btn btn-primary account-submit" disabled={busy}>
                {mode === 'login' ? t('account.login') : t('account.register')}
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="account-note">{t('account.localNote')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <section className="account-hero">
        <div className="account-hero-main">
          <div className="account-avatar" aria-hidden="true">
            {initials(session.displayName)}
          </div>
          <div className="account-hero-copy">
            <span className="account-eyebrow">
              <UserRound size={14} />
              {t('account.navLink')}
            </span>
            <h1 className="account-title">
              {t('account.welcome', { name: session.displayName })}
            </h1>
            <p className="account-email">{session.email}</p>
          </div>
        </div>

        <div className="account-hero-side">
          <ProgressRing percent={percent} />
          <p className="account-ring-caption">
            {t('account.statChapters', {
              done: completed.size,
              total: chapters.length,
            })}
          </p>
          <button type="button" className="btn btn-secondary account-logout" onClick={logout}>
            <LogOut size={16} />
            {t('account.logout')}
          </button>
        </div>
      </section>

      <p className="account-note account-note--banner">
        <Shield size={14} />
        {t('account.localNote')}
      </p>

      <section className="account-stats">
        <article className="account-stat-card">
          <div className="account-stat-icon">
            <BookOpen size={18} />
          </div>
          <div>
            <strong>{percent}%</strong>
            <span>
              {t('account.statChapters', {
                done: completed.size,
                total: chapters.length,
              })}
            </span>
          </div>
        </article>
        <article className="account-stat-card">
          <div className="account-stat-icon">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <strong>{practice.done}</strong>
            <span>{t('account.statPractice')}</span>
          </div>
        </article>
        <article className="account-stat-card">
          <div className="account-stat-icon">
            <Terminal size={18} />
          </div>
          <div>
            <strong>{terminalLabs}</strong>
            <span>{t('account.statTerminal')}</span>
          </div>
        </article>
      </section>

      {continueChapter && (
        <Link to={`/chapter/${continueChapter.slug}`} className="account-continue">
          <div className="account-continue-copy">
            <span className="nav-label">{t('account.continue')}</span>
            <strong>{continueChapter.title}</strong>
            {continueChapter.description && (
              <p>{continueChapter.description}</p>
            )}
          </div>
          <span className="account-continue-go">
            <ArrowRight size={18} />
          </span>
        </Link>
      )}

      <section className="account-section">
        <div className="account-section-head">
          <h2>
            <Route size={18} />
            {t('account.tracksTitle')}
          </h2>
        </div>
        <div className="account-tracks">
          {trackStats.map((track) => (
            <article key={track.id} className="account-track-card">
              <div className="account-track-top">
                <h3>{track.title}</h3>
                <span className="account-track-pct">{track.percent}%</span>
              </div>
              <div className="track-progress-bar">
                <span style={{ width: `${track.percent}%` }} />
              </div>
              <p>
                {track.done}/{track.total}
              </p>
              <Link to={`/chapter/${track.nextSlug}`} className="track-cta">
                {track.done === 0 ? t('tracks.start') : t('tracks.continue')}
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="account-section account-profile">
        <div className="account-section-head">
          <h2>
            <UserRound size={18} />
            {t('account.profileTitle')}
          </h2>
        </div>
        <form
          className="account-form account-form--inline"
          onSubmit={(e) => {
            e.preventDefault()
            setDisplayName(nameDraft)
            setSavedFlash(true)
            window.setTimeout(() => setSavedFlash(false), 1600)
          }}
        >
          <label>
            <span>{t('account.displayName')}</span>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-secondary">
            {savedFlash ? t('account.savedProfile') : t('account.saveProfile')}
          </button>
        </form>
      </section>
    </div>
  )
}
