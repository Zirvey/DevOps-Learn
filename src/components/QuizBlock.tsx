import { useEffect, useMemo, useState } from 'react'
import {
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  GripVertical,
} from 'lucide-react'
import type { QuizQuestion, QuizType } from '../types'
import { useLanguage } from '../i18n/LanguageContext'

interface QuizBlockProps {
  questions: QuizQuestion[]
}

function resolveType(q: QuizQuestion): QuizType {
  if (q.type) return q.type
  if (q.answers?.length) return 'multi'
  if (q.correctOrder?.length) return 'order'
  if (q.codeSnippet) return 'spot-error'
  return 'single'
}

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export function QuizBlock({ questions }: QuizBlockProps) {
  const { t } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [multiSelected, setMultiSelected] = useState<Record<number, number[]>>({})
  const [orderState, setOrderState] = useState<Record<number, string[]>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setCurrent(0)
    setOpenIndex(null)
    setSelected({})
    setMultiSelected({})
    setOrderState({})
    setChecked({})
  }, [questions])

  const initialOrders = useMemo(() => {
    const map: Record<number, string[]> = {}
    questions.forEach((q, i) => {
      if (resolveType(q) === 'order' && q.options) {
        map[i] = [...q.options]
      }
    })
    return map
  }, [questions])

  const index = Math.min(current, Math.max(questions.length - 1, 0))
  const q = questions[index]
  if (!q) return null

  const type = resolveType(q)
  const hasOptions = Boolean(q.options && q.options.length > 0)
  const revealed = checked[index] || openIndex === index
  const checkedCount = Object.values(checked).filter(Boolean).length

  const getOrder = (qIndex: number, question: QuizQuestion) =>
    orderState[qIndex] ?? initialOrders[qIndex] ?? question.options ?? []

  const handleCheck = (qIndex: number) => {
    setChecked((prev) => ({ ...prev, [qIndex]: true }))
    setOpenIndex(qIndex)
  }

  const isCorrect = (question: QuizQuestion, qIndex: number): boolean | null => {
    const qType = resolveType(question)
    if (qType === 'single' || qType === 'spot-error') {
      if (!question.options || selected[qIndex] === undefined) return null
      return question.options[selected[qIndex]] === question.answer
    }
    if (qType === 'multi') {
      const picks = multiSelected[qIndex]
      if (!picks || !question.options || !question.answers) return null
      const chosen = picks.map((i) => question.options![i])
      return sameSet(chosen, question.answers)
    }
    if (qType === 'order') {
      if (!question.correctOrder) return null
      return sameOrder(getOrder(qIndex, question), question.correctOrder)
    }
    return null
  }

  const moveOrderItem = (qIndex: number, from: number, direction: -1 | 1) => {
    const question = questions[qIndex]
    const list = [...getOrder(qIndex, question)]
    const to = from + direction
    if (to < 0 || to >= list.length) return
    ;[list[from], list[to]] = [list[to], list[from]]
    setOrderState((prev) => ({ ...prev, [qIndex]: list }))
  }

  const toggleMulti = (qIndex: number, optIndex: number) => {
    setMultiSelected((prev) => {
      const cur = new Set(prev[qIndex] ?? [])
      if (cur.has(optIndex)) cur.delete(optIndex)
      else cur.add(optIndex)
      return { ...prev, [qIndex]: [...cur] }
    })
  }

  const typeLabel = (qType: QuizType) => {
    if (qType === 'multi') return t('quiz.typeMulti')
    if (qType === 'order') return t('quiz.typeOrder')
    if (qType === 'spot-error') return t('quiz.typeSpotError')
    return t('quiz.typeSingle')
  }

  const stepStatus = (qIndex: number) => {
    if (!checked[qIndex] && openIndex !== qIndex) {
      if (
        selected[qIndex] !== undefined ||
        (multiSelected[qIndex]?.length ?? 0) > 0 ||
        orderState[qIndex]
      ) {
        return 'answered'
      }
      return 'idle'
    }
    const question = questions[qIndex]
    const result = isCorrect(question, qIndex)
    if (result === true) return 'correct'
    if (result === false) return 'wrong'
    return 'answered'
  }

  const correct = revealed ? isCorrect(q, index) : null
  const orderItems = type === 'order' ? getOrder(index, q) : []

  return (
    <div id="chapter-quiz" className="quiz-block quiz-block--pager">
      <div className="quiz-pager-header">
        <h3>
          <Brain size={20} />
          {t('quiz.title')}
        </h3>
        <span className="quiz-count">
          {t('quiz.stepOf', { current: index + 1, total: questions.length })}
        </span>
      </div>
      <p className="quiz-intro">{t('quiz.intro')}</p>

      <div className="quiz-steps" role="tablist" aria-label={t('quiz.title')}>
        {questions.map((_, i) => {
          const status = stepStatus(i)
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t('quiz.jumpTo', { n: i + 1 })}
              className={`quiz-step ${i === index ? 'is-current' : ''} is-${status}`}
              onClick={() => setCurrent(i)}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="quiz-item quiz-item--active" key={index}>
        <div className="quiz-question">
          <span className="quiz-number">{index + 1}</span>
          <div>
            <p>{q.question}</p>
            {type !== 'single' && (
              <span className="quiz-type-badge">{typeLabel(type)}</span>
            )}
          </div>
        </div>

        {type === 'spot-error' && q.codeSnippet && (
          <pre className="quiz-code-snippet">
            <code>{q.codeSnippet}</code>
          </pre>
        )}

        {(type === 'single' || type === 'spot-error') && hasOptions ? (
          <div className="quiz-options">
            {q.options!.map((option, optIndex) => (
              <label
                key={optIndex}
                className={`quiz-option ${
                  revealed && option === q.answer
                    ? 'correct'
                    : revealed &&
                        selected[index] === optIndex &&
                        option !== q.answer
                      ? 'wrong'
                      : ''
                } ${selected[index] === optIndex ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`quiz-${index}`}
                  checked={selected[index] === optIndex}
                  onChange={() =>
                    setSelected((prev) => ({ ...prev, [index]: optIndex }))
                  }
                  disabled={checked[index]}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ) : null}

        {type === 'multi' && hasOptions ? (
          <div className="quiz-options">
            {q.options!.map((option, optIndex) => {
              const isPicked = (multiSelected[index] ?? []).includes(optIndex)
              const isRight = q.answers?.includes(option)
              return (
                <label
                  key={optIndex}
                  className={`quiz-option ${
                    revealed && isRight
                      ? 'correct'
                      : revealed && isPicked && !isRight
                        ? 'wrong'
                        : ''
                  } ${isPicked ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isPicked}
                    onChange={() => toggleMulti(index, optIndex)}
                    disabled={checked[index]}
                  />
                  <span>{option}</span>
                </label>
              )
            })}
          </div>
        ) : null}

        {type === 'order' && orderItems.length > 0 ? (
          <div className="quiz-order-list">
            {orderItems.map((item, itemIndex) => (
              <div
                key={`${item}-${itemIndex}`}
                className={`quiz-order-item ${
                  revealed && q.correctOrder?.[itemIndex] === item
                    ? 'correct'
                    : revealed
                      ? 'wrong'
                      : ''
                }`}
              >
                <GripVertical size={16} aria-hidden />
                <span className="quiz-order-index">{itemIndex + 1}</span>
                <span className="quiz-order-text">{item}</span>
                <div className="quiz-order-controls">
                  <button
                    type="button"
                    disabled={checked[index] || itemIndex === 0}
                    onClick={() => moveOrderItem(index, itemIndex, -1)}
                    aria-label={t('quiz.moveUp')}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={
                      checked[index] || itemIndex === orderItems.length - 1
                    }
                    onClick={() => moveOrderItem(index, itemIndex, 1)}
                    aria-label={t('quiz.moveDown')}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="quiz-actions">
          {!checked[index] && (hasOptions || type === 'order') && (
            <button
              type="button"
              className="quiz-check-btn"
              onClick={() => handleCheck(index)}
            >
              {t('quiz.check')}
            </button>
          )}
          {!hasOptions && type === 'single' && (
            <button
              type="button"
              className="quiz-toggle-btn"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              {openIndex === index ? (
                <>
                  <ChevronUp size={16} />
                  {t('quiz.hideAnswer')}
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  {t('quiz.showAnswer')}
                </>
              )}
            </button>
          )}
        </div>

        {revealed && (
          <div
            className={`quiz-answer ${
              correct === true
                ? 'is-correct'
                : correct === false
                  ? 'is-wrong'
                  : ''
            }`}
          >
            {correct === true && (
              <span className="quiz-result correct">
                <CheckCircle2 size={16} />
                {t('quiz.correct')}
              </span>
            )}
            {correct === false && (
              <span className="quiz-result wrong">{t('quiz.wrong')}</span>
            )}
            {(type === 'single' || type === 'spot-error') && <p>{q.answer}</p>}
            {type === 'multi' && q.answers && (
              <p>{q.answers.join(' · ')}</p>
            )}
            {type === 'order' && q.correctOrder && (
              <ol className="quiz-order-answer">
                {q.correctOrder.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
            {q.explanation && (
              <p className="quiz-explanation">{q.explanation}</p>
            )}
          </div>
        )}
      </div>

      <div className="quiz-pager-nav">
        <button
          type="button"
          className="quiz-nav-btn"
          disabled={index === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          <ChevronLeft size={16} />
          {t('quiz.prev')}
        </button>
        <span className="quiz-pager-summary">
          {t('quiz.doneSummary', {
            checked: checkedCount,
            total: questions.length,
          })}
        </span>
        <button
          type="button"
          className="quiz-nav-btn"
          disabled={index >= questions.length - 1}
          onClick={() =>
            setCurrent((c) => Math.min(questions.length - 1, c + 1))
          }
        >
          {t('quiz.next')}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
