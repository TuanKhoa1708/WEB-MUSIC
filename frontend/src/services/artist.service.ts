
import {
  getArtistsApi,
  getArtistStatsApi,
  getArtistByIdApi,
  createArtistApi,
  updateArtistApi,
  deleteArtistApi,
} from '@/api/artist.api'
import type {
  Artist,
  ArtistQueryParams,
  ArtistStats,
  PaginatedArtists,
  CreateArtistInput,
  UpdateArtistInput,
} from '@/types/artist.types'

export async function getArtistsService(params?: ArtistQueryParams): Promise<PaginatedArtists> {
  return getArtistsApi(params)
}

export async function getArtistStatsService(): Promise<ArtistStats> {
  return getArtistStatsApi()
}

export async function getArtistByIdService(id: string): Promise<Artist> {
  return getArtistByIdApi(id)
}

export async function createArtistService(data: CreateArtistInput): Promise<Artist> {
  return createArtistApi(data)
}

export async function updateArtistService(data: UpdateArtistInput): Promise<Artist> {
  return updateArtistApi(data)
}

export async function deleteArtistService(id: string): Promise<void> {
  return deleteArtistApi(id)
}
