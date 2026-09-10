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
      className="p-4 sm:p-5 md:px-6 md:py-5 bg-[#141414] border border-white/5 rounded-2xl flex flex-col gap-3.5 relative overflow-hidden transition-all duration-200 cursor-default hover:border-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      {/* Subtle ambient background glow */}
      <div
        className="absolute -top-5 -right-5 w-[100px] h-[100px] rounded-full blur-[30px] pointer-events-none"
        style={{
          background: iconBg ?? `${iconColor}08`,
        }}
      />

      {/* Top row: icon + trend */}
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-[11px] flex items-center justify-center"
          style={{
            background: iconBg ?? `${iconColor}14`,
            border: `1px solid ${iconColor}22`,
            color: iconColor,
          }}
        >
          {icon}
        </div>

        {hasTrend && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{
              background: `${trendColor}12`,
              border: `1px solid ${trendColor}22`,
            }}
          >
            <TrendIcon size={12} style={{ color: trendColor }} />
            <span className="text-[11px] font-bold" style={{ color: trendColor }}>
              {Math.abs(trend ?? 0)}%
            </span>
          </div>
        )}
      </div>

      {/* Value + label */}
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="text-[32px] font-extrabold text-white tracking-[-0.04em] leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-[14px] text-[#888] font-semibold">
          {label}
        </div>
        {trendLabel && (
          <div className="text-[12px] text-[#555] font-medium">
            {trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  )
}
