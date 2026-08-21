import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldOff, ArrowLeft } from 'lucide-react'

export function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090909',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: 'center',
          maxWidth: 420,
          padding: '0 24px',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'rgba(255,91,91,0.1)',
            border: '1px solid rgba(255,91,91,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            color: '#FF5B5B',
          }}
        >
          <ShieldOff size={32} />
        </div>

        {/* Code */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#FF5B5B',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Error 403
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.04em',
            marginBottom: 14,
          }}
        >
          Access Denied
        </h1>

        <p
          style={{
            fontSize: 15,
            color: '#555',
            lineHeight: 1.65,
            marginBottom: 36,
          }}
        >
          You don't have permission to access this page.
          <br />
          Please contact your administrator.
        </p>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 42,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 11,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#aaa',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#aaa'
          }}
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
