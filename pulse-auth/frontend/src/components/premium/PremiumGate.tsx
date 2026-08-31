import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Crown, ArrowRight } from 'lucide-react'
import { useIsPremium } from '@/hooks/listener/useSubscription'
import { PremiumUpgradeModal } from './PremiumUpgradeModal'

interface PremiumGateProps {
  /** Children shown to Premium users */
  children: React.ReactNode
  /** Name of the locked feature (shown in the upgrade modal) */
  feature?: string
  /** Short description explaining why the feature requires Premium */
  description?: string
  /**
   * If true, always renders children but shows locked overlay for free users.
   * If false (default), replaces children with an upgrade card for free users.
   */
  overlay?: boolean
}

/**
 * Wrap any Premium-only content with PremiumGate.
 * Free users see an upgrade prompt; Premium users see the content.
 *
 * @example
 * <PremiumGate feature="Unlimited Skips" description="Skip songs freely with Premium.">
 *   <SkipButton />
 * </PremiumGate>
 */
export function PremiumGate({ children, feature = 'Premium Feature', description, overlay = false }: PremiumGateProps) {
  const isPremium = useIsPremium()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  if (isPremium) return <>{children}</>

  if (overlay) {
    return (
      <>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <div style={{ opacity: 0.3, pointerEvents: 'none', userSelect: 'none' }}>
            {children}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            title={`${feature} — Upgrade to Premium`}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={14} color="#FFB900" />
          </button>
        </div>
        <PremiumUpgradeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          feature={feature}
          description={description}
        />
      </>
    )
  }

  // Default: Replace with upgrade card
  return (
    <div
      onClick={() => navigate('/listener/premium')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(255,185,0,0.06), rgba(255,140,0,0.03))',
        border: '1px solid rgba(255,185,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,185,0,0.1), rgba(255,140,0,0.06))'
        e.currentTarget.style.borderColor = 'rgba(255,185,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,185,0,0.06), rgba(255,140,0,0.03))'
        e.currentTarget.style.borderColor = 'rgba(255,185,0,0.2)'
      }}
    >
      <Lock size={14} color="#FFB900" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#FFB900' }}>{feature}</div>
        {description && (
          <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>{description}</div>
        )}
      </div>
      <Crown size={13} color="#FFB900" style={{ flexShrink: 0 }} />
    </div>
  )
}
