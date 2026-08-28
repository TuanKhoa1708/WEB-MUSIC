import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Crown, ArrowRight, Home } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMySubscription } from '@/hooks/listener/useSubscription'
import { useQueryClient } from '@tanstack/react-query'
import { SUBSCRIPTION_KEYS } from '@/hooks/listener/useSubscription'

type StatusType = 'success' | 'failed' | 'cancelled'

interface PaymentStatusPageProps {
  status: StatusType
}

export function PaymentStatusPage({ status }: PaymentStatusPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const plan = location.state?.plan
  const transactionId = location.state?.transactionId
  const orderId = location.state?.orderId

  // On success: re-fetch subscription and update auth context
  useEffect(() => {
    if (status === 'success') {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.me })
      // Optimistically update auth context
      refreshUser({ isPremium: true, subscriptionPlan: 'premium' })
    }
  }, [status])

  const config = {
    success: {
      icon: <CheckCircle size={56} color="#4CAF50" />,
      glow: 'rgba(76,175,80,0.12)',
      border: 'rgba(76,175,80,0.3)',
      title: 'Welcome to Premium! 🎉',
      subtitle: `You now have access to all Premium features. Enjoy unlimited music, HD audio, and more.`,
      badgeColor: '#4CAF50',
      badgeBg: 'rgba(76,175,80,0.1)',
      badgeBorder: 'rgba(76,175,80,0.3)',
      badgeLabel: 'Payment Successful',
    },
    failed: {
      icon: <XCircle size={56} color="#ef4444" />,
      glow: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.25)',
      title: 'Payment Failed',
      subtitle: 'Your payment could not be processed. No charges were made. Please try again or use a different payment method.',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239,68,68,0.08)',
      badgeBorder: 'rgba(239,68,68,0.2)',
      badgeLabel: 'Payment Failed',
    },
    cancelled: {
      icon: <XCircle size={56} color="#888" />,
      glow: 'rgba(0,0,0,0)',
      border: 'rgba(255,255,255,0.08)',
      title: 'Payment Cancelled',
      subtitle: 'You cancelled the payment process. Your account remains unchanged. You can try again whenever you\'re ready.',
      badgeColor: '#888',
      badgeBg: 'rgba(255,255,255,0.05)',
      badgeBorder: 'rgba(255,255,255,0.1)',
      badgeLabel: 'Cancelled',
    },
  }[status]

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#111',
          border: `1px solid ${config.border}`,
          borderRadius: 24,
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: `0 24px 80px ${config.glow}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top glow line */}
        {status === 'success' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(76,175,80,0.6), transparent)',
          }} />
        )}

        {/* Status badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 20,
            background: config.badgeBg,
            border: `1px solid ${config.badgeBorder}`,
            fontSize: 11,
            fontWeight: 700,
            color: config.badgeColor,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {config.badgeLabel}
          </span>
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
          style={{ marginBottom: 20 }}
        >
          {config.icon}
        </motion.div>

        {/* Content */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.03em',
          marginBottom: 12,
        }}>
          {config.title}
        </h1>
        <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, marginBottom: 32 }}>
          {config.subtitle}
        </p>

        {/* Plan info on success */}
        {status === 'success' && plan && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,185,0,0.08), rgba(255,140,0,0.04))',
            border: '1px solid rgba(255,185,0,0.25)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crown size={18} color="#FFB900" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFB900' }}>{plan.name} Active</div>
                <div style={{ fontSize: 11, color: '#666' }}>Premium features are now unlocked</div>
              </div>
            </div>
            
            {transactionId && (
              <>
                <div style={{ height: 1, background: 'rgba(255,185,0,0.1)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Order ID:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{orderId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Transaction ID:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{transactionId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Amount:</span>
                    <span style={{ color: '#FFB900', fontWeight: 700 }}>
                      {plan.price.toLocaleString('vi-VN')} {plan.currency}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {status === 'success' ? (
            <button
              onClick={() => navigate('/listener/home')}
              style={{
                height: 48, borderRadius: 13,
                background: 'linear-gradient(135deg, #FFB900, #FF8C00)',
                border: 'none', color: '#000',
                fontSize: 14, fontWeight: 800,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 28px rgba(255,185,0,0.3)',
              }}
            >
              Start Listening <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/listener/premium')}
                style={{
                  height: 48, borderRadius: 13,
                  background: 'linear-gradient(135deg, #FFB900, #FF8C00)',
                  border: 'none', color: '#000',
                  fontSize: 14, fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Crown size={16} /> Try Again
              </button>
              <button
                onClick={() => navigate('/listener/home')}
                style={{
                  height: 44, borderRadius: 13,
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#888', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Home size={15} /> Back to Home
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
