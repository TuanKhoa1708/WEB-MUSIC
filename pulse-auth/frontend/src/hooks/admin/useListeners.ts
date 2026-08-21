import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getListenersService,
  updateListenerService,
  deleteListenerService,
  getListenerStatsService,
} from '@/services/listener.service'
import type { UserQueryParams, User } from '@/types/user.types'

export const LISTENER_KEYS = {
  all: ['listeners'] as const,
  list: (params: UserQueryParams) => ['listeners', 'list', params] as const,
  stats: () => ['listeners', 'stats'] as const,
}

export function useListeners(params: UserQueryParams) {
  return useQuery({
    queryKey: LISTENER_KEYS.list(params),
    queryFn: () => getListenersService(params),
    placeholderData: (prev) => prev,
  })
}

export function useListenerStats() {
  return useQuery({
    queryKey: LISTENER_KEYS.stats(),
    queryFn: () => getListenerStatsService(),
  })
}

export function useUpdateListener() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      updateListenerService(id, payload),
    onSuccess: () => {
      toast.success('Listener updated successfully.')
      queryClient.invalidateQueries({ queryKey: LISTENER_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update listener.')
    },
  })
}

export function useDeleteListener() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteListenerService(id),
    onSuccess: () => {
      toast.success('Listener deleted successfully.')
      queryClient.invalidateQueries({ queryKey: LISTENER_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete listener.')
    },
  })
}

export function useToggleListenerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateListenerService(id, { isActive }),
    onSuccess: (updatedUser) => {
      const status = updatedUser.isActive ? 'activated' : 'deactivated'
      toast.success(`Listener ${status} successfully.`)
      queryClient.invalidateQueries({ queryKey: LISTENER_KEYS.all })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update listener status.')
    },
  })
}
