import axiosInstance from '@/api/axios'
import type { PlaylistSong, AddSongToPlaylistInput } from '@/types/playlist.types'

const BASE = '/playlist-songs'

// ─── POST /playlist-songs ─────────────────────────────────────────────────────
export async function addSongToPlaylistApi(input: AddSongToPlaylistInput): Promise<PlaylistSong> {
  const { data } = await axiosInstance.post<{ success: boolean; data: PlaylistSong }>(BASE, input)
  return data.data
}

// ─── GET /playlist-songs/playlist/:playlistId ─────────────────────────────────
export async function getPlaylistSongsApi(playlistId: string): Promise<PlaylistSong[]> {
  const { data } = await axiosInstance.get<{ success: boolean; data: PlaylistSong[] }>(
    `${BASE}/playlist/${playlistId}`
  )
  return data.data
}

// ─── DELETE /playlist-songs/:id ───────────────────────────────────────────────
export async function removeSongFromPlaylistApi(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`)
}
