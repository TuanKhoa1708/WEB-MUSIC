import {
  getAlbumsApi,
  getAlbumStatsApi,
  getAlbumByIdApi,
  createAlbumApi,
  updateAlbumApi,
  deleteAlbumApi,
} from '@/api/album.api'
import type {
  Album,
  AlbumQueryParams,
  AlbumStats,
  PaginatedAlbums,
  CreateAlbumInput,
  UpdateAlbumInput,
} from '@/types/album.types'

export async function getAlbumsService(params?: AlbumQueryParams): Promise<PaginatedAlbums> {
  return getAlbumsApi(params)
}

export async function getAlbumStatsService(): Promise<AlbumStats> {
  return getAlbumStatsApi()
}

export async function getAlbumByIdService(id: string): Promise<Album> {
  return getAlbumByIdApi(id)
}

export async function createAlbumService(data: CreateAlbumInput): Promise<Album> {
  return createAlbumApi(data)
}

export async function updateAlbumService(data: UpdateAlbumInput): Promise<Album> {
  return updateAlbumApi(data)
}

export async function deleteAlbumService(id: string): Promise<void> {
  return deleteAlbumApi(id)
}
