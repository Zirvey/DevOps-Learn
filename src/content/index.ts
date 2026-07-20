import { introChapters } from './chapters/intro'
import { fundamentalsChapters } from './chapters/fundamentals'
import { containersChapters } from './chapters/containers'
import { orchestrationChapters } from './chapters/orchestration'
import { cicdChapters } from './chapters/cicd'
import { iacChapters } from './chapters/iac'
import { cloudChapters } from './chapters/cloud'
import { observabilityChapters } from './chapters/observability'
import { securityChapters, careerChapters } from './chapters/security-career'
import { sysadminChapters } from './chapters/sysadmin'
import { officeNetworkChapters } from './chapters/office-network'
import { omadaChapters } from './chapters/omada'
import { fortinetChapters } from './chapters/fortinet'
import { itSupportChapters } from './chapters/it-support'
import { quizzesBySlug } from './quizzes'
import { terminalLabsBySlug } from './terminal-labs'
import type { Chapter } from '../types'
import type { Locale } from '../i18n/contentLabels'
import { localizeChapter } from '../i18n/localizeChapter'

const rawChapters: Omit<Chapter, 'quiz' | 'terminalLab'>[] = [
  ...introChapters,
  ...fundamentalsChapters,
  ...containersChapters,
  ...orchestrationChapters,
  ...cicdChapters,
  ...iacChapters,
  ...cloudChapters,
  ...observabilityChapters,
  ...securityChapters,
  ...careerChapters,
  ...sysadminChapters,
  ...officeNetworkChapters,
  ...omadaChapters,
  ...fortinetChapters,
  ...itSupportChapters,
]

export const chapters: Chapter[] = rawChapters.map((chapter) => ({
  ...chapter,
  quiz: quizzesBySlug[chapter.slug] ?? [],
  terminalLab: terminalLabsBySlug[chapter.slug],
}))

export function getChapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug)
}

export function getChaptersByModule(moduleId: string): Chapter[] {
  return chapters.filter((c) => c.moduleId === moduleId).sort((a, b) => a.order - b.order)
}

export function searchChapters(query: string, locale: Locale = 'ru'): Chapter[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return chapters.filter((raw) => {
    const c = localizeChapter(raw, locale)
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.sections.some(
        (s) =>
          s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q),
      )
    )
  })
}
