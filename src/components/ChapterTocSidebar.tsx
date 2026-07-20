import type { Chapter } from '../types'
import { getChapterTocItems } from '../utils/chapterToc'
import { useActiveSection } from '../hooks/useActiveSection'
import { useLanguage } from '../i18n/LanguageContext'

interface ChapterTocSidebarProps {
  chapter: Chapter
}

export function ChapterTocSidebar({ chapter }: ChapterTocSidebarProps) {
  const { t } = useLanguage()
  const items = getChapterTocItems(chapter, {
    practice: t('chapter.tocPractice'),
    terminal: t('chapter.tocTerminal'),
    quiz: t('chapter.tocQuiz'),
    resources: t('chapter.tocResources'),
  })

  if (items.length === 0) return null

  const sectionIds = items.map((item) => item.id)
  const activeId = useActiveSection(sectionIds)

  return (
    <aside className="toc-sidebar" aria-label={t('chapter.tocAria')}>
      <div className="toc-sidebar-inner">
        <h3 className="toc-sidebar-title">{t('chapter.tocSidebar')}</h3>
        <nav className="toc-sidebar-nav">
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={activeId === item.id ? 'active' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
