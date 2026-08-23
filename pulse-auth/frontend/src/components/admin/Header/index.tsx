import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ─── Breadcrumb map ───────────────────────────────────────────────────────────

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/admin/dashboard':  ['Admin', 'Dashboard'],
  '/admin/artists':    ['Admin', 'Artist Management'],
  '/admin/listeners':  ['Admin', 'Listener Management'],
  '/admin/songs':      ['Admin', 'Song Management'],
  '/admin/albums':     ['Admin', 'Album Management'],
  '/admin/playlists':  ['Admin', 'Playlist Management'],
  '/admin/settings':   ['Admin', 'Settings'],
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminHeader() {
  const { user } = useAuth()
  const location = useLocation()
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifCount] = useState(3)

  const crumbs = BREADCRUMB_MAP[location.pathname] ?? ['Admin']

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
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        {crumbs.map((crumb, i) => (
          <div key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <ChevronRight size={13} style={{ color: '#333', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontSize: 13,
                fontWeight: i === crumbs.length - 1 ? 700 : 500,
                color: i === crumbs.length - 1 ? '#fff' : '#444',
                letterSpacing: '-0.01em',
              }}
            >
              {crumb}
            </span>
          </div>
        ))}
      </nav>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: 240,
          transition: 'width 0.3s ease',
          ...(searchFocused ? { width: 320 } : {}),
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
          }}
        />
      </div>

      {/* ── Right controls ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            margin: '0 4px',
          }}
        />

        {/* Admin avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
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
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              {user?.fullName ?? 'Admin'}
            </div>
            <div style={{ fontSize: 11, color: '#3FD6FF', fontWeight: 600, marginTop: 2 }}>
              Administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
