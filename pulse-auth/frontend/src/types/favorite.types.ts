// ─── Favorite Domain Types ────────────────────────────────────────────────────
// Mirrors backend Favorite schema: { userId, songId }

import type { Song } from './song.types'

export interface Favorite {
  _id: string
  userId: string
  songId: Song | string   // populated when fetched with .populate('songId')
  createdAt: string
  updatedAt: string
}

// Response from GET /api/favorites
export interface FavoritesResponse {
  success: boolean
  data: Favorite[]
}

// Response from POST /api/favorites
export interface AddFavoriteResponse {
  success: boolean
  message: string
  data: Favorite
}

// Response from GET /api/favorites/check
export interface CheckFavoriteResponse {
  success: boolean
  isFavorite: boolean
  data: Favorite | null
}
