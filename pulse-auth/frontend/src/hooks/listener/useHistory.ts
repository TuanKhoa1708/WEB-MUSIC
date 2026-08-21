import { useQuery } from '@tanstack/react-query'
import { getHistoryApi } from '@/api/history.api'
import { useAuth } from '@/contexts/AuthContext'

export const HISTORY_KEYS = {
  all: ['history'] as const,
  user: (userId: string, limit?: number) => ['history', userId, limit] as const,
}

export function useHistory(limit = 20) {
  const { user } = useAuth()
  return useQuery({
    queryKey: HISTORY_KEYS.user(user?.id ?? '', limit),
    queryFn: () => getHistoryApi({ userId: user!.id, limit }),
    enabled: !!user?.id,
    staleTime: 1000 * 60,
  })
}
