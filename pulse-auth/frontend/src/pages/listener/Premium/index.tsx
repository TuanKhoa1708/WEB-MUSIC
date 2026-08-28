import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Crown, Check, Sparkles, Shuffle, Headphones,
  Users, Music4, Zap, Shield, ArrowRight, Loader2,
  CalendarDays, AlertCircle,
} from 'lucide-react'
import { useSubscriptionPackages, useMySubscription, useCancelSubscription } from '@/hooks/listener/useSubscription'
import { useAuth } from '@/contexts/AuthContext'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import toast from 'react-hot-toast'

// ─── Benefit definitions ───────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: <Shuffle size={22} />,
    color: '#3FD6FF',
    title: 'Unlimited Skipping',
    description: 'Skip any song, any time. No limits, no interruptions.',
  },
  {
    icon: <Music4 size={22} />,
    color: '#A78BFA',
    title: 'Full Playlist Access',
    description: 'Listen to any playlist from start to finish, uninterrupted.',
  },
  {
    icon: <Headphones size={22} />,
    color: '#FFB900',
    title: 'HD Audio Quality',
    description: 'Experience music the way the artist intended — crystal clear.',
  },
  {
    icon: <Users size={22} />,
    color: '#4CAF50',
    title: 'Shared Listening',
    description: 'Listen together with friends in real-time shared sessions.',
  },
  {
    icon: <Sparkles size={22} />,
    color: '#FF6B6B',
    title: 'AI Recommendations',
    description: 'Discover music tailored to your taste with our AI engine.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PremiumPage() {
  const navigate = useNavigate()
  const { user, isPremium } = useAuth()
  const { data: packages, isLoading: packagesLoading, error: packagesError } = useSubscriptionPackages()
  const { data: mySubscription, isLoading: subLoading } = useMySubscription()
  const cancelSub = useCancelSubscription()
  const [cancelling, setCancelling] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const plan = packages?.[0] // We display the first (and likely only) premium plan

  const handleSubscribe = () => {
    if (!plan) return
    navigate('/listener/premium/checkout', { state: { plan } })
  }

  const handleCancel = () => {
    setConfirmOpen(true)
  }

  const handleCancelConfirm = async () => {
    setCancelling(true)
    try {
      await cancelSub.mutateAsync()
      setConfirmOpen(false)
      toast.success('Subscription cancelled. You\'ve been downgraded to the Free plan.')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel subscription.')
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  return (
    <div style={{ minHeight: '100%', background: '#090909' }}>

      {/* Cancel Subscription Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Cancel Premium Subscription"
        description={`Are you sure you want to cancel? You will immediately lose access to all Premium features including HD audio, unlimited skips, and full playlist access.`}
        confirmLabel="Yes, Cancel Subscription"
        cancelLabel="Keep Premium"
        variant="danger"
        isLoading={cancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '64px 32px 80px',
        textAlign: 'center',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(255,185,0,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(255,185,0,0.15), rgba(255,140,0,0.1))',
              border: '1px solid rgba(255,185,0,0.3)',
              color: '#FFB900',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              <Crown size={13} />
              Pulse Premium
            </span>
          </div>

          {isPremium ? (
            <>
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                marginBottom: 16,
              }}>
                You're already Premium 🎉
              </h1>
              <p style={{ fontSize: 18, color: '#888', maxWidth: 480, margin: '0 auto' }}>
                Enjoy unlimited music, HD audio, and all Premium features.
              </p>
            </>
          ) : (
            <>
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                marginBottom: 16,
                background: 'linear-gradient(135deg, #fff 0%, #FFB900 60%, #FF8C00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Unlock the full<br />music experience
              </h1>
              <p style={{ fontSize: 18, color: '#888', maxWidth: 480, margin: '0 auto 32px' }}>
                Go Premium and listen without limits. Skip freely, enjoy HD audio,
                and let AI discover your next favorite song.
              </p>

              {!user && (
                <button
                  onClick={() => navigate('/')}
                  style={{
                    height: 48,
                    padding: '0 28px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #FFB900, #FF8C00)',
                    border: 'none',
                    color: '#000',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Sign in to Upgrade <ArrowRight size={16} />
                </button>
              )}
            </>
          )}
        </motion.div>
      </section>

      {/* ── Premium User: Subscription Status ────────────────────────────── */}
      {isPremium && mySubscription && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: '0 32px 48px', maxWidth: 640, margin: '0 auto' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,185,0,0.08), rgba(255,140,0,0.04))',
            border: '1px solid rgba(255,185,0,0.25)',
            borderRadius: 20,
            padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(255,185,0,0.2), rgba(255,140,0,0.1))',
                border: '1px solid rgba(255,185,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Crown size={20} color="#FFB900" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FFB900' }}>Premium Active</div>
                <div style={{ fontSize: 12, color: '#666' }}>Your subscription is active</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <InfoRow icon={<Shield size={14} />} label="Plan" value="Premium Monthly" />
              <InfoRow icon={<CalendarDays size={14} />} label="Renews" value={formatDate(mySubscription.subscriptionExpiresAt)} />
              <InfoRow icon={<CalendarDays size={14} />} label="Started" value={formatDate(mySubscription.subscriptionStartedAt)} />
            </div>

            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#666',
                padding: '8px 16px',
                borderRadius: 10,
                cursor: cancelling ? 'wait' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#666' }}
            >
              {cancelling ? <Loader2 size={12} className="animate-spin" /> : null}
              Cancel Subscription
            </button>
          </div>
        </motion.section>
      )}

      {/* ── Benefits Section ──────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
            Everything Premium includes
          </h2>
          <p style={{ fontSize: 15, color: '#666' }}>
            One subscription, every feature unlocked.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: '#111',
                border: `1px solid ${b.color}18`,
                borderRadius: 16,
                padding: '20px 20px 18px',
                transition: 'all 0.2s',
              }}
              whileHover={{ y: -4, borderColor: `${b.color}40` }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${b.color}14`,
                border: `1px solid ${b.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: b.color,
                marginBottom: 14,
              }}>
                {b.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                {b.title}
              </div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
                {b.description}
              </div>
              {isPremium && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  marginTop: 12, color: '#4CAF50', fontSize: 11, fontWeight: 600,
                }}>
                  <Check size={12} /> Unlocked
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Plan / Pricing Section ────────────────────────────────────────── */}
      {!isPremium && (
        <section style={{ padding: '0 32px 80px', maxWidth: 500, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {packagesLoading ? (
              <div style={{
                background: '#111', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
                padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                color: '#555',
              }}>
                <Loader2 size={20} className="animate-spin" />
                <span style={{ fontSize: 14 }}>Loading plans…</span>
              </div>
            ) : packagesError ? (
              <div style={{
                background: '#111', borderRadius: 20, border: '1px solid rgba(239,68,68,0.2)',
                padding: 32, textAlign: 'center', color: '#ef4444',
              }}>
                <AlertCircle size={32} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 14 }}>Failed to load subscription plans. Please try again.</p>
              </div>
            ) : plan ? (
              <PlanCard plan={plan} onSubscribe={handleSubscribe} />
            ) : (
              <div style={{
                background: '#111', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
                padding: 32, textAlign: 'center', color: '#555',
              }}>
                <p style={{ fontSize: 14 }}>No plans available at the moment.</p>
              </div>
            )}
          </motion.div>
        </section>
      )}
    </div>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, onSubscribe }: { plan: any; onSubscribe: () => void }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #161410 0%, #100e08 100%)',
      border: '1px solid rgba(255,185,0,0.3)',
      borderRadius: 20,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 60px rgba(255,185,0,0.08)',
    }}>
      {/* Top glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,185,0,0.6), transparent)',
      }} />

      {/* Popular badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        padding: '3px 10px', borderRadius: 8,
        background: 'rgba(255,185,0,0.15)',
        border: '1px solid rgba(255,185,0,0.3)',
        fontSize: 10, fontWeight: 800, color: '#FFB900', letterSpacing: '0.06em',
      }}>
        MOST POPULAR
      </div>

      {/* Plan name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: 'linear-gradient(135deg, rgba(255,185,0,0.2), rgba(255,140,0,0.1))',
          border: '1px solid rgba(255,185,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Crown size={18} color="#FFB900" />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{plan.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Monthly subscription</div>
        </div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 14, color: '#888', marginRight: 2 }}>{plan.currency}</span>
          <span style={{
            fontSize: 48, fontWeight: 900, color: '#FFB900', letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            {plan.price.toLocaleString('vi-VN')}
          </span>
          <span style={{ fontSize: 15, color: '#555', marginLeft: 4 }}>/ {plan.billingPeriod}</span>
        </div>
        <p style={{ fontSize: 12, color: '#555', marginTop: 6 }}>
          Billed monthly. Cancel anytime.
        </p>
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {plan.features.map((f: string) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              background: 'rgba(255,185,0,0.15)', border: '1px solid rgba(255,185,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={10} color="#FFB900" />
            </div>
            <span style={{ fontSize: 13, color: '#ccc' }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* Subscribe CTA */}
      <button
        onClick={onSubscribe}
        style={{
          width: '100%',
          height: 52,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #A50064, #E6007E)',
          border: 'none',
          color: '#fff',
          fontSize: 16,
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s',
          boxShadow: '0 8px 32px rgba(165,0,100,0.35)',
          letterSpacing: '-0.01em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(165,0,100,0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(165,0,100,0.35)'
        }}
      >
        <Crown size={17} />
        Subscribe with MoMo
        <ArrowRight size={16} />
      </button>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
        {['No commitment', 'Secure payment', 'Cancel anytime'].map((t) => (
          <span key={t} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: '#444', fontWeight: 500,
          }}>
            <Check size={10} color="#444" /> {t}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Info Row helper ───────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)', borderRadius: 10,
      padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#666' }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 600, color: '#666' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{value}</div>
    </div>
  )
}
