import type { LearningTrack } from '../types'

export const learningTracks: LearningTrack[] = [
  {
    id: 'devops',
    titleRu: 'Трек DevOps',
    titleEn: 'DevOps track',
    descriptionRu:
      'От Linux и Git до Docker, Kubernetes, CI/CD, Terraform и observability — путь junior DevOps.',
    descriptionEn:
      'From Linux and Git to Docker, Kubernetes, CI/CD, Terraform, and observability — a junior DevOps path.',
    slugs: [
      'what-is-devops',
      'learning-roadmap',
      'linux',
      'git',
      'bash',
      'python-for-devops',
      'ssh',
      'yaml',
      'networking',
      'tls-pki',
      'nginx',
      'docker',
      'docker-compose',
      'kubernetes-basics',
      'kubernetes-advanced',
      'helm',
      'cicd-basics',
      'github-actions',
      'gitlab-ci',
      'gitops',
      'terraform',
      'ansible',
      'aws-basics',
      'aws-networking',
      'aws-eks',
      'monitoring',
      'logging',
      'troubleshooting-scenarios',
      'incidents',
      'devsecops',
      'secrets-management',
      'finops-cost',
      'portfolio',
      'certifications',
      'capstone-project',
      'interviews',
    ],
  },
  {
    id: 'sysadmin',
    titleRu: 'Трек Sysadmin → DevOps',
    titleEn: 'Sysadmin → DevOps track',
    descriptionRu:
      'Для сисадминов: Windows/AD, сети, Linux, затем контейнеры и автоматизация.',
    descriptionEn:
      'For sysadmins: Windows/AD, networking, Linux, then containers and automation.',
    slugs: [
      'what-is-devops',
      'windows-server-basics',
      'active-directory',
      'gpo-user-management',
      'backups-disaster-recovery',
      'linux',
      'networking',
      'ssh',
      'bash',
      'nginx',
      'docker',
      'ansible',
      'monitoring',
      'zabbix',
      'troubleshooting-scenarios',
      'secrets-management',
      'capstone-project',
    ],
  },
  {
    id: 'office-it',
    titleRu: 'Трек Office IT',
    titleEn: 'Office IT track',
    descriptionRu:
      'Офисные сети, Wi‑Fi, Omada, Fortinet, OPNsense и поддержка пользователей.',
    descriptionEn:
      'Office networks, Wi‑Fi, Omada, Fortinet, OPNsense, and end-user support.',
    slugs: [
      'office-network-design',
      'vlan-switching',
      'office-dhcp-dns',
      'office-wifi',
      'omada-fundamentals',
      'omada-switches-vlans',
      'omada-wireless',
      'omada-operations',
      'fortigate-fundamentals',
      'fortigate-firewall-policies',
      'fortinet-vpn',
      'fortinet-operations',
      'opnsense-fundamentals',
      'opnsense-firewall-nat',
      'opnsense-vpn',
      'opnsense-services',
      'opnsense-operations',
      'it-support-foundations',
      'helpdesk-and-sla',
      'endpoint-support',
      'support-playbooks',
    ],
  },
]

export function getTrackById(id: string): LearningTrack | undefined {
  return learningTracks.find((t) => t.id === id)
}

export function getNextSlugInTrack(
  trackId: string,
  currentSlug: string,
): string | undefined {
  const track = getTrackById(trackId)
  if (!track) return undefined
  const idx = track.slugs.indexOf(currentSlug)
  if (idx < 0 || idx >= track.slugs.length - 1) return undefined
  return track.slugs[idx + 1]
}
