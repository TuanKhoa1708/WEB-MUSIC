import { useQuery } from '@tanstack/react-query'
import { getArtistsApi, getArtistByIdApi } from '@/api/artist.api'
import type { ArtistQueryParams } from '@/types/artist.types'

export const ARTIST_KEYS = {
  all: ['artists'] as const,
  list: (params: ArtistQueryParams) => ['artists', 'list', params] as const,
  detail: (id: string) => ['artists', 'detail', id] as const,
}

export function useArtistsList(params: ArtistQueryParams = {}) {
  return useQuery({
    queryKey: ARTIST_KEYS.list(params),
    queryFn: () => getArtistsApi(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  })
}

export function useArtistDetail(id: string) {
  return useQuery({
    queryKey: ARTIST_KEYS.detail(id),
    queryFn: () => getArtistByIdApi(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
