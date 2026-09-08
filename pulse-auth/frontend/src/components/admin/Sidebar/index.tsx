import { useState, createContext, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Mic2,
  Users,
  Music,
  Disc3,
  ListMusic,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Inbox,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ─── Mobile sidebar context ───────────────────────────────────────────────────

interface MobileSidebarCtx {
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
}

export const MobileSidebarContext = createContext<MobileSidebarCtx>({
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function useMobileSidebar() {
  return useContext(MobileSidebarContext)
}

// ─── Nav item definition ──────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: React.ReactNode
  to: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',           icon: <LayoutDashboard size={18} />,  to: '/admin/dashboard'       },
  { label: 'Artist Requests',     icon: <Inbox size={18} />,            to: '/admin/artist-requests' },
  { label: 'Artist Management',   icon: <Mic2 size={18} />,             to: '/admin/artists'         },
  { label: 'Listener Management', icon: <Users size={18} />,            to: '/admin/listeners'       },
  { label: 'Song Management',     icon: <Music size={18} />,            to: '/admin/songs'           },
  { label: 'Album Management',    icon: <Disc3 size={18} />,            to: '/admin/albums'          },
  { label: 'Playlist Management', icon: <ListMusic size={18} />,        to: '/admin/playlists'       },
  { label: 'Settings',            icon: <Settings size={18} />,         to: '/admin/settings'        },
]

// ─── Shared inner sidebar content ─────────────────────────────────────────────

function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean
  onClose?: () => void
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* ── Logo ──────────────────────────────────────────── */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: collapsed ? 20 : 24,
          paddingRight: 12,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(63,214,255,0.2), rgba(63,214,255,0.06))',
            border: '1px solid rgba(63,214,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(63,214,255,0.12)',
          }}
        >
          <Zap size={16} fill="#3FD6FF" stroke="#3FD6FF" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #fff 0%, #3FD6FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              Pulse
            </motion.span>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              marginLeft: 'auto',
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Nav items ─────────────────────────────────────── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 0',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavigate={onClose}
          />
        ))}
      </nav>

      {/* ── Bottom controls ────────────────────────────────── */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: '#FF5B5B',
            cursor: 'pointer',
            width: '100%',
            transition: 'background 0.2s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,91,91,0.08)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle — desktop only */}
        {!onClose && (
          <button
            onClick={() => {/* handled by parent */}}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '10px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: '#555',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </>
  )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0e0e0e',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        zIndex: 40,
      }}
      className="admin-sidebar-desktop"
    >
      {/* Render inner content; pass collapse toggle via bottom btn */}
      <div
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        onClick={(e) => {
          // Collapse toggle button click propagates here
          const btn = (e.target as Element).closest('[data-collapse-toggle]')
          if (btn) setCollapsed((c) => !c)
        }}
      >
        {/* ── Logo ─────────────────────────────────────────── */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: collapsed ? 20 : 24,
            paddingRight: 12,
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(63,214,255,0.2), rgba(63,214,255,0.06))',
              border: '1px solid rgba(63,214,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(63,214,255,0.12)',
            }}
          >
            <Zap size={16} fill="#3FD6FF" stroke="#3FD6FF" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #fff 0%, #3FD6FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                Pulse
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav items ──────────────────────────────────────── */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '12px 0',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* ── Collapse toggle ────────────────────────────────── */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* Logout */}
          <LogoutButton collapsed={collapsed} />

          {/* Collapse button */}
          <button
            data-collapse-toggle
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '10px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: '#555',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#888'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#555'
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

export function AdminMobileDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: 260,
              height: '100vh',
              background: '#0e0e0e',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <SidebarContent collapsed={false} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Logout button helper ─────────────────────────────────────────────────────

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <button
      onClick={handleLogout}
      title="Logout"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 10,
        border: 'none',
        background: 'transparent',
        color: '#FF5B5B',
        cursor: 'pointer',
        width: '100%',
        transition: 'background 0.2s',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,91,91,0.08)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      <LogOut size={18} style={{ flexShrink: 0 }} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            Logout
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// ─── Single Nav Item ──────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      style={{ textDecoration: 'none', display: 'block', padding: '2px 10px' }}
    >
      {({ isActive }) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 10,
            transition: 'all 0.2s ease',
            background: isActive ? 'rgba(63,214,255,0.07)' : 'transparent',
            color: isActive ? '#3FD6FF' : '#666',
            position: 'relative',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLDivElement).style.color = '#aaa'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              (e.currentTarget as HTMLDivElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLDivElement).style.color = '#666'
            }
          }}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              style={{
                position: 'absolute',
                left: -10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 20,
                borderRadius: 100,
                background: '#3FD6FF',
                boxShadow: '0 0 8px rgba(63,214,255,0.6)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          <span style={{ flexShrink: 0 }}>{item.icon}</span>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
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
