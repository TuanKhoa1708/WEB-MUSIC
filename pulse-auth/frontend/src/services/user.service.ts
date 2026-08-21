import {
  getUsersApi,
  getUserByIdApi,
  toggleUserStatusApi,
  updateMeApi,
} from '@/api/user.api'
import type { User, UserQueryParams, PaginatedUsers, UpdateMeInput } from '@/types/user.types'

// ─── List users (paginated) ───────────────────────────────────────────────────

export async function getUsersService(params?: UserQueryParams): Promise<PaginatedUsers> {
  return getUsersApi(params)
}

// ─── Get single user ──────────────────────────────────────────────────────────

export async function getUserByIdService(id: string): Promise<User> {
  const res = await getUserByIdApi(id)
  return res.data
}

// ─── Toggle active status ─────────────────────────────────────────────────────

export async function toggleUserStatusService(id: string): Promise<User> {
  const res = await toggleUserStatusApi(id)
  return res.data
}

// ─── Update my own profile ────────────────────────────────────────────────────

export async function updateMeService(input: UpdateMeInput): Promise<User> {
  const res = await updateMeApi(input)
  return res.data
}
