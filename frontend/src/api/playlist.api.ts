import axiosInstance from '@/api/axios'

import type {
  Playlist,
  PlaylistStats,
  PlaylistQueryParams,
  PaginatedPlaylists,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '@/types/playlist.types'

const BASE = '/playlists'

// ===========================
// GET ALL PLAYLISTS
// ===========================

export async function getPlaylistsApi(
  params?: PlaylistQueryParams
): Promise<PaginatedPlaylists> {
  const { data } =
    await axiosInstance.get<PaginatedPlaylists>(
      BASE,
      { params }
    )

  return data
}

// ===========================
// GET PLAYLISTS BY ARTIST
// ===========================

export async function getPlaylistsByArtistApi(
  artistId: string
): Promise<Playlist[]> {
  const { data } =
    await axiosInstance.get<{
      success: boolean
      data: Playlist[]
    }>(
      `${BASE}/artist/${artistId}`
    )

  return data.data
}

// ===========================
// GET PLAYLIST STATS
// ===========================

export async function getPlaylistStatsApi(): Promise<PlaylistStats> {
  const { data } =
    await axiosInstance.get<{
      success: boolean
      data: PlaylistStats
    }>(
      `${BASE}/stats`
    )

  return data.data
}

// ===========================
// GET PLAYLIST BY ID
// ===========================

export async function getPlaylistByIdApi(
  id: string
): Promise<Playlist> {
  const { data } =
    await axiosInstance.get<{
      success: boolean
      data: Playlist
    }>(
      `${BASE}/${id}`
    )

  return data.data
}

// ===========================
// CREATE PLAYLIST
// ===========================

export async function createPlaylistApi(
  input: CreatePlaylistInput
): Promise<Playlist> {
  const { data } =
    await axiosInstance.post<{
      success: boolean
      data: Playlist
    }>(
      BASE,
      input
    )

  return data.data
}

// ===========================
// UPDATE PLAYLIST
// ===========================

export async function updatePlaylistApi(
  input: UpdatePlaylistInput
): Promise<Playlist> {
  const { _id, ...payload } = input

  const { data } =
    await axiosInstance.put<{
      success: boolean
      data: Playlist
    }>(
      `${BASE}/${_id}`,
      payload
    )

  return data.data
}

// ===========================
// DELETE PLAYLIST
// ===========================

export async function deletePlaylistApi(
  id: string
): Promise<void> {
  await axiosInstance.delete(
    `${BASE}/${id}`
  )
}