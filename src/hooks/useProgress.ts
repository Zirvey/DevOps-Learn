const STORAGE_KEY = 'devops-handbook-progress'

export function getCompletedChapters(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
  return completed
}

export function getProgressPercent(total: number): number {
  if (total === 0) return 0
  return Math.round((getCompletedChapters().size / total) * 100)
}
