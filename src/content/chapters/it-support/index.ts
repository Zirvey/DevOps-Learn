import type { Chapter } from '../../../types'
import { itSupportFoundationsChapter } from './foundations'
import { helpdeskSlaChapter } from './helpdesk'
import { endpointSupportChapter } from './endpoints'
import { supportPlaybooksChapter } from './playbooks'

export const itSupportChapters: Chapter[] = [
  itSupportFoundationsChapter,
  helpdeskSlaChapter,
  endpointSupportChapter,
  supportPlaybooksChapter,
]

export {
  itSupportFoundationsChapter,
  helpdeskSlaChapter,
  endpointSupportChapter,
  supportPlaybooksChapter,
}
