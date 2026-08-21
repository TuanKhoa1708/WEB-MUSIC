import axiosInstance from '@/api/axios'
import type { PaginatedHistory, HistoryQueryParams } from '@/types/history.types'

const BASE = '/history'

/** GET /api/history?userId=...&page=...&limit=... */
export async function getHistoryApi(params: HistoryQueryParams): Promise<PaginatedHistory> {
  const { data } = await axiosInstance.get<PaginatedHistory>(BASE, { params })
  return data
}

/** POST /api/history — body: { userId, songId } */
export async function addHistoryApi(
  userId: string,
  songId: string
): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.post<{ success: boolean }>(BASE, { userId, songId })
  return data
}

/** DELETE /api/history/clear?userId=... */
export async function clearHistoryApi(userId: string): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.delete<{ success: boolean }>(`${BASE}/clear`, {
    params: { userId },
  })
  return data
}
