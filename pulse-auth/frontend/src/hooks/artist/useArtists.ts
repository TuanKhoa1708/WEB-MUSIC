import { useQuery } from '@tanstack/react-query'
import { getArtistDashboardStatsApi, getArtistRevenueApi } from '@/api/artist.api'

export function useArtistDashboardStats() {
  return useQuery({
    queryKey: ['artists', 'dashboardStats', 'me'],
    queryFn: () => getArtistDashboardStatsApi(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useArtistRevenue() {
  return useQuery({
    queryKey: ['artists', 'revenue', 'me'],
    queryFn: () => getArtistRevenueApi(),
    staleTime: 1000 * 60 * 5,
  })
}
