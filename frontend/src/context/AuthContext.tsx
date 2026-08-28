import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { User } from '@/types/user'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  // Phase 10D: lets a page that just saved a profile/settings change
  // (Profile.tsx, Settings.tsx) update the shared cached user so
  // everything reading it (e.g. Topbar's initials) reflects the change
  // immediately, without a full reload. Does not touch login/register/
  // logout or any cookie/JWT behavior.
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    authService.me().then((u) => {
      setUser(u)
      setIsLoading(false)
    })
    const onUnauthorized = () => setUser(null)
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password)
    setUser(u)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const u = await authService.register(name, email, password)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((updated: User) => {
    setUser(updated)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
