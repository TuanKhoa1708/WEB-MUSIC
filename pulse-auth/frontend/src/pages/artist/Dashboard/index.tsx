import { motion } from 'framer-motion'
import { LayoutDashboard, Music, Disc3, ListMusic } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/admin/StatCard'
import { DollarSign, Headphones } from 'lucide-react'
import { useArtistDashboardStats, useArtistRevenue } from '@/hooks/artist/useArtists'
import { Link } from 'react-router-dom'

export function ArtistDashboardPage() {
  const { user } = useAuth()
  const { data: dashboardStats } = useArtistDashboardStats()
  const { data: revenueStats } = useArtistRevenue()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 min-h-full max-w-[1400px] mx-auto">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center text-[#3FD6FF] flex-shrink-0">
            <LayoutDashboard size={24} className="md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-white tracking-tight leading-tight">
              {getGreeting()}, {user?.fullName?.split(' ')[0] ?? 'Artist'}!
            </h1>
            <p className="text-sm md:text-[15px] text-[#888] mt-1">
              Here's what's happening across the platform today.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
        <StatCard
          icon={<Music size={20} />}
          iconColor="#3FD6FF"
          label="My Total Songs"
          value={dashboardStats?.statistics.totalSongs ?? '—'}
          trend={0}
          trendLabel="vs last month"
          delay={0.05}
        />
        <StatCard
          icon={<Disc3 size={20} />}
          iconColor="#A78BFA"
          label="My Total Albums"
          value={dashboardStats?.statistics.totalAlbums ?? '—'}
          trend={0}
          trendLabel="vs last month"
          delay={0.1}
        />
        <StatCard
          icon={<Headphones size={20} />}
          iconColor="#F7B500"
          label="Total Plays"
          value={dashboardStats?.statistics.totalPlays ?? '—'}
          trend={0}
          trendLabel="vs last month"
          delay={0.15}
        />
        <StatCard
          icon={<DollarSign size={20} />}
          iconColor="#4CAF50"
          label="Estimated Revenue (USD)"
          value={revenueStats?.estimatedRevenue !== undefined ? `$${revenueStats.estimatedRevenue.toFixed(2)}` : '—'}
          trend={0}
          trendLabel="vs last month"
          delay={0.2}
        />
      </div>

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-base md:text-lg font-bold text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionBtn
            to="/artist/songs"
            icon={<Music size={18} />}
            label="Manage Songs"
            color="#3FD6FF"
          />
          <QuickActionBtn
            to="/artist/albums"
            icon={<Disc3 size={18} />}
            label="Manage Albums"
            color="#A78BFA"
          />
          <QuickActionBtn
            to="/artist/playlists"
            icon={<ListMusic size={18} />}
            label="My Playlists"
            color="#F7B500"
          />
        </div>
      </motion.div>
    </div>
  )
}

function QuickActionBtn({ to, icon, label, color }: { to: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 md:px-6 md:py-4 rounded-2xl bg-[#121212] border border-white/5 text-white no-underline font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 4px 20px ${color}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{
          background: `${color}15`,
          color: color,
        }}
      >
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  )
}