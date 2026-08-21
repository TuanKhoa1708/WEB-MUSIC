import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getSongsService,
  getSongStatsService,
  createSongService,
  updateSongService,
  deleteSongService,
} from '@/services/song.service'
import { getArtistOptionsApi, getAlbumOptionsApi } from '@/api/options.api'
import type { SongQueryParams, CreateSongInput, UpdateSongInput } from '@/types/song.types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SONG_KEYS = {
  all: ['songs'] as const,
  list: (params: SongQueryParams) => ['songs', 'list', params] as const,
  stats: () => ['songs', 'stats'] as const,
  artistOptions: () => ['artists', 'options'] as const,
  albumOptions: () => ['albums', 'options'] as const,
}

// ─── List + filters ───────────────────────────────────────────────────────────

export function useSongs(params: SongQueryParams) {
  return useQuery({
    queryKey: SONG_KEYS.list(params),
    queryFn: () => getSongsService(params),
    placeholderData: (prev) => prev,
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function useSongStats() {
  return useQuery({
    queryKey: SONG_KEYS.stats(),
    queryFn: getSongStatsService,
  })
}

// ─── Dropdown options ─────────────────────────────────────────────────────────

export function useArtistOptions() {
  return useQuery({
    queryKey: SONG_KEYS.artistOptions(),
    queryFn: getArtistOptionsApi,
    staleTime: 5 * 60 * 1000, // 5 min — artists don't change often
  })
}

export function useAlbumOptions() {
  return useQuery({
    queryKey: SONG_KEYS.albumOptions(),
    queryFn: getAlbumOptionsApi,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSongInput) => createSongService(data),
    onSuccess: () => {
      toast.success('Song created successfully.')
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create song.')
    },
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSongInput) => updateSongService(data),
    onSuccess: () => {
      toast.success('Song updated successfully.')
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update song.')
    },
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSongService(id),
    onSuccess: () => {
      toast.success('Song deleted successfully.')
      queryClient.invalidateQueries({ queryKey: SONG_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete song.')
    },
  })
}
