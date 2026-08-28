import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getSubscriptionPackagesApi,
  getMySubscriptionApi,
  checkoutApi,
  cancelSubscriptionApi,
  demoConfirmPaymentApi,
} from '@/api/subscription.api'
import type { CheckoutRequest, DemoConfirmRequest } from '@/types/subscription.types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const SUBSCRIPTION_KEYS = {
  packages: ['subscriptions', 'packages'] as const,
  me: ['subscriptions', 'me'] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch available subscription packages (public) */
export function useSubscriptionPackages() {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.packages,
    queryFn: getSubscriptionPackagesApi,
    staleTime: 1000 * 60 * 30, // Plans rarely change — 30 min cache
  })
}

/** Fetch the current user's subscription status (requires auth) */
export function useMySubscription() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.me,
    queryFn: getMySubscriptionApi,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Returns true if the authenticated user currently has an active Premium plan.
 * Reads from AuthContext first (fast, no extra request), falls back to
 * useMySubscription for authoritative data after context re-hydrates.
 */
export function useIsPremium(): boolean {
  const { user } = useAuth()
  return user?.isPremium === true
}

/** Mutation to initiate checkout */
export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CheckoutRequest) => checkoutApi(payload),
    onSuccess: () => {
      // Invalidate subscription cache in case backend activated premium directly
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.me })
    },
  })
}

/** Mutation to confirm demo payment */
export function useDemoConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DemoConfirmRequest) => demoConfirmPaymentApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.me })
    },
  })
}

/** Mutation to cancel subscription */
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelSubscriptionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.me })
    },
  })
}
