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

// ─── GET /playlists ───────────────────────────────────────────────────────────
export async function getPlaylistsApi(params?: PlaylistQueryParams): Promise<PaginatedPlaylists> {
  const { data } = await axiosInstance.get<PaginatedPlaylists>(BASE, { params })
  return data
}
// ─── GET /playlists/artist/:artistId ──────────────────────────────────────────
export async function getPlaylistsByArtistApi(artistId: string): Promise<Playlist[]> {
  const { data } = await axiosInstance.get<{ success: boolean; data: Playlist[] }>(
    `${BASE}/artist/${artistId}`,
  )
  return data.data
}
// ─── GET /playlists/stats ─────────────────────────────────────────────────────
export async function getPlaylistStatsApi(): Promise<PlaylistStats> {
  const { data } = await axiosInstance.get<{ success: boolean; data: PlaylistStats }>(`${BASE}/stats`)
  return data.data
}

// ─── GET /playlists/:id ───────────────────────────────────────────────────────
export async function getPlaylistByIdApi(id: string): Promise<Playlist> {
  const { data } = await axiosInstance.get<{ success: boolean; data: Playlist }>(`${BASE}/${id}`)
  return data.data
}

// ─── POST /playlists ──────────────────────────────────────────────────────────
export async function createPlaylistApi(input: CreatePlaylistInput): Promise<Playlist> {
  const { data } = await axiosInstance.post<{ success: boolean; data: Playlist }>(BASE, input)
  return data.data
}

// ─── PUT /playlists/:id ───────────────────────────────────────────────────────
export async function updatePlaylistApi(input: UpdatePlaylistInput): Promise<Playlist> {
  const { _id, ...rest } = input
  const { data } = await axiosInstance.put<{ success: boolean; data: Playlist }>(`${BASE}/${_id}`, rest)
  return data.data
}

// ─── DELETE /playlists/:id ────────────────────────────────────────────────────
export async function deletePlaylistApi(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`)
}
