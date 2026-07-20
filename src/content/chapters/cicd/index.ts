import type { Chapter } from '../../../types'
import { cicdBasicsChapter } from './basics'
import { githubActionsChapter } from './github-actions'
import { gitopsChapter } from './gitops'

export const cicdChapters: Chapter[] = [
  cicdBasicsChapter,
  githubActionsChapter,
  gitopsChapter,
]
