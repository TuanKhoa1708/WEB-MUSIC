// ─── User / Listener Domain Types ─────────────────────────────────────────────
// Mirrors backend User schema exactly — password is NEVER included.

export interface User {
  _id: string
  fullName: string
  username: string
  email: string
  avatarUrl: string
  role: 'user' | 'artist' | 'admin'
  isVerified: boolean
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

// ─── Query / Filter ───────────────────────────────────────────────────────────

export interface UserQueryParams {
  keyword?: string
  role?: string         // defaults to "user" (listeners) — set by backend if omitted
  isActive?: string     // "true" | "false" | "" (all)
  page?: number
  limit?: number
}

// ─── Paginated response ───────────────────────────────────────────────────────

export interface PaginatedUsers {
  success: boolean
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Status toggle response ───────────────────────────────────────────────────

export interface ToggleStatusResponse {
  success: boolean
  message: string
  data: User
}

// ─── Self-service profile update ──────────────────────────────────────────────

export interface UpdateMeInput {
  fullName?: string
  username?: string
  avatarUrl?: string
}
