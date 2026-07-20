import { k8sBasicsChapter } from './k8s-basics'
import { k8sAdvancedChapter } from './k8s-advanced'
import { helmChapter } from './helm'
import type { Chapter } from '../../../types'

export const orchestrationChapters: Chapter[] = [
  k8sBasicsChapter,
  k8sAdvancedChapter,
  helmChapter,
]
