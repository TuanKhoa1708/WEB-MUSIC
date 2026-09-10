import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, ChevronRight, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Breadcrumb map ───────────────────────────────────────────────────────────

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/admin/dashboard':      ['Admin', 'Dashboard'],
  '/admin/artist-requests':['Admin', 'Artist Requests'],
  '/admin/artists':        ['Admin', 'Artist Management'],
  '/admin/listeners':      ['Admin', 'Listener Management'],
  '/admin/songs':          ['Admin', 'Song Management'],
  '/admin/albums':         ['Admin', 'Album Management'],
  '/admin/playlists':      ['Admin', 'Playlist Management'],
  '/admin/settings':       ['Admin', 'Settings'],
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminHeader() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifCount] = useState(3)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const crumbs = BREADCRUMB_MAP[location.pathname] ?? ['Admin']

  return (
    <header
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(9,9,9,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
        gap: 12,
        minWidth: 0,
      }}
    >

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {crumbs.map((crumb, i) => (
          <div
            key={crumb}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              overflow: 'hidden',
              minWidth: 0,
              flexShrink: i === crumbs.length - 1 ? 1 : 0,
            }}
          >
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

      {/* ── Search — hidden on mobile ────────────────────────── */}
      <div
        className="admin-header-search"
        style={{
          position: 'relative',
          flexShrink: 0,
          width: searchFocused ? 280 : 200,
          transition: 'width 0.3s ease',
        }}
      >
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#444',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search anything..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            height: 36,
            paddingLeft: 34,
            paddingRight: 12,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${searchFocused ? 'rgba(63,214,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: '#fff',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: searchFocused ? '0 0 0 3px rgba(63,214,255,0.08)' : 'none',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        />
      </div>

      {/* ── Right controls ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Notification bell */}
        <button
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#888'
          }}
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#3FD6FF',
                boxShadow: '0 0 6px rgba(63,214,255,0.8)',
                border: '1.5px solid #090909',
              }}
            />
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: 'rgba(255,255,255,0.06)',
            margin: '0 2px',
            flexShrink: 0,
          }}
        />

        {/* Admin avatar + name — click to open dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 999,
              padding: '4px 10px 4px 4px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(63,214,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'linear-gradient(135deg, #3FD6FF22, #3FD6FF0a)',
                border: '1px solid rgba(63,214,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: '#3FD6FF',
                flexShrink: 0,
              }}
            >
              {user?.fullName?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="admin-header-username" style={{ lineHeight: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {user?.fullName ?? 'Admin'}
              </div>
              <div style={{ fontSize: 11, color: '#3FD6FF', fontWeight: 600, marginTop: 2 }}>
                Administrator
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
                  <div style={{ fontSize: 11, color: '#3FD6FF', fontWeight: 600, marginTop: 4 }}>Administrator</div>
                </div>
                <div style={{ padding: '6px' }}>
                  <MenuBtn
                    icon={<Settings size={14} />}
                    label="Settings"
                    onClick={() => { navigate('/admin/settings'); setShowUserMenu(false) }}
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .admin-header-search {
            display: none;
          }
          .admin-header-username {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .admin-header-username {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}

// ─── Dropdown menu button ─────────────────────────────────────────────────────

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
