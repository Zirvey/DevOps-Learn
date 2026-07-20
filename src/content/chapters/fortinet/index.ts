import type { Chapter } from '../../../types'
import { fortigateFundamentalsChapter } from './fundamentals'
import { fortigatePoliciesChapter } from './policies'
import { fortinetVpnChapter } from './vpn'
import { fortinetOperationsChapter } from './operations'

export const fortinetChapters: Chapter[] = [
  fortigateFundamentalsChapter,
  fortigatePoliciesChapter,
  fortinetVpnChapter,
  fortinetOperationsChapter,
]

export {
  fortigateFundamentalsChapter,
  fortigatePoliciesChapter,
  fortinetVpnChapter,
  fortinetOperationsChapter,
}
