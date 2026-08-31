import { useQuery } from '@tanstack/react-query'
import { getSongsApi, getRecommendationsApi } from '@/api/song.api'
import type { SongQueryParams } from '@/types/song.types'

export const SONG_KEYS = {
  all: ['songs'] as const,
  list: (params: SongQueryParams) => ['songs', 'list', params] as const,
}

export function useSongs(params: SongQueryParams = {}) {
  return useQuery({
    queryKey: SONG_KEYS.list(params),
    queryFn: () => getSongsApi(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
  })
}

export function useRecommendations() {
  return useQuery({
    queryKey: ['songs', 'recommendations'],
    queryFn: () => getRecommendationsApi(),
    staleTime: 1000 * 60 * 5,
  })
}
