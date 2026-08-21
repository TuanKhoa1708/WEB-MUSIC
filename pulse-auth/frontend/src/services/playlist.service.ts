import {
  getPlaylistsApi,
  getPlaylistStatsApi,
  getPlaylistByIdApi,
  createPlaylistApi,
  updatePlaylistApi,
  deletePlaylistApi,
} from '@/api/playlist.api'
import type {
  Playlist,
  PlaylistStats,
  PlaylistQueryParams,
  PaginatedPlaylists,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '@/types/playlist.types'

export async function getPlaylistsService(params?: PlaylistQueryParams): Promise<PaginatedPlaylists> {
  return getPlaylistsApi(params)
}

export async function getPlaylistStatsService(): Promise<PlaylistStats> {
  return getPlaylistStatsApi()
}

export async function getPlaylistByIdService(id: string): Promise<Playlist> {
  return getPlaylistByIdApi(id)
}

export async function createPlaylistService(data: CreatePlaylistInput): Promise<Playlist> {
  return createPlaylistApi(data)
}

export async function updatePlaylistService(data: UpdatePlaylistInput): Promise<Playlist> {
  return updatePlaylistApi(data)
}

export async function deletePlaylistService(id: string): Promise<void> {
  return deletePlaylistApi(id)
}
