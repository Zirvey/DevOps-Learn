import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: string[], enabled = true): string | null {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null)
  const idsKey = sectionIds.join('\0')

  useEffect(() => {
    setActiveId(sectionIds[0] ?? null)

    if (!enabled || sectionIds.length === 0) return

    const update = () => {
      const offset = 96
      let current: string | null = sectionIds[0] ?? null

      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (!element) continue

        if (element.getBoundingClientRect().top <= offset) {
          current = id
        }
      }

      setActiveId(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled, idsKey, sectionIds])

  return activeId
}
