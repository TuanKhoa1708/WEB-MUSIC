import { useQuery } from '@tanstack/react-query'
import { getSongsApi } from '@/api/song.api'
import { getAlbumsApi } from '@/api/album.api'
import { getArtistsApi } from '@/api/artist.api'
import { getPlaylistsApi } from '@/api/playlist.api'

export function useSearch(keyword: string) {
  const enabled = keyword.trim().length > 0

  const songs = useQuery({
    queryKey: ['search', 'songs', keyword],
    queryFn: () => getSongsApi({ keyword, limit: 10 }),
    enabled,
    staleTime: 1000 * 30,
  })

  const albums = useQuery({
    queryKey: ['search', 'albums', keyword],
    queryFn: () => getAlbumsApi({ keyword, limit: 6 }),
    enabled,
    staleTime: 1000 * 30,
  })

  const artists = useQuery({
    queryKey: ['search', 'artists', keyword],
    queryFn: () => getArtistsApi({ keyword, limit: 6 }),
    enabled,
    staleTime: 1000 * 30,
  })

  const playlists = useQuery({
    queryKey: ['search', 'playlists', keyword],
    queryFn: () => getPlaylistsApi({ keyword, limit: 6 }),
    enabled,
    staleTime: 1000 * 30,
  })

  const isLoading = songs.isLoading || albums.isLoading || artists.isLoading || playlists.isLoading
  const hasResults =
    (songs.data?.data?.length ?? 0) > 0 ||
    (albums.data?.data?.length ?? 0) > 0 ||
    (artists.data?.data?.length ?? 0) > 0 ||
    (playlists.data?.data?.length ?? 0) > 0

  return { songs, albums, artists, playlists, isLoading, hasResults }
}
