import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ─── Breadcrumb map ───────────────────────────────────────────────────────────

const BREADCRUMB_MAP: Record<string, string[]> = {
  '/artist/dashboard':  ['Artist', 'Dashboard'],
  '/artist/songs':      ['Artist', 'Songs'],
  '/artist/albums':     ['Artist', 'Albums'],
  '/artist/playlists':  ['Artist', 'Playlists'],
  '/artist/profile':    ['Artist', 'My Profile'],
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtistHeader() {
  const { user } = useAuth()
  const location = useLocation()
  const [searchFocused, setSearchFocused] = useState(false)

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
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
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
                whiteSpace: 'nowrap',
              }}
            >
              {crumb}
            </span>
          </div>
        ))}
      </nav>

      {/* ── Right: user pill ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Hidden search input — expands on focus */}
        <div
          style={{
            position: 'relative',
            width: searchFocused ? 220 : 0,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
          }}
        >
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              height: 36,
              paddingLeft: 14,
              paddingRight: 12,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(63,214,255,0.3)',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: 'rgba(255,255,255,0.06)',
            margin: '0 4px',
          }}
        />

        {/* Artist avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              {user?.fullName ?? 'Artist'}
            </div>
            <div style={{ fontSize: 11, color: '#3FD6FF', fontWeight: 600, marginTop: 2 }}>
              Artist
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
