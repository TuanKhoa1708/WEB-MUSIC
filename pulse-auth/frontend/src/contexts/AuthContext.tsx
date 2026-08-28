import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { loginService, logoutService } from '@/services/auth.service'
import { getToken, removeToken, getUserInfo, setUserInfo } from '@/utils/token'
import type { AuthContextValue, AuthUser, LoginRequest } from '@/types/auth'

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: check whether a token already exists in storage.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    // Restore user from local storage
    const savedUser = getUserInfo()
    if (savedUser) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (data: LoginRequest): Promise<AuthUser> => {
    const loggedInUser = await loginService(data)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const logout = useCallback((): void => {
    logoutService()
    removeToken()
    setUser(null)
  }, [])

  const AuthContextV: AuthContextValue = {
    user,
    isAuthenticated: !!getToken(),
    isPremium: user?.isPremium === true,
    loading,
    login,
    logout,
    refreshUser: (updatedUser: Partial<AuthUser>) => {
      setUser((prev) => {
        if (!prev) return prev
        const merged = { ...prev, ...updatedUser }
        setUserInfo(merged)
        return merged
      })
    },
  }

  return <AuthContext.Provider value={AuthContextV}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
