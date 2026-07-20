import type { Chapter } from '../../../types'
import { windowsServerChapter } from './windows-server'
import { activeDirectoryChapter } from './active-directory'
import { gpoUsersChapter } from './gpo-users'
import { backupsChapter } from './backups'

export const sysadminChapters: Chapter[] = [
  windowsServerChapter,
  activeDirectoryChapter,
  gpoUsersChapter,
  backupsChapter,
]

export { windowsServerChapter, activeDirectoryChapter, gpoUsersChapter, backupsChapter }
