import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getUsersService,
  toggleUserStatusService,
} from '@/services/user.service'
import type { UserQueryParams } from '@/types/user.types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const USER_KEYS = {
  all: ['users'] as const,
  list: (params: UserQueryParams) => ['users', 'list', params] as const,
}

// ─── List + filters ───────────────────────────────────────────────────────────

export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => getUsersService(params),
    placeholderData: (prev) => prev,
  })
}

// ─── Toggle active/inactive ───────────────────────────────────────────────────

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleUserStatusService(id),
    onSuccess: (updatedUser) => {
      const status = updatedUser.isActive ? 'activated' : 'deactivated'
      toast.success(`Listener ${status} successfully.`)
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update listener status.')
    },
  })
}
