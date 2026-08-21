import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  icon: ReactNode
  iconColor?: string
  iconBg?: string
  label: string
  value: string | number
  trend?: number       // positive = up, negative = down, 0/undefined = flat
  trendLabel?: string
  delay?: number
}

export function StatCard({
  icon,
  iconColor = '#3FD6FF',
  iconBg,
  label,
  value,
  trend,
  trendLabel,
  delay = 0,
}: StatCardProps) {
  const hasTrend = trend !== undefined
  const isUp = (trend ?? 0) > 0
  const isDown = (trend ?? 0) < 0

  const trendColor = isUp ? '#3DDC84' : isDown ? '#FF5B5B' : '#666'
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      whileHover={{
        borderColor: 'rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Subtle ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: iconBg ?? `${iconColor}08`,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: iconBg ?? `${iconColor}14`,
            border: `1px solid ${iconColor}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </div>

        {hasTrend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: `${trendColor}12`,
              border: `1px solid ${trendColor}22`,
              borderRadius: 8,
              padding: '4px 8px',
            }}
          >
            <TrendIcon size={12} style={{ color: trendColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: trendColor }}>
              {Math.abs(trend ?? 0)}%
            </span>
          </div>
        )}
      </div>

      {/* Value + label */}
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>
          {label}
        </div>
        {trendLabel && (
          <div style={{ fontSize: 11, color: '#3a3a3a', marginTop: 4 }}>
            {trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  )
}
