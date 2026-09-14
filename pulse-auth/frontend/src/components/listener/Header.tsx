import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, X, LogOut, Settings, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumBadge } from '@/components/premium/PremiumBadge'
import { NotificationBell } from './NotificationBell'

export function ListenerHeader() {
  const { user, logout } = useAuth()
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
    <header className="flex items-center gap-3 sm:gap-4 px-4 md:px-6 sticky top-0 z-20 h-16 bg-[#090909]/85 backdrop-blur-xl border-b border-white/5">
      {/* Search bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex-1 max-w-[480px] relative min-w-[140px]"
      >
        <Search
          size={15}
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(63,214,255,0.5)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(63,214,255,0.08)'
            if (location.pathname !== '/listener/search') navigate('/listener/search')
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          className="search-input"
          style={{
            width: '100%',
            height: 40,
            paddingLeft: 40,
            paddingRight: searchQuery ? 36 : 16,
            borderRadius: 20,
            background: '#1e1e1e',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#ffffff',
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            caretColor: '#3FD6FF',
          }}
          onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = 'rgba(63,214,255,0.3)' }}
          onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 2 }}
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
            className="flex items-center gap-1.5 sm:gap-2 bg-transparent border border-white/5 hover:border-[#3FD6FF]/30 rounded-full p-1 pr-2 sm:pr-3 cursor-pointer transition-all"
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(63,214,255,0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: user.isPremium
                ? 'linear-gradient(135deg, #FFB900, #FF8C00)'
                : 'linear-gradient(135deg, #3FD6FF, #2094ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#000',
            }}>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.fullName}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{user.email}</div>
                  <div style={{ marginTop: 6 }}>
                    <PremiumBadge isPremium={user.isPremium === true} />
                  </div>
                </div>
                <div style={{ padding: '6px' }}>
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
  const color = danger ? '#ef4444' : premium ? '#FFB900' : '#ccc'
  const hoverBg = danger ? 'rgba(239,68,68,0.08)' : premium ? 'rgba(255,185,0,0.08)' : 'rgba(255,255,255,0.06)'
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 12px',
        background: 'none',
        border: 'none',
        borderRadius: 8,
        color,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'background 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      {label}
    </button>
  )
}
