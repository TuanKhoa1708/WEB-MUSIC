import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getPlaylistsService,
  getPlaylistsByArtistService,
  getPlaylistStatsService,
  getPlaylistByIdService,
  createPlaylistService,
  updatePlaylistService,
  deletePlaylistService,
} from '@/services/playlist.service'
import type {
  PlaylistQueryParams,
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from '@/types/playlist.types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const PLAYLIST_KEYS = {
  all: ['playlists'] as const,
  list: (params: PlaylistQueryParams) => ['playlists', 'list', params] as const,
  byArtist: (artistId: string) => ['playlists', 'artist', artistId] as const,
  detail: (id: string) => ['playlists', 'detail', id] as const,
  stats: ['playlists', 'stats'] as const,
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function usePlaylists(artistId?: string | PlaylistQueryParams) {
  const isArtistId = typeof artistId === 'string'
  return useQuery({
    queryKey: isArtistId
      ? PLAYLIST_KEYS.byArtist(artistId)
      : PLAYLIST_KEYS.list((artistId as PlaylistQueryParams) || {}),
    queryFn: () => {
      if (isArtistId) {
        return getPlaylistsByArtistService(artistId)
      }
      return getPlaylistsService(artistId as PlaylistQueryParams)
    },
    placeholderData: (prev) => prev,
    enabled: isArtistId ? !!artistId : true,
  })
}

export function usePlaylistsByArtist(artistId: string) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.byArtist(artistId),
    queryFn: () => getPlaylistsByArtistService(artistId),
    enabled: !!artistId,
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function usePlaylistStats() {
  return useQuery({
    queryKey: PLAYLIST_KEYS.stats,
    queryFn: getPlaylistStatsService,
  })
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function usePlaylistById(id: string) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.detail(id),
    queryFn: () => getPlaylistByIdService(id),
    enabled: !!id,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreatePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlaylistInput) => createPlaylistService(data),
    onSuccess: () => {
      toast.success('Playlist created successfully')
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create playlist')
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdatePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePlaylistInput) => updatePlaylistService(data),
    onSuccess: () => {
      toast.success('Playlist updated successfully')
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update playlist')
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeletePlaylist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePlaylistService(id),
    onSuccess: () => {
      toast.success('Playlist deleted successfully')
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete playlist')
    },
  })
}
