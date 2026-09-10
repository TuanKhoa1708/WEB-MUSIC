import { useState, useEffect, createContext, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Search,
  Library,
  Heart,
  Clock,
  ChevronsLeft,
  ChevronsRight,
  Disc3,
  Mic2,
  Crown,
  Radio,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PremiumBadge } from '@/components/premium/PremiumBadge'
import { useIsPremium } from '@/hooks/listener/useSubscription'
import { useListenRoom } from '@/contexts/ListenRoomContext'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

// ─── Context ─────────────────────────────────────────────────────────

export const MobileSidebarContext = createContext<{
  mobileOpen: boolean
  setMobileOpen: (val: boolean) => void
}>({ mobileOpen: false, setMobileOpen: () => {} })

export function useListenerMobileSidebar() {
  return useContext(MobileSidebarContext)
}

// ─── Data ────────────────────────────────────────────────────────────

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

// ─── Sidebar Component ───────────────────────────────────────────────

export function ListenerSidebar({ isMobile = false, onClose }: { isMobile?: boolean; onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const isPremium = useIsPremium()
  const { isInRoom } = useListenRoom()

  useEffect(() => {
    if (isMobile) return // Mobile is never collapsed in drawer mode
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  return (
    <motion.div
      animate={{ width: isMobile ? 280 : collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col shrink-0 h-full overflow-visible",
        isMobile ? "bg-[#0a0a0a]" : "bg-[#0a0a0a] border-r border-white/5 sticky top-0 z-40 h-screen"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center justify-between min-h-[72px]", collapsed && !isMobile ? "p-[20px_16px]" : "p-5")}>
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#3FD6FF] to-[#2094ff] flex items-center justify-center shrink-0">
              <Disc3 size={18} color="#000" />
            </div>
            <span className="text-[18px] font-extrabold text-white tracking-[-0.03em] drop-shadow-[0_0_16px_rgba(63,214,255,0.4)]">
              Pulse
            </span>
          </motion.div>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#3FD6FF] to-[#2094ff] flex items-center justify-center mx-auto shrink-0">
            <Disc3 size={18} color="#000" />
          </div>
        )}

        {/* Close Button on Mobile */}
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-[#888] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Collapse toggle (Desktop/Tablet only) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)] text-[#888] hover:text-[#3FD6FF] hover:bg-[#222] flex items-center justify-center z-50 shrink-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      )}

      {/* Nav Content */}
      <div className={cn("flex-1 overflow-y-auto overflow-x-hidden", collapsed && !isMobile ? "p-[8px_10px]" : "p-[8px_12px]")}>
        <NavSection label="Menu" collapsed={collapsed && !isMobile}>
          {mainNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed && !isMobile} onClick={onClose} />
          ))}
        </NavSection>

        <NavSection label="Library" collapsed={collapsed && !isMobile}>
          {libraryNav.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed && !isMobile} onClick={onClose} />
          ))}
        </NavSection>

        {user?.role === 'user' && (
          <NavSection label="Account" collapsed={collapsed && !isMobile}>
            {accountNav.map((item) => (
              <SidebarLink key={item.to} item={item} collapsed={collapsed && !isMobile} onClick={onClose} />
            ))}
          </NavSection>
        )}

        <NavSection label="Listen Together" collapsed={collapsed && !isMobile}>
          <NavLink
            to="/listener/room/join"
            onClick={onClose}
            title={(collapsed && !isMobile) ? 'Join Session' : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-2.5 p-[10px_14px] rounded-[10px] text-[14px] font-medium transition-all duration-200",
              (collapsed && !isMobile) ? "justify-center" : "justify-start",
              isInRoom ? "text-[#3FD6FF] bg-[rgba(63,214,255,0.05)]" : isActive ? "text-white bg-[rgba(63,214,255,0.08)] border-l-2 border-[#3FD6FF]" : "text-[#666] hover:bg-white/5 hover:text-[#ccc] border-l-2 border-transparent",
              !isActive && "border-l-2 border-transparent"
            )}
          >
            <span className="shrink-0 relative">
              <Radio size={18} />
              {isInRoom && (
                <span className="absolute -top-[2px] -right-[2px] w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.7)]" />
              )}
            </span>
            {(!collapsed || isMobile) && (
              <span className="flex items-center gap-1.5">
                Join Session
                {!isPremium && <Crown size={11} color="#FFB900" />}
              </span>
            )}
          </NavLink>
        </NavSection>
      </div>

      {/* User info at bottom */}
      {(!collapsed || isMobile) && user && (
        <div className="p-[12px_16px] border-t border-white/5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3FD6FF22] to-[#2094ff22] border border-[#3FD6FF33] flex items-center justify-center text-[13px] font-bold text-[#3FD6FF] shrink-0">
                {user.fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-[#555] mt-0.5">
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

function NavSection({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="text-[10px] font-bold text-[#3a3a3a] tracking-[0.1em] uppercase px-3.5 pb-1.5">
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

function SidebarLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => cn(
        "flex items-center gap-2.5 p-[10px_14px] rounded-[10px] text-[14px] font-medium transition-all duration-200",
        collapsed ? "justify-center" : "justify-start",
        isActive 
          ? "text-white bg-[rgba(63,214,255,0.08)] border-l-2 border-[#3FD6FF]" 
          : "text-[#666] border-l-2 border-transparent hover:bg-white/5 hover:text-[#ccc]"
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

// ─── Mobile Drawer ───────────────────────────────────────────────────

export function ListenerMobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-[101] flex md:hidden"
          >
            <ListenerSidebar isMobile onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}