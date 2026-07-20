import type { Chapter } from '../types'
import type { Locale } from '../i18n/contentLabels'

export interface ChapterTocItem {
  id: string
  label: string
}

export interface ChapterTocLabels {
  practice: string
  terminal: string
  quiz: string
  resources: string
}

const defaultRuLabels: ChapterTocLabels = {
  practice: 'Практические задания',
  terminal: 'Терминальная практика',
  quiz: 'Квиз для самопроверки',
  resources: 'Справочные материалы',
}

export function getChapterTocItems(
  chapter: Chapter,
  labels: ChapterTocLabels = defaultRuLabels,
): ChapterTocItem[] {
  const items: ChapterTocItem[] = chapter.sections.map((section, index) => ({
    id: `section-${index}`,
    label: section.title,
  }))

  if (chapter.practice.length > 0) {
    items.push({ id: 'chapter-practice', label: labels.practice })
  }

  if (chapter.terminalLab) {
    items.push({ id: 'chapter-terminal-lab', label: labels.terminal })
  }

  if (chapter.quiz && chapter.quiz.length > 0) {
    items.push({ id: 'chapter-quiz', label: labels.quiz })
  }

  if (chapter.resources.length > 0) {
    items.push({ id: 'chapter-resources', label: labels.resources })
  }

  return items
}

export function localizeDuration(duration: string, locale: Locale): string {
  if (locale === 'ru') return duration
  return duration
    .replace(/часов/g, 'hours')
    .replace(/часа/g, 'hours')
    .replace(/час/g, 'hour')
    .replace(/минут/g, 'minutes')
    .replace(/минуты/g, 'minutes')
    .replace(/минуту/g, 'minute')
}
