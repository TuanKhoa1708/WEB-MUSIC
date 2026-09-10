import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, X, LogOut, Settings, Crown, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumBadge } from '@/components/premium/PremiumBadge'
import { NotificationBell } from './NotificationBell'
import { useListenerMobileSidebar } from '@/components/listener/Sidebar'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export function ListenerHeader() {
  const { user, logout } = useAuth()
  const { setMobileOpen } = useListenerMobileSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q')
    if (location.pathname === '/listener/search') {
      if (q !== null && q !== searchQuery) {
        setSearchQuery(q)
      }
    } else {
      if (searchQuery) setSearchQuery('')
    }
  }, [location.pathname, location.search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    
    if (val.trim()) {
      navigate(`/listener/search?q=${encodeURIComponent(val)}`, { replace: location.pathname === '/listener/search' })
    } else if (location.pathname === '/listener/search') {
      navigate(`/listener/search`, { replace: true })
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    if (location.pathname === '/listener/search') {
      navigate(`/listener/search`, { replace: true })
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="flex items-center gap-3 sm:gap-4 px-4 md:px-6 sticky top-0 z-20 h-16 bg-[#090909]/85 backdrop-blur-xl border-b border-white/5 shrink-0">
      
      {/* Hamburger (Mobile) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex items-center justify-center shrink-0 w-9 h-9 rounded-[10px] bg-white/5 border border-white/10 text-[#888] hover:bg-white/10 hover:text-white transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex-1 max-w-[480px] relative min-w-[140px] group"
      >
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none group-focus-within:text-[#3FD6FF] transition-colors"
        />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (location.pathname !== '/listener/search') navigate('/listener/search')
          }}
          className={cn(
            "w-full h-10 rounded-full bg-[#1e1e1e] border border-white/10 text-white text-[14px] outline-none transition-all",
            "focus:border-[#3FD6FF]/50 focus:shadow-[0_0_0_3px_rgba(63,214,255,0.08)] hover:border-[#3FD6FF]/30",
            searchQuery ? "pl-10 pr-9" : "pl-10 pr-4"
          )}
          style={{ caretColor: '#3FD6FF' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors p-0.5"
          >
            <X size={14} />
          </button>
        )}
      </form>

      <div className="hidden sm:block flex-1" />

      {/* Notifications */}
      {user && (
        <div className="flex items-center mr-1 sm:mr-2">
          <NotificationBell />
        </div>
      )}

      {/* User menu */}
      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu((p) => !p)}
            className="flex items-center gap-1.5 sm:gap-2 bg-transparent border border-white/5 hover:border-[#3FD6FF]/30 rounded-full p-1 pr-2 sm:pr-3 cursor-pointer transition-colors"
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-black shrink-0",
              user.isPremium 
                ? "bg-gradient-to-br from-[#FFB900] to-[#FF8C00]"
                : "bg-gradient-to-br from-[#3FD6FF] to-[#2094ff]"
            )}>
              {user.isPremium ? <Crown size={13} /> : (user.fullName?.[0]?.toUpperCase() || '?')}
            </div>
            <span className="hidden sm:block text-[13px] font-semibold text-[#ddd]">
              {user.fullName?.split(' ')[0]}
            </span>
            <div className="hidden sm:block">
              <PremiumBadge isPremium={user.isPremium === true} compact />
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] right-0 bg-[#181818] border border-white/10 rounded-xl overflow-hidden min-w-[180px] shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-[100]"
              >
                <div className="p-[12px_16px] border-b border-white/5">
                  <div className="text-[13px] font-semibold text-white truncate">{user.fullName}</div>
                  <div className="text-[11px] text-[#555] mt-0.5 truncate">{user.email}</div>
                  <div className="mt-1.5">
                    <PremiumBadge isPremium={user.isPremium === true} />
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {user.role === 'artist' && (
                    <MenuBtn
                      icon={<Settings size={14} />}
                      label="Artist Dashboard"
                      onClick={() => { navigate('/artist/dashboard'); setShowUserMenu(false) }}
                    />
                  )}
                  {user.role === 'admin' && (
                    <MenuBtn
                      icon={<Settings size={14} />}
                      label="Admin Panel"
                      onClick={() => { navigate('/admin/dashboard'); setShowUserMenu(false) }}
                    />
                  )}
                  {!user.isPremium && user.role === 'user' && (
                    <MenuBtn
                      icon={<Crown size={14} />}
                      label="Upgrade to Premium"
                      premium
                      onClick={() => { navigate('/listener/premium'); setShowUserMenu(false) }}
                    />
                  )}
                  {user.isPremium && (
                    <MenuBtn
                      icon={<Crown size={14} />}
                      label="My Subscription"
                      premium
                      onClick={() => { navigate('/listener/premium'); setShowUserMenu(false) }}
                    />
                  )}
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
      )}
    </header>
  )
}

function MenuBtn({ icon, label, onClick, danger, premium }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; premium?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 w-full p-[9px_12px] rounded-lg text-[13px] transition-colors text-left",
        danger 
          ? "text-red-500 hover:bg-red-500/10" 
          : premium 
            ? "text-[#FFB900] hover:bg-[#FFB900]/10" 
            : "text-[#ccc] hover:bg-white/5"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}
