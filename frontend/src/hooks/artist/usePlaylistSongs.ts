import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getPlaylistSongsService,
  addSongToPlaylistService,
  removeSongFromPlaylistService,
} from '@/services/playlistSong.service'
import type { AddSongToPlaylistInput } from '@/types/playlist.types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const PLAYLIST_SONG_KEYS = {
  all: ['playlist-songs'] as const,
  byPlaylist: (playlistId: string) => ['playlist-songs', 'playlist', playlistId] as const,
}

// ─── Get songs in a playlist ──────────────────────────────────────────────────

export function usePlaylistSongs(playlistId: string) {
  return useQuery({
    queryKey: PLAYLIST_SONG_KEYS.byPlaylist(playlistId),
    queryFn: () => getPlaylistSongsService(playlistId),
    enabled: !!playlistId,
  })
}

// ─── Add song to playlist ─────────────────────────────────────────────────────

export function useAddSongToPlaylist(playlistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AddSongToPlaylistInput) => addSongToPlaylistService(data),
    onSuccess: () => {
      toast.success('Song added to playlist')
      queryClient.invalidateQueries({ queryKey: PLAYLIST_SONG_KEYS.byPlaylist(playlistId) })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to add song')
    },
  })
}

// ─── Remove song from playlist ────────────────────────────────────────────────

export function useRemoveSongFromPlaylist(playlistId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeSongFromPlaylistService(id),
    onSuccess: () => {
      toast.success('Song removed from playlist')
      queryClient.invalidateQueries({ queryKey: PLAYLIST_SONG_KEYS.byPlaylist(playlistId) })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to remove song')
    },
  })
}
