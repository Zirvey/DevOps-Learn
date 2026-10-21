import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadEnContentPack,
  prefetchEnContentPack,
  getEnContentPack,
} from '../content/en/loadEnContent'
import { en } from './locales/en'
import { ru, type Translations } from './locales/ru'
import type { Locale } from './contentLabels'

const STORAGE_KEY = 'devops-handbook-lang'

const dictionaries: Record<Locale, Translations> = { ru, en }

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'ru'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'ru' ? stored : 'ru'
}

function getByPath(dict: Translations, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = dict
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  /** False only while the EN content pack is still loading. */
  contentReady: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale())
  const [contentReady, setContentReady] = useState(
    () => locale !== 'en' || getEnContentPack() !== null,
  )

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    if (locale !== 'en') {
      setContentReady(true)
      return
    }

    if (getEnContentPack()) {
      setContentReady(true)
      return
    }

    let cancelled = false
    setContentReady(false)
    void loadEnContentPack().then(() => {
      if (!cancelled) setContentReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  // Warm EN pack after idle so the first switch to EN is snappy for RU users.
  useEffect(() => {
    if (locale !== 'ru' || typeof window === 'undefined') return

    const schedule =
      window.requestIdleCallback?.bind(window) ??
      ((cb: IdleRequestCallback) => window.setTimeout(() => cb({} as IdleDeadline), 1800))
    const cancel =
      window.cancelIdleCallback?.bind(window) ??
      ((id: number) => window.clearTimeout(id))

    const id = schedule(() => prefetchEnContentPack())
    return () => cancel(id as number)
  }, [locale])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value =
        getByPath(dictionaries[locale], key) ??
        getByPath(dictionaries.ru, key) ??
        key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replaceAll(`{{${k}}}`, String(v))
        }
      }
      return value
    },
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      contentReady,
    }),
    [locale, setLocale, t, contentReady],
  )

  return (
    <LanguageContext.Provider value={value}>
      {locale === 'en' && !contentReady ? (
        <div className="locale-loading" role="status" aria-live="polite">
          {t('common.loadingLocale')}
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}

export type { Locale }
