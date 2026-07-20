import { enChaptersBySlug } from '../content/en/chapters'
import type { Chapter } from '../types'
import { applyChapterTranslation } from './chapterTranslation'
import type { Locale } from './contentLabels'
import { localizeDuration } from '../utils/chapterToc'

export function localizeChapter(chapter: Chapter, locale: Locale): Chapter {
  if (locale === 'ru') return chapter

  const translated = applyChapterTranslation(
    chapter,
    enChaptersBySlug[chapter.slug],
  )

  return {
    ...translated,
    duration: localizeDuration(translated.duration, locale),
  }
}
