import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getPlaylistsApi, getPlaylistByIdApi, createPlaylistApi, updatePlaylistApi, deletePlaylistApi } from '@/api/playlist.api'
import { getPlaylistSongsApi, addSongToPlaylistApi, removeSongFromPlaylistApi } from '@/api/playlistSong.api'
import type { PlaylistQueryParams, CreatePlaylistInput, UpdatePlaylistInput } from '@/types/playlist.types'

export const PLAYLIST_KEYS = {
  all: ['playlists'] as const,
  list: (params: PlaylistQueryParams) => ['playlists', 'list', params] as const,
  detail: (id: string) => ['playlists', 'detail', id] as const,
  songs: (id: string) => ['playlists', 'songs', id] as const,
}

export function usePlaylistsList(params: PlaylistQueryParams = {}) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.list(params),
    queryFn: () => getPlaylistsApi(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
  })
}

export function usePlaylistDetail(id: string) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.detail(id),
    queryFn: () => getPlaylistByIdApi(id),
    enabled: !!id,
  })
}

export function usePlaylistSongs(playlistId: string) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.songs(playlistId),
    queryFn: () => getPlaylistSongsApi(playlistId),
    enabled: !!playlistId,
  })
}

export function useCreatePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePlaylistInput) => createPlaylistApi(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
      toast.success('Playlist created!')
    },
    onError: () => toast.error('Failed to create playlist.'),
  })
}

export function useUpdatePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePlaylistInput) => updatePlaylistApi(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
      toast.success('Playlist updated!')
    },
    onError: () => toast.error('Failed to update playlist.'),
  })
}

export function useDeletePlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePlaylistApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
      toast.success('Playlist deleted.')
    },
    onError: () => toast.error('Failed to delete playlist.'),
  })
}

export function useAddSongToPlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      addSongToPlaylistApi({ playlistId, songId }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: PLAYLIST_KEYS.songs(vars.playlistId) })
      toast.success('Song added to playlist!')
    },
    onError: (err: Error) => {
      if (err.message?.includes('already')) {
        toast.error('Song already in playlist.')
      } else {
        toast.error('Failed to add song.')
      }
    },
  })
}

export function useRemoveSongFromPlaylist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ playlistSongId }: { playlistSongId: string; playlistId: string }) =>
      removeSongFromPlaylistApi(playlistSongId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: PLAYLIST_KEYS.songs(vars.playlistId) })
      toast.success('Song removed from playlist.')
    },
    onError: () => toast.error('Failed to remove song.'),
  })
}
