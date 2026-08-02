import axiosInstance from '@/api/axios'
import type {
  Artist,
  ArtistStats,
  ArtistQueryParams,
  PaginatedArtists,
} from '@/types/artist.types'

const BASE = '/admin/artists'

/**
 * GET /admin/artists
 * Returns a paginated list of artists with optional filters.
 */
export async function getArtistsApi(params?: ArtistQueryParams): Promise<PaginatedArtists> {
  const { data } = await axiosInstance.get<PaginatedArtists>(BASE, { params })
  return data
}

/**
 * GET /admin/artists/stats
 * Returns aggregated statistics for the artist management dashboard.
 */
export async function getArtistStatsApi(): Promise<ArtistStats> {
  const { data } = await axiosInstance.get<ArtistStats>(`${BASE}/stats`)
  return data
}

/**
 * GET /admin/artists/:id
 */
export async function getArtistByIdApi(id: string): Promise<Artist> {
  const { data } = await axiosInstance.get<Artist>(`${BASE}/${id}`)
  return data
}

/**
 * DELETE /admin/artists/:id
 */
export async function deleteArtistApi(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`)
}
