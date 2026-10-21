import { practiceProgressKey } from './progressScope'

type PracticeMap = Record<string, number[]>

function readMap(): PracticeMap {
  try {
    const raw =
      localStorage.getItem(practiceProgressKey()) ??
      localStorage.getItem('devops-handbook-practice')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PracticeMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: PracticeMap) {
  localStorage.setItem(practiceProgressKey(), JSON.stringify(map))
}

export function getPracticeDone(chapterSlug: string): Set<number> {
  return new Set(readMap()[chapterSlug] ?? [])
}

export function togglePracticeItem(chapterSlug: string, index: number): Set<number> {
  const map = readMap()
  const current = new Set(map[chapterSlug] ?? [])
  if (current.has(index)) current.delete(index)
  else current.add(index)
  map[chapterSlug] = [...current].sort((a, b) => a - b)
  writeMap(map)
  return current
}

export function getAllPracticeProgress(): PracticeMap {
  return readMap()
}

export function countPracticeDone(): { done: number; chapters: number } {
  const map = readMap()
  let done = 0
  let chapters = 0
  for (const items of Object.values(map)) {
    if (items.length > 0) chapters += 1
    done += items.length
  }
  return { done, chapters }
}
