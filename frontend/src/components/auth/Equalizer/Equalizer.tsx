import { motion } from 'framer-motion'

interface EqualizerProps {
  className?: string
  barCount?: number
  color?: string
}

export function Equalizer({ className = '', barCount = 12, color = '#3FD6FF' }: EqualizerProps) {
  const barClasses = ['eq-bar-1', 'eq-bar-2', 'eq-bar-3', 'eq-bar-4', 'eq-bar-5']
  const bars = Array.from({ length: barCount }, (_, i) => i)

  return (
    <div className={`flex items-end gap-[3px] ${className}`}>
      {bars.map((i) => (
        <motion.div
          key={i}
          className={barClasses[i % barClasses.length]}
          style={{
            width: 3,
            backgroundColor: color,
            borderRadius: 2,
            opacity: 0.6 + (i % 3) * 0.1,
          }}
          initial={{ height: 8 }}
        />
      ))}
    </div>
  )
}

interface MusicWaveProps {
  className?: string
}

export function MusicWave({ className = '' }: MusicWaveProps) {
  const waves = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className={`flex items-center gap-[2px] ${className}`}>
      {waves.map((i) => {
        const height = Math.sin(i * 0.5) * 20 + Math.sin(i * 0.3) * 15 + 10
        const delay = i * 0.04
        return (
          <motion.div
            key={i}
            style={{
              width: 2,
              backgroundColor: '#3FD6FF',
              borderRadius: 1,
              opacity: 0.15 + Math.abs(Math.sin(i * 0.4)) * 0.25,
            }}
            animate={{
              height: [height, height * 0.4 + 4, height * 1.3, height],
              opacity: [
                0.15 + Math.abs(Math.sin(i * 0.4)) * 0.2,
                0.4 + Math.abs(Math.sin(i * 0.4)) * 0.2,
                0.1 + Math.abs(Math.sin(i * 0.4)) * 0.15,
                0.15 + Math.abs(Math.sin(i * 0.4)) * 0.2,
              ],
            }}
            transition={{
              duration: 2 + (i % 5) * 0.3,
              delay: delay % 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
