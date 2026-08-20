import {
  addSongToPlaylistApi,
  getPlaylistSongsApi,
  removeSongFromPlaylistApi,
} from '@/api/playlistSong.api'
import type { PlaylistSong, AddSongToPlaylistInput } from '@/types/playlist.types'

export async function addSongToPlaylistService(data: AddSongToPlaylistInput): Promise<PlaylistSong> {
  return addSongToPlaylistApi(data)
}

export async function getPlaylistSongsService(playlistId: string): Promise<PlaylistSong[]> {
  return getPlaylistSongsApi(playlistId)
}

export async function removeSongFromPlaylistService(id: string): Promise<void> {
  return removeSongFromPlaylistApi(id)
}
