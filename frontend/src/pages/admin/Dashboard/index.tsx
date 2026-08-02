import { motion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'

export function AdminDashboardPage() {
  return (
    <div style={{ padding: '32px 28px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'rgba(63,214,255,0.1)',
              border: '1px solid rgba(63,214,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3FD6FF',
            }}
          >
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#444', marginTop: 2 }}>
              Overview of Pulse platform metrics
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            padding: 40,
            borderRadius: 16,
            border: '1px dashed rgba(255,255,255,0.07)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
          <p style={{ color: '#333', fontSize: 14 }}>
            Dashboard metrics coming soon.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
