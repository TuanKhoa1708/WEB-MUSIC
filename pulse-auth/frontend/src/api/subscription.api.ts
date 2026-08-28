import axiosInstance from '@/api/axios'
import type {
  SubscriptionPackage,
  MySubscription,
  CheckoutRequest,
  CheckoutResponse,
  DemoConfirmRequest,
  DemoConfirmResponse,
} from '@/types/subscription.types'

const BASE = '/subscriptions'

/**
 * GET /api/subscriptions/packages
 * Public — fetch available subscription plans.
 */
export async function getSubscriptionPackagesApi(): Promise<SubscriptionPackage[]> {
  const { data } = await axiosInstance.get<{ success: boolean; data: SubscriptionPackage[] }>(
    `${BASE}/packages`
  )
  return data.data
}

/**
 * GET /api/subscriptions/me
 * Protected — fetch the current user's subscription status.
 */
export async function getMySubscriptionApi(): Promise<MySubscription> {
  const { data } = await axiosInstance.get<{ success: boolean; data: MySubscription }>(
    `${BASE}/me`
  )
  return data.data
}

/**
 * POST /api/subscriptions/checkout
 * Protected — initiate a subscription purchase.
 * TODO: When payment gateway is integrated, this will return a checkoutUrl
 *       to redirect the user to the external payment page.
 */
export async function checkoutApi(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const { data } = await axiosInstance.post<{ success: boolean; data: CheckoutResponse }>(
    `${BASE}/checkout`,
    payload
  )
  return data.data
}

/**
 * POST /api/subscriptions/demo-confirm
 * Protected — simulate a MoMo payment webhook to activate Premium.
 */
export async function demoConfirmPaymentApi(payload: DemoConfirmRequest): Promise<DemoConfirmResponse> {
  const { data } = await axiosInstance.post<{ success: boolean; data: DemoConfirmResponse }>(
    `${BASE}/demo-confirm`,
    payload
  )
  return data.data
}

/**
 * DELETE /api/subscriptions/me
 * Protected — cancel the current user's subscription.
 */
export async function cancelSubscriptionApi(): Promise<{ message: string }> {
  const { data } = await axiosInstance.delete<{ success: boolean; message: string }>(
    `${BASE}/me`
  )
  return { message: data.message }
}
