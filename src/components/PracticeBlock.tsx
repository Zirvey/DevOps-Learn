import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ListChecks,
} from 'lucide-react'
import type { PracticeItem } from '../types'
import { useLanguage } from '../i18n/LanguageContext'
import { normalizePracticeList } from '../utils/practiceItems'

interface PracticeBlockProps {
  chapterSlug: string
  practice: Array<string | PracticeItem>
  done: Set<number>
  onToggle: (index: number) => void
}

export function PracticeBlock({
  chapterSlug,
  practice,
  done,
  onToggle,
}: PracticeBlockProps) {
  const { t, locale } = useLanguage()
  const items = normalizePracticeList(practice, locale)
  const [current, setCurrent] = useState(0)
  const [hintOpen, setHintOpen] = useState(false)

  useEffect(() => {
    setCurrent(0)
    setHintOpen(false)
  }, [chapterSlug])

  useEffect(() => {
    setHintOpen(false)
  }, [current])

  if (items.length === 0) return null

  const index = Math.min(current, items.length - 1)
  const item = items[index]
  const isDone = done.has(index)
  const doneCount = items.reduce(
    (acc, _, i) => (done.has(i) ? acc + 1 : acc),
    0,
  )

  return (
    <div id="chapter-practice" className="practice-block practice-block--pager">
      <div className="practice-pager-header">
        <h3>
          <ListChecks size={20} />
          {t('chapter.practiceTitle')}
        </h3>
        <span className="practice-count">
          {t('chapter.practiceStepOf', {
            current: index + 1,
            total: items.length,
          })}
        </span>
      </div>
      <p className="practice-intro">{t('chapter.practiceIntro')}</p>

      <div
        className="practice-steps"
        role="tablist"
        aria-label={t('chapter.practiceTitle')}
      >
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t('chapter.practiceJumpTo', { n: i + 1 })}
            className={`practice-step ${i === index ? 'is-current' : ''} ${
              done.has(i) ? 'is-done' : ''
            }`}
            onClick={() => setCurrent(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className={`practice-item ${isDone ? 'is-done' : ''}`}>
        <div className="practice-item-top">
          <span className="practice-number">{index + 1}</span>
          <p className="practice-task">{item.task}</p>
        </div>

        <div className="practice-item-actions">
          <label className="practice-check-row practice-check-row--pager">
            <input
              type="checkbox"
              checked={isDone}
              onChange={() => onToggle(index)}
              aria-label={t('chapter.practiceCheckAria', { n: index + 1 })}
            />
            <span>
              {isDone
                ? t('chapter.practiceMarkedDone')
                : t('chapter.practiceMarkDone')}
            </span>
          </label>

          <button
            type="button"
            className={`practice-hint-btn ${hintOpen ? 'is-open' : ''}`}
            onClick={() => setHintOpen((v) => !v)}
            aria-expanded={hintOpen}
          >
            <Lightbulb size={16} />
            {hintOpen ? t('chapter.practiceHideHint') : t('chapter.practiceShowHint')}
          </button>
        </div>

        {hintOpen && item.hint && (
          <div className="practice-hint">
            <pre>{item.hint}</pre>
          </div>
        )}
      </div>

      <div className="practice-pager-nav">
        <button
          type="button"
          className="practice-nav-btn"
          disabled={index === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          <ChevronLeft size={16} />
          {t('chapter.practicePrev')}
        </button>
        <span className="practice-pager-summary">
          {t('chapter.practiceDoneSummary', {
            done: doneCount,
            total: items.length,
          })}
        </span>
        <button
          type="button"
          className="practice-nav-btn"
          disabled={index >= items.length - 1}
          onClick={() => setCurrent((c) => Math.min(items.length - 1, c + 1))}
        >
          {t('chapter.practiceNext')}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
