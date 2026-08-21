import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getArtistsService,
  getArtistStatsService,
  deleteArtistService,
  createArtistService,
  updateArtistService,
} from '@/services/artist.service'
import type { ArtistQueryParams, CreateArtistInput, UpdateArtistInput } from '@/types/artist.types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const ARTIST_KEYS = {
  all: ['artists'] as const,
  list: (params: ArtistQueryParams) => ['artists', 'list', params] as const,
  stats: () => ['artists', 'stats'] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useArtists(params: ArtistQueryParams) {
  return useQuery({
    queryKey: ARTIST_KEYS.list(params),
    queryFn: () => getArtistsService(params),
    placeholderData: (prev) => prev,
  })
}

export function useArtistStats() {
  return useQuery({
    queryKey: ARTIST_KEYS.stats(),
    queryFn: getArtistStatsService,
  })
}

export function useDeleteArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteArtistService(id),
    onSuccess: () => {
      toast.success('Artist removed successfully.')
      queryClient.invalidateQueries({ queryKey: ARTIST_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete artist.')
    },
  })
}

export function useCreateArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArtistInput) => createArtistService(data),
    onSuccess: () => {
      toast.success('Artist created successfully.')
      queryClient.invalidateQueries({ queryKey: ARTIST_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create artist.')
    },
  })
}

export function useUpdateArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateArtistInput) => updateArtistService(data),
    onSuccess: () => {
      toast.success('Artist updated successfully.')
      queryClient.invalidateQueries({ queryKey: ARTIST_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update artist.')
    },
  })
}
