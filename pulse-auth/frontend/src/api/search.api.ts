import axiosInstance from '@/api/axios'
import type { Song } from '@/types/song.types'
import type { Album } from '@/types/album.types'
import type { Artist } from '@/types/artist.types'
import type { Playlist } from '@/types/playlist.types'

const BASE = '/search'

export interface GlobalSearchResponse {
  success: boolean
  keyword: string
  data: {
    songs: Song[]
    artists: Artist[]
    albums: Album[]
    playlists: Playlist[]
  }
}

export interface SearchQueryParams {
  keyword: string
  limit?: number
}

/** GET /api/search?keyword=...&limit=... */
export async function globalSearchApi(params: SearchQueryParams): Promise<GlobalSearchResponse> {
  const { data } = await axiosInstance.get<GlobalSearchResponse>(BASE, { params })
  return data
}
