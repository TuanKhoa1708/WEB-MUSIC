import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Breadcrumb map ──────────────────────────────────────────────────────────

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/artist/dashboard': ['Artist', 'Dashboard'],
  '/artist/songs': ['Artist', 'Songs'],
  '/artist/albums': ['Artist', 'Albums'],
  '/artist/playlists': ['Artist', 'Playlists'],
  '/artist/profile': ['Artist', 'My Profile'],
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ArtistHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fallback for nested routes like /artist/playlists/:id
  const crumbs = BREADCRUMB_MAP[location.pathname] ?? ['Artist']

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  return (
    <header
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 28,
        paddingRight: 28,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(9,9,9,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
        gap: 20,
      }}
    >
      {/* ── Hamburger (mobile only) ──────────────────────────── */}
      <button
        onClick={() => {
          // You might need to dispatch an event or use a context here if you added MobileSidebarContext to ArtistLayout
          // Wait, let me check ArtistLayout conflict first. The mobile context seems to have been added in the stash.
          // Let's assume MobileSidebarContext is needed. I will check the stashed code.
          const event = new CustomEvent('open-mobile-sidebar')
          window.dispatchEvent(event)
        }}
        aria-label="Open menu"
        className="lg:hidden flex items-center justify-center shrink-0 w-9 h-9 rounded-[10px] bg-white/5 border border-white/10 text-[#888] cursor-pointer transition-all"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#888'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          {crumbs.map((crumb, i) => (
            <div key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', minWidth: 0, flexShrink: i === crumbs.length - 1 ? 1 : 0 }}>
            {i > 0 && (
              <ChevronRight size={12} style={{ color: '#333', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: 13,
                fontWeight: i === crumbs.length - 1 ? 700 : 500,
                color: i === crumbs.length - 1 ? '#fff' : '#444',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {crumb}
            </span>
          </div>
        ))}
        </nav>
      </div>

      {/* ── Right: user pill ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: 'rgba(255,255,255,0.06)',
            margin: '0 4px',
          }}
        />

        {/* Artist avatar + name — click to open dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 999,
              padding: '4px 12px 4px 4px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(63,214,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'linear-gradient(135deg, rgba(63,214,255,0.18), rgba(63,214,255,0.06))',
                border: '1px solid rgba(63,214,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: '#3FD6FF',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
            <div className="hidden md:flex flex-col gap-1" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>
                {user?.fullName ?? 'Artist'}
              </div>
              <div style={{ fontSize: 12, color: '#3FD6FF', fontWeight: 600, lineHeight: 1 }}>
                Artist
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#181818',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  minWidth: 180,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  zIndex: 100,
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.fullName}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{user?.email}</div>
                  <div style={{ fontSize: 11, color: '#3FD6FF', fontWeight: 600, marginTop: 4 }}>Artist Account</div>
                </div>
                <div style={{ padding: '6px' }}>
                  <MenuBtn
                    icon={<User size={14} />}
                    label="My Profile"
                    onClick={() => { navigate('/artist/profile'); setShowUserMenu(false) }}
                  />
                  <MenuBtn
                    icon={<LogOut size={14} />}
                    label="Log Out"
                    danger
                    onClick={() => { logout(); navigate('/') }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

// ─── Dropdown menu button ────────────────────────────────────────────────────

function MenuBtn({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: danger ? '#ef4444' : '#aaa',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? 'rgba(239,68,68,0.1)'
          : 'rgba(255,255,255,0.06)'
        e.currentTarget.style.color = danger ? '#f87171' : '#fff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = danger ? '#ef4444' : '#aaa'
      }}
    >
      {icon}
      {label}
    </button>
  )
}