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

export interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
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
  practice: string[]
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
