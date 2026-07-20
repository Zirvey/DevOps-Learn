import { dockerChapter } from './docker'
import { composeChapter } from './compose'
import type { Chapter } from '../../../types'

export const containersChapters: Chapter[] = [dockerChapter, composeChapter]
