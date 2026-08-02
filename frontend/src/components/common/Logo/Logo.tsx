import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 16, text: 'text-lg', container: 'w-8 h-8' },
    md: { icon: 20, text: 'text-2xl', container: 'w-10 h-10' },
    lg: { icon: 28, text: 'text-3xl', container: 'w-14 h-14' },
  }

  const s = sizes[size]

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div
        className={`${s.container} rounded-[12px] flex items-center justify-center relative overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #3FD6FF22, #3FD6FF0a)',
          border: '1px solid rgba(63, 214, 255, 0.3)',
          boxShadow: '0 0 20px rgba(63, 214, 255, 0.15)',
        }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={s.icon} fill="#3FD6FF" stroke="#3FD6FF" />
        </motion.div>
        <div
          className="absolute inset-0 rounded-[12px]"
          style={{
            background: 'radial-gradient(circle at 60% 40%, rgba(63, 214, 255, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>
      <span
        className={`font-extrabold tracking-tight ${s.text}`}
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #3FD6FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}
      >
        Pulse
      </span>
    </motion.div>
  )
}
