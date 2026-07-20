import { en } from './locales/en'
import { modules } from '../content/modules'
import { enChaptersBySlug } from '../content/en/chapters'
import { chapterTitlesEn } from './chapterTitles.en'
import type { Module } from '../types'

export type Locale = 'ru' | 'en'

export function getLocalizedModule(moduleId: string, locale: Locale): Module | undefined {
  const base = modules.find((m) => m.id === moduleId)
  if (!base) return undefined
  if (locale === 'ru') return base

  const mod = en.modules[moduleId as keyof typeof en.modules]
  if (!mod) return base

  return {
    ...base,
    title: mod.title,
    description: mod.description,
  }
}

export function getLocalizedChapterTitle(
  slug: string,
  fallbackTitle: string,
  locale: Locale,
): string {
  if (locale === 'ru') return fallbackTitle
  return enChaptersBySlug[slug]?.title ?? chapterTitlesEn[slug] ?? fallbackTitle
}
