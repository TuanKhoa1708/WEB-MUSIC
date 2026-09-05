import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

import React from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string | React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const accentColor = variant === 'danger' ? '#FF5B5B' : variant === 'warning' ? '#F7B500' : '#3FD6FF'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 100,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 101,
              background: '#161616',
              border: `1px solid ${accentColor}22`,
              borderRadius: 18,
              padding: '32px',
              width: '100%',
              maxWidth: 420,
              boxShadow: `0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}11`,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `${accentColor}14`,
                border: `1px solid ${accentColor}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                color: accentColor,
              }}
            >
              <AlertTriangle size={22} />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}
            >
              {title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 28 }}>
              {description}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onCancel}
                disabled={isLoading}
                style={{
                  height: 38,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: '#888',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#888'
                }}
              >
                {cancelLabel}
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                  height: 38,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 10,
                  border: 'none',
                  background: accentColor,
                  color: variant === 'danger' ? '#fff' : '#000',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isLoading ? 'wait' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.15s',
                  boxShadow: `0 4px 16px ${accentColor}33`,
                }}
              >
                {isLoading ? 'Please wait...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
