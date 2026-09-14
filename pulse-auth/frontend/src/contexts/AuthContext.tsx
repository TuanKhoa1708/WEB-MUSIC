import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { loginService, logoutService } from '@/services/auth.service'
import { getToken, removeToken, getUserInfo, setUserInfo } from '@/utils/token'
import axiosInstance from '@/api/axios'
import type { AuthContextValue, AuthUser, LoginRequest } from '@/types/auth'

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore user from localStorage, then verify role from server.
  // This ensures revoked artists can't persist access via stale cached role.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    // Restore immediately from localStorage for fast initial render
    const savedUser = getUserInfo()
    if (savedUser) {
      setUser(savedUser)
    }

    // Then verify current role from the server (async, non-blocking)
    axiosInstance.get<AuthUser>('/auth/me')
      .then(({ data }) => {
        // Only update if role or key fields changed (to avoid infinite re-renders)
        setUser((prev) => {
          const merged = { ...prev, ...data }
          // Persist the refreshed user with server-authoritative role
          setUserInfo(merged)
          return merged
        })
      })
      .catch(() => {
        // Token invalid / expired → force logout
        removeToken()
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
