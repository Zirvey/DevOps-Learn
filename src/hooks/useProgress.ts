import { chaptersProgressKey } from './progressScope'

export function getCompletedChapters(): Set<string> {
  try {
    const raw = localStorage.getItem(chaptersProgressKey())
    if (!raw) {
      // legacy guest key fallback
      const legacy = localStorage.getItem('devops-handbook-progress')
      if (!legacy) return new Set()
      return new Set(JSON.parse(legacy) as string[])
    }
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function toggleChapterComplete(slug: string): Set<string> {
  const completed = getCompletedChapters()
  if (completed.has(slug)) {
    completed.delete(slug)
  } else {
    completed.add(slug)
  }
  localStorage.setItem(chaptersProgressKey(), JSON.stringify([...completed]))
  return completed
}

export function getProgressPercent(total: number): number {
  if (total === 0) return 0
  return Math.round((getCompletedChapters().size / total) * 100)
}
