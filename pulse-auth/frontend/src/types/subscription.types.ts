// ─── Subscription Package (plan offered by the platform) ──────────────────────

export interface SubscriptionPackage {
  _id: string
  name: string
  planKey: string
  price: number
  currency: string
  billingPeriod: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Current user's subscription status ───────────────────────────────────────

export interface MySubscription {
  isPremium: boolean
  subscriptionPlan: 'free' | 'premium'
  subscriptionExpiresAt: string | null
  subscriptionStartedAt: string | null
  isExpired: boolean
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutRequest {
  packageId: string
}

export interface CheckoutResponse {
  status: 'pending' | 'active' | 'failed' | 'cancelled' | 'momo_pending'
  message?: string
  plan?: {
    id: string
    name: string
    price: number
    currency: string
    billingPeriod: string
  }
  /** URL to redirect user to external payment gateway */
  checkoutUrl?: string | null
  orderId?: string
}

// ─── Demo MoMo Payment ────────────────────────────────────────────────────────

export interface DemoConfirmRequest {
  orderId: string
  packageId: string
  paymentMethod: 'MOMO'
}

export interface DemoConfirmResponse {
  paymentStatus: 'COMPLETED'
  subscriptionStatus: 'ACTIVE'
  paymentMethod: string
  orderId: string
  transactionId?: string
  amount?: number
  currency?: string
  activatedAt?: string
  expiresAt?: string
  alreadyActive?: boolean
  message?: string
  user?: {
    isPremium: boolean
    subscriptionPlan: string
    subscriptionExpiresAt: string | null
    subscriptionStartedAt: string | null
  }
}
