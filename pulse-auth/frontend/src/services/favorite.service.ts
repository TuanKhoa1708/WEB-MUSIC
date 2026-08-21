import { getFavoritesApi, addFavoriteApi, removeFavoriteApi } from '@/api/favorite.api'
import type { Favorite } from '@/types/favorite.types'

export async function getFavoritesService(userId: string): Promise<Favorite[]> {
  const res = await getFavoritesApi(userId)
  return res.data
}

export async function addFavoriteService(userId: string, songId: string): Promise<Favorite> {
  const res = await addFavoriteApi(userId, songId)
  return res.data
}

export async function removeFavoriteService(favoriteId: string): Promise<void> {
  await removeFavoriteApi(favoriteId)
}
