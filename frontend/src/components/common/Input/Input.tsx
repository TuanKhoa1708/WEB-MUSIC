import React, { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, type, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="relative w-full">
        <div
          className="relative w-full h-[56px] rounded-[12px] transition-all duration-300 flex items-center overflow-hidden gap-4"
          style={{
            padding: '0 20px',
            background: 'transparent',
            border: `1px solid ${
              focused
                ? 'rgba(63, 214, 255, 0.4)'
                : 'rgba(255, 255, 255, 0.08)'
            }`,
            boxShadow: focused
              ? '0 0 0 3px rgba(63, 214, 255, 0.05), 0 0 15px rgba(63, 214, 255, 0.05)'
              : 'none',
          }}
        >
          {icon && (
            <div
              className="flex items-center justify-center transition-colors duration-300 shrink-0"
              style={{ color: focused ? '#3FD6FF' : '#777' }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              'flex-1 h-full bg-transparent text-white text-[14px] font-medium outline-none placeholder-[#777] min-w-0',
              className
            )}
            placeholder={label}
            {...props}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center transition-colors duration-200 h-full shrink-0"
              style={{ color: focused ? '#3FD6FF' : '#555' }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <motion.p
            className="mt-2 text-[11.5px] text-[#888] font-medium"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
