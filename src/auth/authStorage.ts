export interface AuthUser {
  id: string
  email: string
  displayName: string
  createdAt: string
  lastLoginAt: string
  /** SHA-256 hex of password + salt */
  passwordHash: string
  salt: string
}

export interface AuthSession {
  userId: string
  email: string
  displayName: string
}

const USERS_KEY = 'devops-handbook-users'
const SESSION_KEY = 'devops-handbook-session'

function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function readUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AuthUser[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (!session?.userId || !session.email) return null
    return session
  } catch {
    return null
  }
}

export function setSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getUserById(id: string): AuthUser | undefined {
  return readUsers().find((u) => u.id === id)
}

export function getUserByEmail(email: string): AuthUser | undefined {
  const normalized = email.trim().toLowerCase()
  return readUsers().find((u) => u.email === normalized)
}

export async function registerUser(input: {
  email: string
  password: string
  displayName: string
}): Promise<{ ok: true; session: AuthSession } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const displayName = input.displayName.trim() || email.split('@')[0]
  const password = input.password

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'invalid-email' }
  }
  if (password.length < 6) {
    return { ok: false, error: 'weak-password' }
  }
  if (getUserByEmail(email)) {
    return { ok: false, error: 'email-taken' }
  }

  const salt = randomHex(16)
  const passwordHash = await hashPassword(password, salt)
  const now = new Date().toISOString()
  const user: AuthUser = {
    id: randomHex(12),
    email,
    displayName,
    createdAt: now,
    lastLoginAt: now,
    passwordHash,
    salt,
  }

  const users = readUsers()
  users.push(user)
  writeUsers(users)

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  }
  setSession(session)
  return { ok: true, session }
}

export async function loginUser(input: {
  email: string
  password: string
}): Promise<{ ok: true; session: AuthSession } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase()
  const user = getUserByEmail(email)
  if (!user) return { ok: false, error: 'invalid-credentials' }

  const hash = await hashPassword(input.password, user.salt)
  if (hash !== user.passwordHash) {
    return { ok: false, error: 'invalid-credentials' }
  }

  const users = readUsers().map((u) =>
    u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u,
  )
  writeUsers(users)

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  }
  setSession(session)
  return { ok: true, session }
}

export function logoutUser() {
  setSession(null)
}

export function updateDisplayName(userId: string, displayName: string): AuthSession | null {
  const name = displayName.trim()
  if (!name) return getSession()

  const users = readUsers().map((u) =>
    u.id === userId ? { ...u, displayName: name } : u,
  )
  writeUsers(users)

  const session = getSession()
  if (!session || session.userId !== userId) return session
  const next = { ...session, displayName: name }
  setSession(next)
  return next
}

/** Storage key suffix for the current user (or guest). */
export function progressScopeKey(): string {
  const session = getSession()
  return session ? `user:${session.userId}` : 'guest'
}
