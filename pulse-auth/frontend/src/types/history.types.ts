// ─── History Domain Types ─────────────────────────────────────────────────────
// Mirrors backend History schema: { userId, songId, listenedAt }

import type { Song } from './song.types'

export interface History {
  _id: string
  userId: string
  songId: Song | string   // populated when fetched
  listenedAt: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedHistory {
  success: boolean
  data: History[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface HistoryQueryParams {
  userId?: string
  page?: number
  limit?: number
}
