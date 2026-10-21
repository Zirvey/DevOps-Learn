import { getEnContentPack } from '../content/en/loadEnContent'
import type { Chapter } from '../types'
import { applyChapterTranslation } from './chapterTranslation'
import type { Locale } from './contentLabels'
import { localizeDuration } from '../utils/chapterToc'

export function localizeChapter(chapter: Chapter, locale: Locale): Chapter {
  if (locale === 'ru') return chapter

  const pack = getEnContentPack()
  const translated = applyChapterTranslation(
    chapter,
    pack?.chaptersBySlug[chapter.slug],
  )

  return {
    ...translated,
    duration: localizeDuration(translated.duration, locale),
    // Dedicated EN lab map covers labs that only ship RU in terminal-labs.ts;
    // linux/git still use terminalLab embedded in their chapter translations.
    terminalLab:
      pack?.terminalLabsBySlug[chapter.slug] ?? translated.terminalLab,
  }
}
