import { useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import type { Chapter } from '../types'
import { getChapterTocItems } from '../utils/chapterToc'
import { MarkdownContent } from './MarkdownContent'
import { CodeBlock } from './CodeBlock'
import { QuizBlock } from './QuizBlock'
import { PracticeBlock } from './PracticeBlock'
import { ChapterComments } from './ChapterComments'
import { TerminalLabBlock } from './TerminalLabBlock'
import { toggleChapterComplete } from '../hooks/useProgress'
import { notifyProgressUpdate, useProgress } from '../hooks/useProgressState'
import {
  getPracticeDone,
  togglePracticeItem,
} from '../hooks/usePracticeProgress'
import { getLocalizedModule } from '../i18n/contentLabels'
import { useLanguage } from '../i18n/LanguageContext'

interface ChapterViewProps {
  chapter: Chapter
}

export function ChapterView({ chapter }: ChapterViewProps) {
  const completed = useProgress()
  const { locale, t } = useLanguage()
  const isDone = completed.has(chapter.slug)
  const [practiceDone, setPracticeDone] = useState(() =>
    getPracticeDone(chapter.slug),
  )

  useEffect(() => {
    setPracticeDone(getPracticeDone(chapter.slug))
  }, [chapter.slug])

  const module = getLocalizedModule(chapter.moduleId, locale)
  const tocItems = getChapterTocItems(chapter, {
    practice: t('chapter.tocPractice'),
    terminal: t('chapter.tocTerminal'),
    quiz: t('chapter.tocQuiz'),
    resources: t('chapter.tocResources'),
    comments: t('chapter.tocComments'),
  })

  const handleToggleComplete = () => {
    toggleChapterComplete(chapter.slug)
    notifyProgressUpdate()
  }

  const handlePracticeToggle = (index: number) => {
    setPracticeDone(togglePracticeItem(chapter.slug, index))
  }

  const levelKey = `common.level.${chapter.level}` as const

  return (
    <article className="chapter-view">
      <header className="chapter-header">
        <div className="chapter-meta">
          {module && <span className="module-badge">{module.title}</span>}
          <span className={`level-badge level-${chapter.level}`}>
            {t(levelKey)}
          </span>
          <span className="duration-badge">{chapter.duration}</span>
          <span className="duration-badge">
            {chapter.sections.length} {t('common.sections')}
          </span>
          {chapter.quiz && chapter.quiz.length > 0 && (
            <span className="quiz-badge">
              {chapter.quiz.length} {t('common.questions')}
            </span>
          )}
        </div>
        <h1>{chapter.title}</h1>
        <p className="chapter-description">{chapter.description}</p>
        <button
          type="button"
          className={`complete-btn ${isDone ? 'done' : ''}`}
          onClick={handleToggleComplete}
        >
          <CheckCircle2 size={18} />
          {isDone ? t('chapter.markedComplete') : t('chapter.markComplete')}
        </button>
      </header>

      {tocItems.length > 0 && (
        <nav className="chapter-toc chapter-toc--mobile" aria-label={t('chapter.tocAria')}>
          <h3>{t('chapter.tocMobile')}</h3>
          <ol>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="chapter-sections">
        {chapter.sections.map((section, i) => (
          <section key={i} id={`section-${i}`} className="content-section">
            <h2>{section.title}</h2>
            <MarkdownContent content={section.content} />
            {section.code && (
              <CodeBlock
                language={section.code.language}
                code={section.code.code}
                caption={section.code.caption}
              />
            )}
            {section.codes?.map((block, j) => (
              <CodeBlock
                key={j}
                language={block.language}
                code={block.code}
                caption={block.caption}
              />
            ))}
          </section>
        ))}
      </div>

      {chapter.practice.length > 0 && (
        <PracticeBlock
          chapterSlug={chapter.slug}
          practice={chapter.practice}
          done={practiceDone}
          onToggle={handlePracticeToggle}
        />
      )}

      {chapter.terminalLab && (
        <div id="chapter-terminal-lab">
          <TerminalLabBlock chapterSlug={chapter.slug} lab={chapter.terminalLab} />
        </div>
      )}

      {chapter.quiz && chapter.quiz.length > 0 && <QuizBlock questions={chapter.quiz} />}

      {chapter.resources.length > 0 && (
        <div id="chapter-resources" className="resources-block">
          <h3>{t('chapter.resourcesTitle')}</h3>
          <ul>
            {chapter.resources.map((resource) => (
              <li key={resource.url}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.title}
                  <ExternalLink size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChapterComments chapterSlug={chapter.slug} />
    </article>
  )
}
