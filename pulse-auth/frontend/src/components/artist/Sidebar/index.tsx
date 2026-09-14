import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Music,
  Disc3,
  ListMusic,
  UserCircle2,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ─── Nav section definition ──────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: React.ReactNode
  to: string
}

interface NavSection {
  sectionLabel: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    sectionLabel: 'MAIN',
    items: [
      { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/artist/dashboard' },
    ],
  },
  {
    sectionLabel: 'CONTENT',
    items: [
      { label: 'Songs', icon: <Music size={18} />, to: '/artist/songs' },
      { label: 'Albums', icon: <Disc3 size={18} />, to: '/artist/albums' },
      { label: 'Playlists', icon: <ListMusic size={18} />, to: '/artist/playlists' },
    ],
  },
  {
    sectionLabel: 'PROFILE',
    items: [
      { label: 'My Profile', icon: <UserCircle2 size={18} />, to: '/artist/profile' },
    ],
  },
]

// ─── Sidebar (auto-collapse on mobile, same pattern as ListenerSidebar) ───────

export function ArtistSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  // Auto-collapse on screens < 1024px
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
      style={{
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        overflow: 'visible',
        zIndex: 40,
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 72,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3FD6FF, #2094ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Disc3 size={18} color="#000" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', textShadow: '0 0 16px rgba(63,214,255,0.4)', whiteSpace: 'nowrap' }}>
              Pulse Artist
            </span>
          </motion.div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3FD6FF, #2094ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', flexShrink: 0 }}>
            <Disc3 size={18} color="#000" />
          </div>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          right: -12,
          width: 24,
          height: 48,
          borderRadius: 12,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '4px 0 12px rgba(0,0,0,0.5)',
          color: '#888',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#3FD6FF'; e.currentTarget.style.background = '#222' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = '#1a1a1a' }}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>

      {/* ── Nav sections ──────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 10px' : '8px 12px' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.sectionLabel} style={{ marginBottom: 16 }}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontSize: 10, fontWeight: 700, color: '#3a3a3a',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '0 14px 6px', userSelect: 'none',
                  }}
                >
                  {section.sectionLabel}
                </motion.div>
              )}
            </AnimatePresence>
            {section.items.map((item) => (
              <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── User info (no logout — logout is in header dropdown) ──── */}
      {user && !collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3FD6FF22, #2094ff22)',
              border: '1px solid rgba(63,214,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#3FD6FF', flexShrink: 0,
            }}>
              {user.fullName?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Artist Account</div>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}

// ─── Single Nav Item ─────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  collapsed,
  onClick
}: {
  item: NavItem
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{ textDecoration: 'none', display: 'block', padding: '2px 0' }}
    >
      {({ isActive }) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            transition: 'all 0.2s ease',
            background: isActive ? 'rgba(63,214,255,0.08)' : 'transparent',
            color: isActive ? '#fff' : '#666',
            borderLeft: isActive && !collapsed ? '2px solid #3FD6FF' : '2px solid transparent',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'
                ; (e.currentTarget as HTMLDivElement).style.color = '#ccc'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                ; (e.currentTarget as HTMLDivElement).style.color = '#666'
            }
          }}
        >
          <span style={{ flexShrink: 0, color: isActive ? '#3FD6FF' : 'inherit' }}>{item.icon}</span>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
    </NavLink>
  )
}