import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getAlbumsService,
  getAlbumStatsService,
  createAlbumService,
  updateAlbumService,
  deleteAlbumService,
} from '@/services/album.service'
import { getArtistsService } from '@/services/artist.service'
import type { AlbumQueryParams, CreateAlbumInput, UpdateAlbumInput } from '@/types/album.types'

export const ALBUM_KEYS = {
  all: ['albums'] as const,
  list: (params: AlbumQueryParams) => ['albums', 'list', params] as const,
  stats: ['albums', 'stats'] as const,
}

export function useAlbums(params: AlbumQueryParams) {
  return useQuery({
    queryKey: ALBUM_KEYS.list(params),
    queryFn: () => getAlbumsService(params),
    placeholderData: (prev) => prev,
  })
}

export function useAlbumStats() {
  return useQuery({
    queryKey: ALBUM_KEYS.stats,
    queryFn: getAlbumStatsService,
  })
}

export function useCreateAlbum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAlbumService,
    onSuccess: () => {
      toast.success('Album created successfully')
      queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.stats })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create album')
    },
  })
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAlbumService,
    onSuccess: () => {
      toast.success('Album updated successfully')
      queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.all })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update album')
    },
  })
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAlbumService,
    onSuccess: () => {
      toast.success('Album deleted successfully')
      queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.stats })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete album')
    },
  })
}

export function useArtistOptions() {
  return useQuery({
    queryKey: ['artists', 'options'],
    queryFn: async () => {
      const res = await getArtistsService({ limit: 1000 })
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
