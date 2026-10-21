import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getSession,
  loginUser,
  logoutUser,
  registerUser,
  updateDisplayName,
  type AuthSession,
} from './authStorage'
import { migrateGuestProgressToUser } from '../hooks/progressScope'
import { notifyProgressUpdate } from '../hooks/useProgressState'
import { notifyTerminalProgressUpdate } from '../hooks/useTerminalProgress'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  register: (input: {
    email: string
    password: string
    displayName: string
  }) => Promise<{ ok: true } | { ok: false; error: string }>
  login: (input: {
    email: string
    password: string
  }) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => void
  setDisplayName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getSession())

  const register = useCallback(
    async (input: { email: string; password: string; displayName: string }) => {
      const result = await registerUser(input)
      if (!result.ok) return result
      migrateGuestProgressToUser(result.session.userId)
      setSessionState(result.session)
      notifyProgressUpdate()
      notifyTerminalProgressUpdate()
      return { ok: true as const }
    },
    [],
  )

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const result = await loginUser(input)
      if (!result.ok) return result
      migrateGuestProgressToUser(result.session.userId)
      setSessionState(result.session)
      notifyProgressUpdate()
      notifyTerminalProgressUpdate()
      return { ok: true as const }
    },
    [],
  )

  const logout = useCallback(() => {
    logoutUser()
    setSessionState(null)
    notifyProgressUpdate()
    notifyTerminalProgressUpdate()
  }, [])

  const setDisplayName = useCallback((name: string) => {
    const current = getSession()
    if (!current) return
    const next = updateDisplayName(current.userId, name)
    setSessionState(next)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: !!session,
      register,
      login,
      logout,
      setDisplayName,
    }),
    [session, register, login, logout, setDisplayName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
