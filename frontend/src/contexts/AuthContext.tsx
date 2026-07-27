import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { loginService, logoutService } from '@/services/auth.service'
import { getToken, removeToken } from '@/utils/token'
import type { AuthContextValue, AuthUser, LoginRequest } from '@/types/auth'

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: check whether a token already exists in storage.
  // If yes, we consider the session still alive (no silent refresh implemented here).
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    // If you later add a /auth/me endpoint, call it here to hydrate user.
    // For now we mark as authenticated with a null user object until the
    // first API call that returns user data.
    setLoading(false)
  }, [])

  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    const loggedInUser = await loginService(data)
    setUser(loggedInUser)
  }, [])

  const logout = useCallback((): void => {
    logoutService()
    removeToken()
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!getToken(),
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
