import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  Library,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Plus,
  Mic2,
  Crown,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PremiumBadge } from '@/components/premium/PremiumBadge'

// ─── Nav item ─────────────────────────────────────────────────────────────────

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
}

const mainNav: NavItem[] = [
  { to: '/listener/home', icon: <Home size={18} />, label: 'Home' },
  { to: '/listener/search', icon: <Search size={18} />, label: 'Search' },
]

const libraryNav: NavItem[] = [
  { to: '/listener/library', icon: <Library size={18} />, label: 'Library' },
  { to: '/listener/favorites', icon: <Heart size={18} />, label: 'Favorites' },
  { to: '/listener/history', icon: <Clock size={18} />, label: 'Recently Played' },
]

const accountNav: NavItem[] = [
  { to: '/become-artist', icon: <Mic2 size={18} />, label: 'Become Artist' },
  { to: '/listener/premium', icon: <Crown size={18} />, label: 'Go Premium' },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const NAV_LINK_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  color: '#666',
  textDecoration: 'none',
  transition: 'all 0.2s',
  cursor: 'pointer',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ListenerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        height: '100vh',
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 72 }}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3FD6FF, #2094ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Disc3 size={18} color="#000" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              Pulse
            </span>
          </motion.div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3FD6FF, #2094ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Disc3 size={18} color="#000" />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          position: 'absolute',
          top: 22,
          right: collapsed ? -12 : -12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#1e1e1e',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#666',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 10px' : '8px 12px' }}>
        {/* Main Navigation */}
        <NavSection label="Menu" collapsed={collapsed}>
          {mainNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </NavSection>

        {/* Library */}
        <NavSection label="Library" collapsed={collapsed}>
          {libraryNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </NavSection>

        {/* Account Settings */}
        {user?.role === 'user' && (
          <NavSection label="Account" collapsed={collapsed}>
            {accountNav.map((item) => (
              <SidebarLink key={item.to} item={item} collapsed={collapsed} />
            ))}
          </NavSection>
        )}
      </div>

      {/* User info at bottom */}
      {!collapsed && user && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
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
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                  <PremiumBadge isPremium={user?.isPremium === true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavSection({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {!collapsed && (
        <p style={{ fontSize: 10, fontWeight: 700, color: '#3a3a3a', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 14px 6px' }}>
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      style={({ isActive }) => ({
        ...NAV_LINK_BASE,
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-start',
        color: isActive ? '#fff' : '#666',
        background: isActive ? 'rgba(63,214,255,0.08)' : 'transparent',
        borderLeft: isActive && !collapsed ? '2px solid #3FD6FF' : '2px solid transparent',
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        if (!el.classList.contains('active')) {
          el.style.background = 'rgba(255,255,255,0.04)'
          el.style.color = '#ccc'
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        if (!el.classList.contains('active')) {
          el.style.background = 'transparent'
          el.style.color = '#666'
        }
      }}
    >
      <span style={{ flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}
