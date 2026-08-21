import { useQuery } from '@tanstack/react-query'
import { getAlbumsApi, getAlbumByIdApi } from '@/api/album.api'
import type { AlbumQueryParams } from '@/types/album.types'

export const ALBUM_KEYS = {
  all: ['albums'] as const,
  list: (params: AlbumQueryParams) => ['albums', 'list', params] as const,
  detail: (id: string) => ['albums', 'detail', id] as const,
}

export function useAlbumsList(params: AlbumQueryParams = {}) {
  return useQuery({
    queryKey: ALBUM_KEYS.list(params),
    queryFn: () => getAlbumsApi(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAlbumDetail(id: string) {
  return useQuery({
    queryKey: ALBUM_KEYS.detail(id),
    queryFn: () => getAlbumByIdApi(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
