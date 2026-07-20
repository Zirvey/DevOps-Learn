import { useState } from 'react'
import { Brain, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import type { QuizQuestion } from '../types'
import { useLanguage } from '../i18n/LanguageContext'

interface QuizBlockProps {
  questions: QuizQuestion[]
}

export function QuizBlock({ questions }: QuizBlockProps) {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const handleCheck = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: true }))
    setOpenIndex(index)
  }

  const isCorrect = (q: QuizQuestion, index: number) => {
    if (!q.options || selected[index] === undefined) return null
    return q.options[selected[index]] === q.answer
  }

  return (
    <div id="chapter-quiz" className="quiz-block">
      <h3>
        <Brain size={20} />
        {t('quiz.title')}
        <span className="quiz-count">
          {questions.length} {t('common.questions')}
        </span>
      </h3>
      <p className="quiz-intro">{t('quiz.intro')}</p>

      <div className="quiz-list">
        {questions.map((q, index) => {
          const hasOptions = q.options && q.options.length > 0
          const revealed = checked[index] || openIndex === index
          const correct = isCorrect(q, index)

          return (
            <div key={index} className="quiz-item">
              <div className="quiz-question">
                <span className="quiz-number">{index + 1}</span>
                <p>{q.question}</p>
              </div>

              {hasOptions ? (
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

              <div className="quiz-actions">
                {!checked[index] && (
                  <button
                    type="button"
                    className="quiz-check-btn"
                    onClick={() => handleCheck(index)}
                  >
                    {t('quiz.check')}
                  </button>
                )}
                {!hasOptions && (
                  <button
                    type="button"
                    className="quiz-toggle-btn"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
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
                <div className={`quiz-answer ${correct === true ? 'is-correct' : correct === false ? 'is-wrong' : ''}`}>
                  {correct === true && (
                    <span className="quiz-result correct">
                      <CheckCircle2 size={16} />
                      {t('quiz.correct')}
                    </span>
                  )}
                  {correct === false && (
                    <span className="quiz-result wrong">{t('quiz.wrong')}</span>
                  )}
                  {!hasOptions && <strong>{t('quiz.answerLabel')}</strong>}
                  {hasOptions && correct === null && <strong>{t('quiz.answerLabel')}</strong>}
                  <p>{q.answer}</p>
                  {q.explanation && <p className="quiz-explanation">{q.explanation}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
