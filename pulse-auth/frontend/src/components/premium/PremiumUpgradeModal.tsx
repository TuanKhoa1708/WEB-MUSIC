import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, X, Lock, ArrowRight, Headphones, Shuffle, Music4, Users, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsPremium } from '@/hooks/listener/useSubscription'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
  description?: string
}

/**
 * Modal shown when a Free user tries to access a locked Premium feature.
 */
export function PremiumUpgradeModal({
  isOpen,
  onClose,
  feature = 'Premium Feature',
  description = 'Upgrade to Premium to unlock this feature.',
}: PremiumUpgradeModalProps) {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    onClose()
    navigate('/listener/premium')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 200,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(420px, calc(100vw - 32px))',
              background: '#131313',
              border: '1px solid rgba(255,185,0,0.2)',
              borderRadius: 20,
              padding: '28px 28px 24px',
              zIndex: 201,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,185,0,0.05)',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(255,185,0,0.2), rgba(255,140,0,0.1))',
                border: '1px solid rgba(255,185,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Lock size={24} color="#FFB900" />
              </div>
            </div>

            {/* Content */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(255,185,0,0.15), rgba(255,140,0,0.1))',
                border: '1px solid rgba(255,185,0,0.3)',
                marginBottom: 12,
              }}>
                <Crown size={11} color="#FFB900" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FFB900', letterSpacing: '0.05em' }}>PREMIUM FEATURE</span>
              </div>
              <h2 style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#fff',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>
                {feature}
              </h2>
              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>
                {description}
              </p>
            </div>

            {/* Quick benefits */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginBottom: 20,
            }}>
              {[
                { icon: <Shuffle size={13} />, label: 'Unlimited Skips' },
                { icon: <Headphones size={13} />, label: 'HD Audio' },
                { icon: <Sparkles size={13} />, label: 'AI Picks' },
                { icon: <Users size={13} />, label: 'Shared Listening' },
              ].map((b) => (
                <div key={b.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ color: '#FFB900', flexShrink: 0 }}>{b.icon}</span>
                  <span style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>{b.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #FFB900, #FF8C00)',
                border: 'none',
                color: '#000',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 8px 30px rgba(255,185,0,0.3)',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,185,0,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,185,0,0.3)'
              }}
            >
              <Crown size={16} />
              Upgrade to Premium
              <ArrowRight size={16} />
            </button>

            <p style={{ fontSize: 11, color: '#444', textAlign: 'center', marginTop: 12 }}>
              Starting at $9.99/month · Cancel anytime
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Hook for easy modal usage ─────────────────────────────────────────────────

export function usePremiumModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{ feature?: string; description?: string }>({})

  const openModal = (feature?: string, description?: string) => {
    setConfig({ feature, description })
    setIsOpen(true)
  }

  const closeModal = () => setIsOpen(false)

  return { isOpen, config, openModal, closeModal }
}
