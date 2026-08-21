import axiosInstance from '@/api/axios'
import type {
  Album,
  AlbumStats,
  AlbumQueryParams,
  PaginatedAlbums,
  CreateAlbumInput,
  UpdateAlbumInput,
} from '@/types/album.types'

const BASE = '/albums'

export async function getAlbumsApi(params?: AlbumQueryParams): Promise<PaginatedAlbums> {
  const { data } = await axiosInstance.get<PaginatedAlbums>(BASE, { params })
  return data
}

export async function getAlbumStatsApi(): Promise<AlbumStats> {
  const { data } = await axiosInstance.get<{ success: boolean; data: AlbumStats }>(`${BASE}/stats`)
  return data.data
}

export async function getAlbumByIdApi(id: string): Promise<Album> {
  const { data } = await axiosInstance.get<{ success: boolean; data: Album }>(`${BASE}/${id}`)
  return data.data
}

export async function createAlbumApi(input: CreateAlbumInput): Promise<Album> {
  const { data } = await axiosInstance.post<{ success: boolean; data: Album }>(BASE, input)
  return data.data
}

export async function updateAlbumApi(input: UpdateAlbumInput): Promise<Album> {
  const { _id, ...rest } = input
  const { data } = await axiosInstance.put<{ success: boolean; data: Album }>(`${BASE}/${_id}`, rest)
  return data.data
}

export async function deleteAlbumApi(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`)
}
