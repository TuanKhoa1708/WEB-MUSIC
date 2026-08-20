import { motion } from 'framer-motion'
import { LayoutDashboard, Music, Disc3, ListMusic } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/admin/StatCard'
import { useSongStats } from '@/hooks/artist/useSongs'
import { useAlbumStats } from '@/hooks/artist/useAlbums'
import { usePlaylistStats } from '@/hooks/artist/usePlaylists'
import { Link } from 'react-router-dom'

export function ArtistDashboardPage() {
  const { user } = useAuth()
  const { data: songStats } = useSongStats()
  const { data: albumStats } = useAlbumStats()
  const { data: playlistStats } = usePlaylistStats()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      {/* ── Page header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(63,214,255,0.08)',
              border: '1px solid rgba(63,214,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3FD6FF',
              flexShrink: 0,
            }}
          >
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {getGreeting()}, {user?.fullName?.split(' ')[0] ?? 'Artist'}!
            </h1>
            <p style={{ fontSize: 15, color: '#888', marginTop: 4 }}>
              Here's what's happening across the platform today.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}
      >
        <StatCard
          icon={<Music size={20} />}
          iconColor="#3FD6FF"
          label="Total Platform Songs"
          value={songStats?.totalSongs ?? '—'}
          trend={8}
          trendLabel="vs last month"
          delay={0.05}
        />
        <StatCard
          icon={<Disc3 size={20} />}
          iconColor="#A78BFA"
          label="Total Platform Albums"
          value={albumStats?.totalAlbums ?? '—'}
          trend={12}
          trendLabel="vs last month"
          delay={0.1}
        />
        <StatCard
          icon={<ListMusic size={20} />}
          iconColor="#F7B500"
          label="Total Platform Playlists"
          value={playlistStats?.totalPlaylists ?? '—'}
          trend={5}
          trendLabel="vs last month"
          delay={0.15}
        />
      </div>

      {/* ── Quick actions ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 24px',
        borderRadius: 16,
        background: '#121212',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 14,
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = color
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 20px ${color}15`
        ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.06)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      {label}
    </Link>
  )
}
