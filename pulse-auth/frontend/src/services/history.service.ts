import { getHistoryApi, addHistoryApi, clearHistoryApi } from '@/api/history.api'
import type { PaginatedHistory, HistoryQueryParams } from '@/types/history.types'

export async function getHistoryService(params: HistoryQueryParams): Promise<PaginatedHistory> {
  return getHistoryApi(params)
}

export async function addHistoryService(userId: string, songId: string): Promise<void> {
  await addHistoryApi(userId, songId)
}

export async function clearHistoryService(userId: string): Promise<void> {
  await clearHistoryApi(userId)
}
