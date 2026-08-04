import type { ChapterTranslation } from '../../i18n/chapterTranslation'
import whatIsDevops from './what-is-devops'
import learningRoadmap from './learning-roadmap'
import devopsToolsOverview from './devops-tools-overview'
import linux from './linux'
import networking from './networking'
import git from './git'
import bash from './bash'
import ssh from './ssh'
import yaml from './yaml'
import nginx from './nginx'
import docker from './docker'
import dockerCompose from './docker-compose'
import kubernetesBasics from './kubernetes-basics'
import kubernetesAdvanced from './kubernetes-advanced'
import helm from './helm'
import cicdBasics from './cicd-basics'
import githubActions from './github-actions'
import gitlabCi from './gitlab-ci'
import gitops from './gitops'
import terraform from './terraform'
import ansible from './ansible'
import awsBasics from './aws-basics'
import awsNetworking from './aws-networking'
import awsEks from './aws-eks'
import certifications from './certifications'
import monitoring from './monitoring'
import logging from './logging'
import incidents from './incidents'
import zabbix from './zabbix'
import devsecops from './devsecops'
import portfolio from './portfolio'
import interviews from './interviews'
import officeNetworkDesign from './office-network-design'
import vlanSwitching from './vlan-switching'
import officeDhcpDns from './office-dhcp-dns'
import officeWifi from './office-wifi'
import windowsServerBasics from './windows-server-basics'
import activeDirectory from './active-directory'
import gpoUserManagement from './gpo-user-management'
import backupsDisasterRecovery from './backups-disaster-recovery'
import omadaFundamentals from './omada-fundamentals'
import omadaSwitchesVlans from './omada-switches-vlans'
import omadaWireless from './omada-wireless'
import omadaOperations from './omada-operations'
import fortigateFundamentals from './fortigate-fundamentals'
import fortigateFirewallPolicies from './fortigate-firewall-policies'
import fortinetVpn from './fortinet-vpn'
import fortinetOperations from './fortinet-operations'
import opnsenseFundamentals from './opnsense-fundamentals'
import itSupportFoundations from './it-support-foundations'
import helpdeskAndSla from './helpdesk-and-sla'
import endpointSupport from './endpoint-support'
import supportPlaybooks from './support-playbooks'

/** Aggregated English chapter bodies, keyed by slug */
export const enChaptersBySlug: Record<string, ChapterTranslation> = {
  'what-is-devops': whatIsDevops,
  'learning-roadmap': learningRoadmap,
  'devops-tools-overview': devopsToolsOverview,
  linux,
  networking,
  git,
  bash,
  ssh,
  yaml,
  nginx,
  docker,
  'docker-compose': dockerCompose,
  'kubernetes-basics': kubernetesBasics,
  'kubernetes-advanced': kubernetesAdvanced,
  helm,
  'cicd-basics': cicdBasics,
  'github-actions': githubActions,
  'gitlab-ci': gitlabCi,
  gitops,
  terraform,
  ansible,
  'aws-basics': awsBasics,
  'aws-networking': awsNetworking,
  'aws-eks': awsEks,
  certifications,
  monitoring,
  logging,
  incidents,
  zabbix,
  devsecops,
  portfolio,
  interviews,
  'office-network-design': officeNetworkDesign,
  'vlan-switching': vlanSwitching,
  'office-dhcp-dns': officeDhcpDns,
  'office-wifi': officeWifi,
  'windows-server-basics': windowsServerBasics,
  'active-directory': activeDirectory,
  'gpo-user-management': gpoUserManagement,
  'backups-disaster-recovery': backupsDisasterRecovery,
  'omada-fundamentals': omadaFundamentals,
  'omada-switches-vlans': omadaSwitchesVlans,
  'omada-wireless': omadaWireless,
  'omada-operations': omadaOperations,
  'fortigate-fundamentals': fortigateFundamentals,
  'fortigate-firewall-policies': fortigateFirewallPolicies,
  'fortinet-vpn': fortinetVpn,
  'fortinet-operations': fortinetOperations,
  'opnsense-fundamentals': opnsenseFundamentals,
  'it-support-foundations': itSupportFoundations,
  'helpdesk-and-sla': helpdeskAndSla,
  'endpoint-support': endpointSupport,
  'support-playbooks': supportPlaybooks,
}
