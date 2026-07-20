import type { Chapter } from '../../../types'
import { linuxChapter } from './linux'
import { networkingChapter } from './networking'
import { gitChapter } from './git'
import { bashChapter } from './bash'
import { sshChapter } from './ssh'
import { yamlChapter } from './yaml'
import { nginxChapter } from './nginx'

export const fundamentalsChapters: Chapter[] = [
  linuxChapter,
  networkingChapter,
  gitChapter,
  bashChapter,
  sshChapter,
  yamlChapter,
  nginxChapter,
]

export {
  linuxChapter,
  networkingChapter,
  gitChapter,
  bashChapter,
  sshChapter,
  yamlChapter,
  nginxChapter,
}
