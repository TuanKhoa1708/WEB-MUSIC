import { motion } from 'framer-motion'
import { Music2, Headphones, Clock } from 'lucide-react'
interface FloatingCardProps {
  type: 'trending' | 'artist' | 'recent'
  className?: string
  delay?: number
  floatClass?: string
}

const cardData = {
  trending: {
    icon: Music2,
    label: 'TRENDING NOW',
    title: 'Blinding Lights',
    subtitle: 'The Weeknd',
    value: '#1',
    valueLabel: 'GLOBAL',
    color: '#3FD6FF',
    bg: '#0F1A1F',
  },
  artist: {
    icon: Headphones,
    label: 'POPULAR ARTIST',
    title: 'Billie Eilish',
    subtitle: '42.8M listeners',
    value: '↑12%',
    valueLabel: 'THIS WEEK',
    color: '#A855F7',
    bg: '#160F1F',
  },
  recent: {
    icon: Clock,
    label: 'RECENTLY PLAYED',
    title: 'Starboy',
    subtitle: 'The Weeknd',
    value: '3:50',
    valueLabel: 'DURATION',
    color: '#22C55E',
    bg: '#0F1A12',
  },
}

export function FloatingCard({ type, className = '', delay = 0 }: FloatingCardProps) {
  const data = cardData[type]
  const Icon = data.icon

  return (
    <motion.div
      className={`relative rounded-[16px] p-4 w-full flex flex-col justify-center ${className}`}
      style={{
        background: '#0B0B0B',
        border: '1px solid rgba(255,255,255,0.06)'
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-4">
        {/* Left Icon */}
        <div
          className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: data.bg }}
        >
          <Icon size={20} style={{ color: data.color }} />
        </div>

        {/* Middle Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[0.08em] mb-1 uppercase" style={{ color: data.color }}>
            {data.label}
          </p>
          <p className="text-white text-[15px] font-semibold leading-tight truncate">{data.title}</p>
          <p className="text-[#888] text-[12px] mt-0.5 truncate">{data.subtitle}</p>
        </div>

        {/* Right Info */}
        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-bold leading-tight" style={{ color: data.color }}>
            {data.value}
          </p>
          <p className="text-[#666] text-[10px] uppercase font-bold tracking-wider mt-0.5">
            {data.valueLabel}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
