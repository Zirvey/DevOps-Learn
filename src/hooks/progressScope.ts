import { progressScopeKey } from '../auth/authStorage'

const GUEST = 'guest'

function scoped(base: string, scope = progressScopeKey()) {
  return `${base}:${scope}`
}

export function chaptersProgressKey(scope?: string) {
  return scoped('devops-handbook-progress', scope)
}

export function practiceProgressKey(scope?: string) {
  return scoped('devops-handbook-practice', scope)
}

export function terminalProgressKey(scope?: string) {
  return scoped('devops-handbook-terminal-progress', scope)
}

/** Copy guest data into user bucket if user bucket is empty. */
export function migrateGuestProgressToUser(userId: string) {
  const userScope = `user:${userId}`
  const pairs: [string, string][] = [
    [chaptersProgressKey(GUEST), chaptersProgressKey(userScope)],
    [practiceProgressKey(GUEST), practiceProgressKey(userScope)],
    [terminalProgressKey(GUEST), terminalProgressKey(userScope)],
  ]

  // Also migrate legacy unscoped keys once
  const legacy: [string, string][] = [
    ['devops-handbook-progress', chaptersProgressKey(userScope)],
    ['devops-handbook-practice', practiceProgressKey(userScope)],
    ['devops-handbook-terminal-progress', terminalProgressKey(userScope)],
  ]

  for (const [from, to] of [...pairs, ...legacy]) {
    try {
      const existing = localStorage.getItem(to)
      if (existing && existing !== '[]' && existing !== '{}') continue
      const source = localStorage.getItem(from)
      if (!source || source === '[]' || source === '{}') continue
      localStorage.setItem(to, source)
    } catch {
      /* ignore */
    }
  }
}
