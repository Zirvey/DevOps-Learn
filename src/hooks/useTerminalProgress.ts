import { useEffect, useState } from 'react'

const STORAGE_KEY = 'devops-handbook-terminal-progress'

export type TerminalProgressStore = Record<string, Record<string, string[]>>

function readStore(): TerminalProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as TerminalProgressStore
  } catch {
    return {}
  }
}

function writeStore(store: TerminalProgressStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getTerminalProgressStore(): TerminalProgressStore {
  return readStore()
}

export function markTerminalStepComplete(
  chapterSlug: string,
  labId: string,
  stepId: string,
): void {
  const store = readStore()
  const labSteps = new Set(store[chapterSlug]?.[labId] ?? [])
  labSteps.add(stepId)
  store[chapterSlug] = {
    ...store[chapterSlug],
    [labId]: [...labSteps],
  }
  writeStore(store)
}

export function isStepComplete(
  chapterSlug: string,
  labId: string,
  stepId: string,
): boolean {
  const completed = readStore()[chapterSlug]?.[labId] ?? []
  return completed.includes(stepId)
}

export function isLabComplete(
  chapterSlug: string,
  labId: string,
  stepIds: string[],
): boolean {
  if (stepIds.length === 0) return false
  const completed = new Set(readStore()[chapterSlug]?.[labId] ?? [])
  return stepIds.every((id) => completed.has(id))
}

export function notifyTerminalProgressUpdate(): void {
  window.dispatchEvent(new Event('terminal-progress-update'))
}

export function useTerminalProgress(): TerminalProgressStore {
  const [store, setStore] = useState(readStore)

  useEffect(() => {
    const sync = () => setStore(readStore())
    window.addEventListener('storage', sync)
    window.addEventListener('terminal-progress-update', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('terminal-progress-update', sync)
    }
  }, [])

  return store
}
