import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { modules } from '../content/modules'
import { chapters, getChaptersByModule } from '../content'
import { useProgress } from '../hooks/useProgressState'
import { getProgressPercent } from '../hooks/useProgress'
import { PageHero } from '../components/PageHero'
import { TracksSection } from '../components/TracksSection'
import {
  getModuleIcon,
  PixelArrowRightIcon,
} from '../components/moduleIcons'
import { getLocalizedModule } from '../i18n/contentLabels'
import { useLanguage } from '../i18n/LanguageContext'
import type { Module } from '../types'

/** Core DevOps path — shown in the main modules section */
const CORE_IDS = new Set([
  'intro',
  'fundamentals',
  'containers',
  'orchestration',
  'cicd',
  'iac',
  'cloud',
  'observability',
  'security',
  'career',
])

/** Extra / adjacent skills — separate section */
const EXTRA_IDS = new Set([
  'sysadmin',
  'office-network',
  'omada',
  'fortinet',
  'opnsense',
  'it-support',
])

export function HomePage() {
  const completed = useProgress()
  const { locale, t } = useLanguage()
  const progress = getProgressPercent(chapters.length)
  const totalSections = chapters.reduce((sum, c) => sum + c.sections.length, 0)

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.order - b.order),
    [],
  )

  const coreModules = sortedModules.filter((m) => CORE_IDS.has(m.id))
  const extraModules = sortedModules.filter((m) => EXTRA_IDS.has(m.id))

  const renderModuleCard = (module: Module) => {
    const Icon = getModuleIcon(module.icon)
    const moduleChapters = getChaptersByModule(module.id)
    const localizedModule = getLocalizedModule(module.id, locale) ?? module
    const doneCount = moduleChapters.filter((c) => completed.has(c.slug)).length
    const firstChapter = moduleChapters[0]

    return (
      <Link
        key={module.id}
        to={firstChapter ? `/chapter/${firstChapter.slug}` : '/'}
        className="module-card"
      >
        <div className="module-card-icon">
          <Icon size={24} aria-hidden />
        </div>
        <h3>{localizedModule.title}</h3>
        <p>{localizedModule.description}</p>
        <div className="module-card-footer">
          <span>
            {t('home.moduleCardFooter', {
              chapters: moduleChapters.length,
              done: doneCount,
            })}
          </span>
          <PixelArrowRightIcon size={16} aria-hidden />
        </div>
      </Link>
    )
  }

  return (
    <div className="home-page">
      <PageHero
        badge={t('home.heroBadge')}
        welcome={{
          titlePrefix: t('home.heroTitlePrefix'),
          titleAccent: t('home.heroTitleAccent'),
          subtitle: t('home.heroSubtitle'),
        }}
        trustLine={t('home.trustLine', {
          completed: completed.size,
          total: chapters.length,
          modules: modules.length,
          sections: totalSections,
        })}
        actions={
          <Link to="/chapter/what-is-devops" className="btn btn-primary">
            {t('header.startLearning')}
            <PixelArrowRightIcon size={16} aria-hidden />
          </Link>
        }
        metrics={[
          {
            label: t('home.metricChaptersLabel'),
            value: String(chapters.length),
            delta:
              progress > 0
                ? t('home.metricChaptersDeltaProgress', { progress })
                : t('home.metricChaptersDeltaZero'),
          },
          {
            label: t('home.metricModulesLabel'),
            value: String(modules.length),
            delta: t('home.metricModulesDelta'),
          },
          {
            label: t('home.metricProgressLabel'),
            value: `${progress}%`,
            delta:
              completed.size > 0
                ? t('home.metricProgressDeltaDone', { count: completed.size })
                : t('home.metricProgressDeltaEmpty'),
          },
        ]}
      />

      <TracksSection />

      <section className="modules-grid">
        <div className="section-header">
          <h2>{t('home.modulesSectionTitle')}</h2>
          <p className="section-header-sub">{t('home.modulesSectionSub')}</p>
        </div>
        <div className="grid">{coreModules.map(renderModuleCard)}</div>
      </section>

      <section className="modules-grid modules-grid--extra">
        <div className="section-header">
          <h2>{t('home.modulesExtraTitle')}</h2>
          <p className="section-header-sub">{t('home.modulesExtraSub')}</p>
        </div>
        <div className="grid">{extraModules.map(renderModuleCard)}</div>
      </section>
    </div>
  )
}
