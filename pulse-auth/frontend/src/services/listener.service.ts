import {
  getListenersApi,
  getListenerByIdApi,
  updateListenerApi,
  deleteListenerApi,
  getListenerStatsApi,
} from '@/api/listener.api'
import type { User, UserQueryParams, PaginatedUsers, ListenerStats } from '@/types/user.types'

export async function getListenersService(params?: UserQueryParams): Promise<PaginatedUsers> {
  return getListenersApi(params)
}

export async function getListenerByIdService(id: string): Promise<User> {
  const res = await getListenerByIdApi(id)
  return res.data
}

export async function updateListenerService(id: string, payload: Partial<User>): Promise<User> {
  const res = await updateListenerApi(id, payload)
  return res.data
}

export async function deleteListenerService(id: string): Promise<boolean> {
  const res = await deleteListenerApi(id)
  return res.success
}

export async function getListenerStatsService(): Promise<ListenerStats> {
  const res = await getListenerStatsApi()
  return res.data
}
