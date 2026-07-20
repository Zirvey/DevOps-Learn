import type { Chapter } from '../../../types'
import { omadaFundamentalsChapter } from './fundamentals'
import { omadaSwitchesChapter } from './switches'
import { omadaWirelessChapter } from './wireless'
import { omadaOperationsChapter } from './operations'

export const omadaChapters: Chapter[] = [
  omadaFundamentalsChapter,
  omadaSwitchesChapter,
  omadaWirelessChapter,
  omadaOperationsChapter,
]

export {
  omadaFundamentalsChapter,
  omadaSwitchesChapter,
  omadaWirelessChapter,
  omadaOperationsChapter,
}
