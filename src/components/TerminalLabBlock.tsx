import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { TerminalLab } from '../types'
import { validateCommand } from '../lib/terminal/validateCommand'
import {
  isLabComplete,
  markTerminalStepComplete,
  notifyTerminalProgressUpdate,
} from '../hooks/useTerminalProgress'
import { useLanguage } from '../i18n/LanguageContext'

type HistoryLine =
  | { kind: 'system'; text: string }
  | { kind: 'input'; command: string }
  | { kind: 'output'; lines: string[] }
  | { kind: 'error'; text: string }

interface TerminalLabBlockProps {
  chapterSlug: string
  lab: TerminalLab
}

function Prompt({ lab }: { lab: TerminalLab }) {
  const user = lab.promptUser ?? 'student'
  const host = lab.promptHost ?? 'devops-handbook'
  const path = lab.promptPath ?? '~'
  return (
    <span className="terminal-prompt">
      <span className="terminal-prompt-user">
        {user}@{host}
      </span>
      <span className="terminal-prompt-path">:{path}</span>
      <span className="terminal-prompt-dollar">$</span>
    </span>
  )
}

export function TerminalLabBlock({ chapterSlug, lab }: TerminalLabBlockProps) {
  const { t } = useLanguage()
  const totalSteps = lab.steps.length
  const windowTitle = useMemo(() => {
    const user = lab.promptUser ?? 'student'
    const host = lab.promptHost ?? 'devops-handbook'
    return `${user}@${host} — zsh — 80×24`
  }, [lab.promptHost, lab.promptUser])

  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [history, setHistory] = useState<HistoryLine[]>(() => {
    const initial: HistoryLine[] = []
    if (lab.initialOutput?.length) {
      for (const line of lab.initialOutput) {
        initial.push({ kind: 'system', text: line })
      }
    }
    return initial
  })
  const [labDone, setLabDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)

  const currentStep = lab.steps[stepIndex]

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight
    }
  }, [history, labDone])

  useEffect(() => {
    inputRef.current?.focus()
  }, [stepIndex, labDone])

  const advanceOrComplete = useCallback(
    (stepId: string, explanation?: string, fakeOutput?: string[]) => {
      markTerminalStepComplete(chapterSlug, lab.id, stepId)
      notifyTerminalProgressUpdate()

      if (fakeOutput && fakeOutput.length > 0) {
        const hasContent = fakeOutput.some((line) => line.length > 0)
        if (hasContent) {
          setHistory((prev) => [...prev, { kind: 'output', lines: fakeOutput }])
        }
      }

      if (explanation) {
        setHistory((prev) => [
          ...prev,
          { kind: 'system', text: explanation },
        ])
      }

      setAttempts(0)
      setInput('')

      const nextIndex = stepIndex + 1
      if (nextIndex >= totalSteps) {
        setLabDone(true)
        setStepIndex(nextIndex)
      } else {
        setStepIndex(nextIndex)
      }
    },
    [chapterSlug, lab.id, stepIndex, totalSteps],
  )

  const errorMessage = (reason: string) => {
    if (reason === 'empty') return t('terminal.errEmpty')
    if (reason === 'no-accept') return t('terminal.errNoAccept')
    return t('terminal.errMismatch')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (labDone || !currentStep) return

    const command = input
    setHistory((prev) => [...prev, { kind: 'input', command }])

    const result = validateCommand(command, currentStep)
    if (result.ok) {
      setHistory((prev) => [
        ...prev,
        {
          kind: 'system',
          text: t('terminal.successNext'),
        },
      ])
      advanceOrComplete(
        currentStep.id,
        currentStep.explanation,
        currentStep.fakeOutput,
      )
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setHistory((prev) => [
      ...prev,
      { kind: 'error', text: errorMessage(result.reason) },
    ])
    setInput('')
  }

  const completedAll = isLabComplete(
    chapterSlug,
    lab.id,
    lab.steps.map((s) => s.id),
  )

  const stepLabel =
    labDone || completedAll
      ? t('terminal.completed')
      : t('terminal.stepOf', {
          current: Math.min(stepIndex + 1, totalSteps),
          total: totalSteps,
        })

  return (
    <div className="terminal-lab-block">
      <header className="terminal-lab-meta">
        <div className="terminal-lab-meta-top">
          <h3>{lab.title}</h3>
          <span className="terminal-lab-count">{stepLabel}</span>
        </div>
        {lab.intro && <p className="terminal-lab-intro">{lab.intro}</p>}
      </header>

      {!labDone && currentStep && (
        <div className="terminal-step-card">
          <p className="terminal-step-instruction">{currentStep.instruction}</p>
          {attempts >= 2 && currentStep.hint && (
            <p className="terminal-step-hint">
              <strong>{t('terminal.hint')}</strong> {currentStep.hint}
            </p>
          )}
        </div>
      )}

      <div
        className="mac-terminal"
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        <div className="mac-terminal-titlebar">
          <div className="mac-traffic-lights" aria-hidden="true">
            <span className="mac-traffic mac-traffic--close" />
            <span className="mac-traffic mac-traffic--minimize" />
            <span className="mac-traffic mac-traffic--zoom" />
          </div>
          <div className="mac-terminal-title">{windowTitle}</div>
          <div className="mac-terminal-titlebar-spacer" aria-hidden="true" />
        </div>

        <div ref={screenRef} className="terminal-screen" aria-live="polite">
          {history.map((line, index) => {
            if (line.kind === 'system') {
              return (
                <div key={index} className="terminal-line terminal-line--system">
                  {line.text}
                </div>
              )
            }
            if (line.kind === 'input') {
              return (
                <div key={index} className="terminal-line terminal-line--input">
                  <Prompt lab={lab} />
                  <span className="terminal-cmd">{line.command}</span>
                </div>
              )
            }
            if (line.kind === 'output') {
              return (
                <div key={index} className="terminal-line terminal-line--output">
                  {line.lines.map((out, i) => (
                    <div key={i}>{out || '\u00A0'}</div>
                  ))}
                </div>
              )
            }
            return (
              <div key={index} className="terminal-line terminal-line--error">
                {line.text}
              </div>
            )
          })}

          {!labDone && currentStep && (
            <form className="terminal-input-row" onSubmit={handleSubmit}>
              <Prompt lab={lab} />
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                aria-label={t('terminal.inputAria')}
              />
            </form>
          )}
        </div>
      </div>

      {(labDone || completedAll) && (
        <div className="terminal-lab-complete">
          <CheckCircle2 size={20} />
          <div>
            <strong>{t('terminal.labCompleteTitle')}</strong>
            <p>{t('terminal.labCompleteBody')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
