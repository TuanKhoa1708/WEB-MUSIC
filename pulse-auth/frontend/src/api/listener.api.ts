import axiosInstance from '@/api/axios'
import type { User, UserQueryParams, PaginatedUsers, ListenerStats } from '@/types/user.types'

const BASE = '/listeners'

export async function getListenersApi(params?: UserQueryParams): Promise<PaginatedUsers> {
  const { data } = await axiosInstance.get<PaginatedUsers>(BASE, { params })
  return data
}

export async function getListenerByIdApi(id: string): Promise<{ success: boolean; data: User }> {
  const { data } = await axiosInstance.get<{ success: boolean; data: User }>(`${BASE}/${id}`)
  return data
}

export async function updateListenerApi(id: string, payload: Partial<User>): Promise<{ success: boolean; data: User }> {
  const { data } = await axiosInstance.put<{ success: boolean; data: User }>(`${BASE}/${id}`, payload)
  return data
}

export async function deleteListenerApi(id: string): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.delete<{ success: boolean }>(`${BASE}/${id}`)
  return data
}

export async function getListenerStatsApi(): Promise<{ success: boolean; data: ListenerStats }> {
  const { data } = await axiosInstance.get<{ success: boolean; data: ListenerStats }>(`${BASE}/stats`)
  return data
}
