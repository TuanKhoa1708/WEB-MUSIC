// ─── Request types ───────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  username: string
  email: string
  password: string
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  fullName: string
  username: string
  email: string
  role: string
  avatarUrl?: string
  isPremium?: boolean
  subscriptionPlan?: 'free' | 'premium'
  subscriptionExpiresAt?: string | null
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}

export interface RegisterResponse {
  message: string
  user?: AuthUser
}

// ─── Error types ─────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

// ─── Auth Context types ───────────────────────────────────────────────────────

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isPremium: boolean
  loading: boolean
  login: (data: LoginRequest) => Promise<AuthUser>
  logout: () => void
  refreshUser: (updatedUser: Partial<AuthUser>) => void
}
