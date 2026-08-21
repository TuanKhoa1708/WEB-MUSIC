import axiosInstance from '@/api/axios'
import type {
  User,
  UserQueryParams,
  PaginatedUsers,
  ToggleStatusResponse,
  UpdateMeInput,
} from '@/types/user.types'

const BASE = '/users'

// ─── GET /users ───────────────────────────────────────────────────────────────
// Supports: page, limit, keyword, role, isActive
// Admin-only — axiosInstance automatically attaches Bearer token
export async function getUsersApi(params?: UserQueryParams): Promise<PaginatedUsers> {
  const { data } = await axiosInstance.get<PaginatedUsers>(BASE, { params })
  return data
}

// ─── GET /users/:id ───────────────────────────────────────────────────────────
export async function getUserByIdApi(id: string): Promise<{ success: boolean; data: User }> {
  const { data } = await axiosInstance.get<{ success: boolean; data: User }>(`${BASE}/${id}`)
  return data
}

// ─── PATCH /users/:id/status ──────────────────────────────────────────────────
// Toggle isActive (deactivate / reactivate) — no hard delete
export async function toggleUserStatusApi(id: string): Promise<ToggleStatusResponse> {
  const { data } = await axiosInstance.patch<ToggleStatusResponse>(`${BASE}/${id}/status`)
  return data
}

// ─── PUT /users/me ────────────────────────────────────────────────────────────
// Any authenticated user: update their own fullName, username, avatarUrl.
export async function updateMeApi(input: UpdateMeInput): Promise<{ success: boolean; message: string; data: User }> {
  const { data } = await axiosInstance.put<{ success: boolean; message: string; data: User }>(`${BASE}/me`, input)
  return data
}

