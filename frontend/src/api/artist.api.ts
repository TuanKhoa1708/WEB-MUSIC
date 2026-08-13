import axiosInstance from '@/api/axios'
import type {
  Artist,
  ArtistStats,
  ArtistQueryParams,
  PaginatedArtists,
} from '@/types/artist.types'

const BASE = '/artists'

/**
 * GET /artists
 * Returns a paginated list of artists with optional filters.
 */
export async function getArtistsApi(params?: ArtistQueryParams): Promise<PaginatedArtists> {
  const { data } = await axiosInstance.get<PaginatedArtists>(BASE, { params })
  return data
}

/**
 * GET /artists/stats
 * Returns aggregated statistics for the artist management dashboard.
 */
export async function getArtistStatsApi(): Promise<ArtistStats> {
  const { data } = await axiosInstance.get<{ success: boolean; data: ArtistStats }>(`${BASE}/stats`)
  return data.data
}

/**
 * GET /artists/:id
 */
export async function getArtistByIdApi(id: string): Promise<Artist> {
  const { data } = await axiosInstance.get<{ success: boolean; data: Artist }>(`${BASE}/${id}`)
  return data.data
}

/**
 * POST /artists
 */
export async function createArtistApi(input: CreateArtistInput): Promise<Artist> {
  const { data } = await axiosInstance.post<{ success: boolean; data: Artist }>(BASE, input)
  return data.data
}

/**
 * PUT /artists/:id
 */
export async function updateArtistApi(input: UpdateArtistInput): Promise<Artist> {
  const { _id, ...rest } = input
  const { data } = await axiosInstance.put<{ success: boolean; data: Artist }>(`${BASE}/${_id}`, rest)
  return data.data
}

/**
 * DELETE /artists/:id
 */
export async function deleteArtistApi(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`)
}
