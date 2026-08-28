import { Crown } from 'lucide-react'

interface PremiumBadgeProps {
  /** Compact mode hides "Premium" / "Free" label — shows only icon */
  compact?: boolean
  isPremium: boolean
}

/**
 * Small badge indicating Free / Premium status.
 * Reused across Sidebar, Header, and Profile pages.
 */
export function PremiumBadge({ isPremium, compact = false }: PremiumBadgeProps) {
  if (isPremium) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? 0 : 4,
          padding: compact ? '2px 6px' : '3px 8px',
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(255,185,0,0.15), rgba(255,140,0,0.1))',
          border: '1px solid rgba(255,185,0,0.3)',
          color: '#FFB900',
          fontSize: compact ? 10 : 11,
          fontWeight: 700,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
        title="Premium Account"
      >
        <Crown size={compact ? 9 : 10} style={{ flexShrink: 0 }} />
        {!compact && <span style={{ marginLeft: 3 }}>Premium</span>}
      </span>
    )
  }

  if (compact) return null // Don't show "Free" badge in compact mode

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#666',
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
      title="Free Account"
    >
      Free
    </span>
  )
}
