import type { Chapter } from '../../../types'
import { officeDesignChapter } from './design'
import { vlanSwitchingChapter } from './vlan-switching'
import { officeDhcpDnsChapter } from './dhcp-dns'
import { officeWifiChapter } from './wifi'

export const officeNetworkChapters: Chapter[] = [
  officeDesignChapter,
  vlanSwitchingChapter,
  officeDhcpDnsChapter,
  officeWifiChapter,
]

export { officeDesignChapter, vlanSwitchingChapter, officeDhcpDnsChapter, officeWifiChapter }
