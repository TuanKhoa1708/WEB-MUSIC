import {
  getPlaylistsApi,
  getPlaylistsByArtistApi,
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

// ===========================
// GET ALL
// ===========================

export function getPlaylistsService(
  params?: PlaylistQueryParams
): Promise<PaginatedPlaylists> {
  return getPlaylistsApi(params)
}

// ===========================
// GET BY ARTIST
// ===========================

export function getPlaylistsByArtistService(
  artistId: string
): Promise<Playlist[]> {
  return getPlaylistsByArtistApi(artistId)
}

// ===========================
// GET STATS
// ===========================

export function getPlaylistStatsService(): Promise<PlaylistStats> {
  return getPlaylistStatsApi()
}

// ===========================
// GET DETAIL
// ===========================

export function getPlaylistByIdService(
  id: string
): Promise<Playlist> {
  return getPlaylistByIdApi(id)
}

// ===========================
// CREATE
// ===========================

export function createPlaylistService(
  data: CreatePlaylistInput
): Promise<Playlist> {
  return createPlaylistApi(data)
}

// ===========================
// UPDATE
// ===========================

export function updatePlaylistService(
  data: UpdatePlaylistInput
): Promise<Playlist> {
  return updatePlaylistApi(data)
}

// ===========================
// DELETE
// ===========================

export function deletePlaylistService(
  id: string
): Promise<void> {
  return deletePlaylistApi(id)
}