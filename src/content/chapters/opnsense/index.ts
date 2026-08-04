import type { Chapter } from '../../../types'
import { opnsenseFundamentalsChapter } from './fundamentals'
import { opnsenseFirewallNatChapter } from './firewall-nat'
import { opnsenseVpnChapter } from './vpn'
import { opnsenseServicesChapter } from './services'
import { opnsenseOperationsChapter } from './operations'

export const opnsenseChapters: Chapter[] = [
  opnsenseFundamentalsChapter,
  opnsenseFirewallNatChapter,
  opnsenseVpnChapter,
  opnsenseServicesChapter,
  opnsenseOperationsChapter,
]

export {
  opnsenseFundamentalsChapter,
  opnsenseFirewallNatChapter,
  opnsenseVpnChapter,
  opnsenseServicesChapter,
  opnsenseOperationsChapter,
}
