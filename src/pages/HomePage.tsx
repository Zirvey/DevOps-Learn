import { Link } from 'react-router-dom'
import {
  Rocket,
  Terminal,
  Box,
  Layers,
  GitBranch,
  FileCode,
  Cloud,
  Activity,
  Shield,
  GraduationCap,
  Server,
  Network,
  Wifi,
  ShieldCheck,
  Headphones,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { modules } from '../content/modules'
import { chapters, getChaptersByModule } from '../content'
import { useProgress } from '../hooks/useProgressState'
import { getProgressPercent } from '../hooks/useProgress'
import { PageHero } from '../components/PageHero'
import { getLocalizedModule } from '../i18n/contentLabels'
import { useLanguage } from '../i18n/LanguageContext'

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Terminal,
  Box,
  Layers,
  GitBranch,
  FileCode,
  Cloud,
  Activity,
  Shield,
  GraduationCap,
  Server,
  Network,
  Wifi,
  ShieldCheck,
  Headphones,
}

export function HomePage() {
  const completed = useProgress()
  const { locale, t } = useLanguage()
  const progress = getProgressPercent(chapters.length)
  const totalSections = chapters.reduce((sum, c) => sum + c.sections.length, 0)

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
            <ArrowRight size={16} />
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
            live: true,
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

      <section className="modules-grid">
        <div className="section-header">
          <h2>{t('home.modulesSectionTitle')}</h2>
          <p className="section-header-sub">{t('home.modulesSectionSub')}</p>
        </div>
        <div className="grid">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((module) => {
              const Icon = iconMap[module.icon] ?? Terminal
              const moduleChapters = getChaptersByModule(module.id)
              const localizedModule = getLocalizedModule(module.id, locale) ?? module
              const doneCount = moduleChapters.filter((c) =>
                completed.has(c.slug),
              ).length
              const firstChapter = moduleChapters[0]

              return (
                <Link
                  key={module.id}
                  to={firstChapter ? `/chapter/${firstChapter.slug}` : '/'}
                  className="module-card"
                >
                  <div className="module-card-icon">
                    <Icon size={24} />
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
                    <ArrowRight size={16} />
                  </div>
                </Link>
              )
            })}
        </div>
      </section>
    </div>
  )
}
