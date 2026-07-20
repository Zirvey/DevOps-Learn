import { useState, useEffect } from 'react'
import { getCompletedChapters } from '../hooks/useProgress'

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(getCompletedChapters)

  useEffect(() => {
    const handler = () => setCompleted(getCompletedChapters())
    window.addEventListener('storage', handler)
    window.addEventListener('progress-update', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('progress-update', handler)
    }
  }, [])

  return completed
}

export function notifyProgressUpdate() {
  window.dispatchEvent(new Event('progress-update'))
}
