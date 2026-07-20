import type { Chapter } from '../../../types'
import { terraformChapter } from './terraform'
import { ansibleChapter } from './ansible'

export const iacChapters: Chapter[] = [terraformChapter, ansibleChapter]
