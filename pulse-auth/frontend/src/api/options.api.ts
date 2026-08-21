import axiosInstance from '@/api/axios'

const ARTIST_BASE = '/artists'
const ALBUM_BASE = '/albums'

// ─── Artists dropdown ──────────────────────────────────────────────────────────

export interface ArtistOption {
  _id: string
  stageName: string
}

export interface AlbumOption {
  _id: string
  title: string
  artistId?: { _id: string; stageName: string } | string
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  totalPages: number
}

/**
 * Fetch all artists (limit 100) for select dropdowns.
 */
export async function getArtistOptionsApi(): Promise<ArtistOption[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<ArtistOption>>(ARTIST_BASE, {
    params: { limit: 100, page: 1 },
  })
  return data.data
}

/**
 * Fetch all albums (limit 100) for select dropdowns.
 */
export async function getAlbumOptionsApi(): Promise<AlbumOption[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<AlbumOption>>(ALBUM_BASE, {
    params: { limit: 100, page: 1 },
  })
  return data.data
}
