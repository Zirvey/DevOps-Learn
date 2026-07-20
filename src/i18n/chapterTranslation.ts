import type {
  Chapter,
  QuizQuestion,
  Resource,
  Section,
  TerminalLab,
} from '../types'

/** English (or other locale) overlay for a chapter body */
export interface ChapterTranslation {
  title: string
  description: string
  duration: string
  sections: Section[]
  practice: string[]
  resources?: Resource[]
  quiz?: QuizQuestion[]
  terminalLab?: TerminalLab
}

export function applyChapterTranslation(
  chapter: Chapter,
  translation: ChapterTranslation | undefined,
): Chapter {
  if (!translation) return chapter

  return {
    ...chapter,
    title: translation.title,
    description: translation.description,
    duration: translation.duration,
    sections: translation.sections,
    practice: translation.practice,
    resources: translation.resources ?? chapter.resources,
    quiz: translation.quiz ?? chapter.quiz,
    terminalLab: translation.terminalLab ?? chapter.terminalLab,
  }
}
