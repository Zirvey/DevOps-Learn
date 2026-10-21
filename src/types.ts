export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface CodeExample {
  language: string
  code: string
  caption?: string
}

export interface Section {
  title: string
  content: string
  code?: CodeExample
  codes?: CodeExample[]
}

export interface Resource {
  title: string
  url: string
}

/** Hands-on exercise: task text + optional revealable hint */
export interface PracticeItem {
  task: string
  hint?: string
}

/** single = один вариант; multi = несколько; order = расставить по порядку; spot-error = найти ошибку в коде */
export type QuizType = 'single' | 'multi' | 'order' | 'spot-error'

export interface QuizQuestion {
  question: string
  type?: QuizType
  options?: string[]
  /** Правильный вариант для single / spot-error */
  answer: string
  /** Правильные варианты для multi (должны совпадать с options) */
  answers?: string[]
  /** Правильный порядок для order (перестановка options) */
  correctOrder?: string[]
  /** Фрагмент кода для spot-error */
  codeSnippet?: string
  explanation?: string
}

export type SimpleCommandMatchStrategy =
  | { kind: 'exact' }
  | { kind: 'normalized' }
  | { kind: 'prefix' }
  | { kind: 'regex' }

export type CommandMatchStrategy =
  | SimpleCommandMatchStrategy
  | {
      kind: 'anyOf'
      items: { match: SimpleCommandMatchStrategy; accept: string[] }[]
    }

export interface TerminalStep {
  id: string
  instruction: string
  match: CommandMatchStrategy
  accept: string[]
  hint?: string
  explanation?: string
  fakeOutput?: string[]
}

export interface TerminalLab {
  id: string
  title: string
  intro?: string
  promptUser?: string
  promptHost?: string
  promptPath?: string
  initialOutput?: string[]
  steps: TerminalStep[]
}

export interface Chapter {
  id: string
  slug: string
  title: string
  moduleId: string
  order: number
  duration: string
  level: Level
  description: string
  sections: Section[]
  /** string = legacy task-only; prefer { task, hint } for explicit hints */
  practice: Array<string | PracticeItem>
  terminalLab?: TerminalLab
  quiz?: QuizQuestion[]
  resources: Resource[]
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  order: number
}

export interface LearningTrack {
  id: string
  titleRu: string
  titleEn: string
  descriptionRu: string
  descriptionEn: string
  slugs: string[]
}

export interface GlossaryTerm {
  id: string
  termRu: string
  termEn: string
  definitionRu: string
  definitionEn: string
  relatedSlugs?: string[]
}
