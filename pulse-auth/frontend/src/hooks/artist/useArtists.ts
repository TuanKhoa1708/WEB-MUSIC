import { useQuery } from '@tanstack/react-query'
import { getArtistDashboardStatsApi } from '@/api/artist.api'

export function useArtistDashboardStats(artistId: string) {
  return useQuery({
    queryKey: ['artists', 'dashboardStats', artistId],
    queryFn: () => getArtistDashboardStatsApi(artistId),
    enabled: !!artistId,
    staleTime: 1000 * 60 * 5,
  })
}
