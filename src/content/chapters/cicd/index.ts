import type { Chapter } from '../../../types'
import { cicdBasicsChapter } from './basics'
import { githubActionsChapter } from './github-actions'
import { gitlabCiChapter } from './gitlab-ci'
import { gitopsChapter } from './gitops'

export const cicdChapters: Chapter[] = [
  cicdBasicsChapter,
  githubActionsChapter,
  gitlabCiChapter,
  gitopsChapter,
]
