import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

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

// ===========================
// QUERY KEYS
// ===========================

export const PLAYLIST_KEYS = {
  all: ['playlists'] as const,

  lists: () =>
    [...PLAYLIST_KEYS.all, 'list'] as const,

  list: (params: PlaylistQueryParams) =>
    [...PLAYLIST_KEYS.lists(), params] as const,

  byArtist: (artistId: string) =>
    [...PLAYLIST_KEYS.all, 'artist', artistId] as const,

  details: () =>
    [...PLAYLIST_KEYS.all, 'detail'] as const,

  detail: (id: string) =>
    [...PLAYLIST_KEYS.details(), id] as const,

  stats: () =>
    [...PLAYLIST_KEYS.all, 'stats'] as const,
}

// ===========================
// GET ALL PLAYLISTS
// ===========================

export function usePlaylists(
  params: PlaylistQueryParams = {}
) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.list(params),
    queryFn: () =>
      getPlaylistsService(params),
    placeholderData: (previousData) =>
      previousData,
  })
}

// ===========================
// GET PLAYLISTS BY ARTIST
// ===========================

export function usePlaylistsByArtist(
  artistId: string
) {
  return useQuery({
    queryKey:
      PLAYLIST_KEYS.byArtist(artistId),

    queryFn: () =>
      getPlaylistsByArtistService(
        artistId
      ),

    enabled: Boolean(artistId),
  })
}

// ===========================
// GET PLAYLIST STATS
// ===========================

export function usePlaylistStats() {
  return useQuery({
    queryKey: PLAYLIST_KEYS.stats(),
    queryFn: getPlaylistStatsService,
  })
}

// ===========================
// GET PLAYLIST DETAIL
// ===========================

export function usePlaylistById(
  id: string
) {
  return useQuery({
    queryKey:
      PLAYLIST_KEYS.detail(id),

    queryFn: () =>
      getPlaylistByIdService(id),

    enabled: Boolean(id),
  })
}

// ===========================
// CREATE
// ===========================

export function useCreatePlaylist() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      data: CreatePlaylistInput
    ) =>
      createPlaylistService(data),

    onSuccess: () => {
      toast.success(
        'Playlist created successfully'
      )

      queryClient.invalidateQueries({
        queryKey:
          PLAYLIST_KEYS.all,
      })
    },

    onError: (error: Error) => {
      toast.error(
        error.message ||
        'Failed to create playlist'
      )
    },
  })
}

// ===========================
// UPDATE
// ===========================

export function useUpdatePlaylist() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      data: UpdatePlaylistInput
    ) =>
      updatePlaylistService(data),

    onSuccess: () => {
      toast.success(
        'Playlist updated successfully'
      )

      queryClient.invalidateQueries({
        queryKey:
          PLAYLIST_KEYS.all,
      })
    },

    onError: (error: Error) => {
      toast.error(
        error.message ||
        'Failed to update playlist'
      )
    },
  })
}

// ===========================
// DELETE
// ===========================

export function useDeletePlaylist() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      deletePlaylistService(id),

    onSuccess: () => {
      toast.success(
        'Playlist deleted successfully'
      )

      queryClient.invalidateQueries({
        queryKey:
          PLAYLIST_KEYS.all,
      })
    },

    onError: (error: Error) => {
      toast.error(
        error.message ||
        'Failed to delete playlist'
      )
    },
  })
}