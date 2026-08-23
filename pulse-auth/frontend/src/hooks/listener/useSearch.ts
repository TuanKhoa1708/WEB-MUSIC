import { useQuery } from '@tanstack/react-query'
import { globalSearchApi } from '@/api/search.api'

export function useSearch(keyword: string) {
  const enabled = keyword.trim().length > 0

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', 'global', keyword],
    queryFn: () => globalSearchApi({ keyword, limit: 10 }),
    enabled,
    staleTime: 1000 * 30,
  })

  // Format data to match the old hook's expected structure for the UI
  // The UI expects songs, albums, artists, playlists to be objects with { data: { data: [...] } }
  // to support pagination, but the old UI code checks `songs.data?.data`
  
  const searchResults = data?.data || {
    songs: [],
    albums: [],
    artists: [],
    playlists: []
  }

  // To avoid refactoring the entire SearchPage at once, we map the new response format 
  // into the structure the SearchPage currently expects.
  const songs = { data: { data: searchResults.songs, total: searchResults.songs.length }, isLoading }
  const albums = { data: { data: searchResults.albums }, isLoading }
  const artists = { data: { data: searchResults.artists }, isLoading }
  const playlists = { data: { data: searchResults.playlists }, isLoading }

  const hasResults =
    searchResults.songs.length > 0 ||
    searchResults.albums.length > 0 ||
    searchResults.artists.length > 0 ||
    searchResults.playlists.length > 0

  return { songs, albums, artists, playlists, isLoading, hasResults }
}
