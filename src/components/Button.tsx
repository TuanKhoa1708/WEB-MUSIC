import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'social'
  isLoading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'relative flex items-center justify-center gap-2.5 font-semibold transition-all duration-300 cursor-pointer select-none overflow-hidden'

  const variants = {
    primary: cn(
      baseClasses,
      'h-[56px] rounded-[12px] text-[15px]',
      'bg-gradient-to-r from-[#3FD6FF] to-[#2094ff] text-[#000000] font-bold',
      'shadow-[0_8px_24px_rgba(63,214,255,0.35)]',
      'hover:shadow-[0_12px_32px_rgba(63,214,255,0.5)] hover:-translate-y-0.5',
      'active:scale-[0.98] active:translate-y-0',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
    ),
    ghost: cn(
      baseClasses,
      'h-[56px] rounded-[12px] text-sm text-white',
      'border border-white/10 bg-white/[0.03]',
      'hover:bg-white/[0.06] hover:border-white/20',
      'active:scale-[0.98]'
    ),
    social: cn(
      baseClasses,
      'h-[48px] rounded-[10px] text-[13px] font-bold tracking-[0.01em] text-white social-btn gap-2.5',
      'border border-white/[0.08] bg-[#161616]',
      'hover:bg-[#1e1e1e] hover:border-white/[0.14] hover:-translate-y-0.5',
      'active:scale-[0.98] active:translate-y-0'
    ),
  }

  return (
    <motion.button
      className={cn(variants[variant], fullWidth && 'w-full', className)}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.97 }}
      whileHover={variant === 'primary' ? { scale: 1.01 } : {}}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {/* Shimmer effect for primary */}
      {variant === 'primary' && !isLoading && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
          }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
      )}

      {isLoading ? (
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  )
}
