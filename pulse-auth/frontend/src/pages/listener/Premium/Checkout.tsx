import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Crown, ArrowLeft, CreditCard, Lock,
  Check, Loader2, AlertCircle, Shield,
} from 'lucide-react'
import { useCheckout } from '@/hooks/listener/useSubscription'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import type { SubscriptionPackage } from '@/types/subscription.types'

export function PremiumCheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const checkout = useCheckout()

  // Plan passed via navigate state from PremiumPage
  const plan: SubscriptionPackage | undefined = location.state?.plan

  const [step, setStep] = useState<'review' | 'processing' | 'done'>('review')
  const [result, setResult] = useState<'success' | 'pending' | 'failed' | null>(null)

  if (!plan) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
        <AlertCircle size={40} style={{ marginBottom: 12 }} />
        <p>No plan selected. <button onClick={() => navigate('/listener/premium')} style={{ color: '#FFB900', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Go back</button></p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('processing')

    try {
      const res = await checkout.mutateAsync({ packageId: plan._id })

      if (res.status === 'momo_pending' && res.orderId) {
        // Navigate to the MoMo QR payment page
        navigate('/listener/premium/payment/momo', { 
          replace: true, 
          state: { plan, orderId: res.orderId } 
        })
      } else if (res.status === 'active') {
        setResult('success')
        setStep('done')
        navigate('/listener/premium/success', { replace: true, state: { plan } })
      } else {
        setResult('failed')
        setStep('done')
        navigate('/listener/premium/failed', { replace: true })
      }
    } catch (err: any) {
      setResult('failed')
      setStep('done')
      toast.error(err?.message || 'Failed to start payment. Please try again.')
      navigate('/listener/premium/failed', { replace: true })
    }
  }

  // ── Processing state ─────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ color: '#FFB900' }}
        >
          <Loader2 size={40} />
        </motion.div>
        <p style={{ fontSize: 16, color: '#888', fontWeight: 600 }}>Processing your payment…</p>
        <p style={{ fontSize: 13, color: '#555' }}>Please don't close this window.</p>
      </div>
    )
  }

  // ── Review step ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '40px 24px', maxWidth: 560, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/listener/premium')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#666',
          cursor: 'pointer', fontSize: 14, fontWeight: 500,
          marginBottom: 28, padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Complete your order
          </h1>
          <p style={{ fontSize: 14, color: '#666' }}>You're one step away from Premium.</p>
        </div>

        {/* Order Summary */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,185,0,0.06), rgba(255,140,0,0.03))',
          border: '1px solid rgba(255,185,0,0.25)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Summary</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,185,0,0.15)', border: '1px solid rgba(255,185,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Crown size={16} color="#FFB900" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Billed {plan.billingPeriod}</div>
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#FFB900' }}>
              {plan.price.toLocaleString('vi-VN')} {plan.currency}
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Total today</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#FFB900' }}>
              {plan.price.toLocaleString('vi-VN')} {plan.currency}
            </span>
          </div>
        </div>

        {/* Account info */}
        <div style={{
          background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
          padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0,
          }}>
            {user?.fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.fullName}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{user?.email}</div>
          </div>
        </div>

        {/* Payment form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
            padding: 20, marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Payment Details
            </p>

            <div style={{
              background: 'rgba(165,0,100,0.08)',
              border: '1px dashed rgba(165,0,100,0.3)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              marginBottom: 16,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#A50064',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                fontSize: 12, fontWeight: 800, flexShrink: 0
              }}>
                MoMo
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#E6007E', marginBottom: 4 }}>
                  Pay with MoMo Wallet
                </p>
                <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
                  You will be redirected to the MoMo QR payment page to complete your purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
            padding: '10px 14px', borderRadius: 10, background: 'rgba(76,175,80,0.06)',
            border: '1px solid rgba(76,175,80,0.2)',
          }}>
            <Shield size={14} color="#4CAF50" />
            <span style={{ fontSize: 12, color: '#4CAF50' }}>Secure checkout via MoMo Demo</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={checkout.isPending}
            style={{
              width: '100%', height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #A50064, #E6007E)',
              border: 'none', color: '#fff',
              fontSize: 16, fontWeight: 800, cursor: checkout.isPending ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(165,0,100,0.35)',
              opacity: checkout.isPending ? 0.8 : 1,
            }}
          >
            {checkout.isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Processing…</>
            ) : (
              <><Lock size={16} /> Continue to MoMo</>
            )}
          </button>

          <p style={{ fontSize: 11, color: '#444', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
            By subscribing, you agree to our Terms of Service. You can cancel anytime.
          </p>
        </form>
      </motion.div>
    </div>
  )
}
