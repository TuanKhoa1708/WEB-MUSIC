import axiosInstance from '@/api/axios'
import type {
  FavoritesResponse,
  AddFavoriteResponse,
  CheckFavoriteResponse,
} from '@/types/favorite.types'

const BASE = '/favorites'

/** GET /api/favorites?userId=... */
export async function getFavoritesApi(userId: string): Promise<FavoritesResponse> {
  const { data } = await axiosInstance.get<FavoritesResponse>(BASE, {
    params: { userId },
  })
  return data
}

/** GET /api/favorites/check?userId=...&songId=... */
export async function checkFavoriteApi(
  userId: string,
  songId: string
): Promise<CheckFavoriteResponse> {
  const { data } = await axiosInstance.get<CheckFavoriteResponse>(`${BASE}/check`, {
    params: { userId, songId },
  })
  return data
}

/** POST /api/favorites — body: { userId, songId } */
export async function addFavoriteApi(
  userId: string,
  songId: string
): Promise<AddFavoriteResponse> {
  const { data } = await axiosInstance.post<AddFavoriteResponse>(BASE, {
    userId,
    songId,
  })
  return data
}

/** DELETE /api/favorites/:id — id is the Favorite document _id */
export async function removeFavoriteApi(favoriteId: string): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.delete<{ success: boolean }>(`${BASE}/${favoriteId}`)
  return data
}
