import { useEffect, useState } from 'react'

interface UseTypewriterOptions {
  speed?: number
  linePause?: number
  delay?: number
  enabled?: boolean
}

export function useTypewriter(
  lines: string[],
  { speed = 36, linePause = 320, delay = 400, enabled = true }: UseTypewriterOptions = {},
) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const linesKey = lines.join('\0')

  useEffect(() => {
    setLineIndex(0)
    setCharIndex(0)
    setStarted(false)
    setDone(false)

    if (!enabled || lines.length === 0) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReduced) {
      setStarted(true)
      setDone(true)
      setLineIndex(lines.length - 1)
      setCharIndex(lines[lines.length - 1]?.length ?? 0)
      return
    }

    const startTimer = window.setTimeout(() => setStarted(true), delay)
    return () => window.clearTimeout(startTimer)
  }, [enabled, delay, linesKey, lines.length])

  useEffect(() => {
    if (!started || done || lines.length === 0) return

    const currentLine = lines[lineIndex] ?? ''

    if (charIndex < currentLine.length) {
      const timer = window.setTimeout(() => setCharIndex((c) => c + 1), speed)
      return () => window.clearTimeout(timer)
    }

    if (lineIndex < lines.length - 1) {
      const timer = window.setTimeout(() => {
        setLineIndex((l) => l + 1)
        setCharIndex(0)
      }, linePause)
      return () => window.clearTimeout(timer)
    }

    setDone(true)
  }, [started, done, lineIndex, charIndex, lines, linesKey, speed, linePause])

  const visibleLines = lines.map((line, i) => {
    if (i < lineIndex) return line
    if (i === lineIndex) return line.slice(0, charIndex)
    return ''
  })

  const isTyping = started && !done

  return { visibleLines, isTyping, done, started }
}
