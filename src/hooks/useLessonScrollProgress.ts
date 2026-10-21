import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/** Reading progress 0–1 for lesson pages */
export function useLessonScrollProgress(enabled: boolean): number {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)

    if (!enabled) return

    const update = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      const value =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      setProgress(value)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled, pathname])

  return progress
}
