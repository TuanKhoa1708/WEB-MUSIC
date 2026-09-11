import { motion } from 'framer-motion'
import {
  Music,
  Disc3,
  TrendingUp,
  Play,
  Heart,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useArtistDashboardStats } from '@/hooks/artist/useArtists'

export function ArtistDashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useArtistDashboardStats()

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 28px)', minHeight: '100%' }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(63,214,255,0.15), rgba(63,214,255,0.03))',
              border: '1px solid rgba(63,214,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3FD6FF',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(63,214,255,0.1)',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 'clamp(22px, 2.5vw, 28px)',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Welcome back, {user?.fullName?.split(' ')[0] || 'Artist'}! 👋
            </h1>
            <p style={{ fontSize: 'clamp(13px, 1.5vw, 14px)', color: '#777', marginTop: 6, marginBottom: 0 }}>
              Here is how your music performance is looking today.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to="/artist/songs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              paddingLeft: 18,
              paddingRight: 18,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
              color: '#000',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(63,214,255,0.25)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Upload Track
          </Link>
        </div>
      </motion.div>

      {/* ── Stat Cards Grid ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 36,
        }}
      >
        {[
          { label: 'Total Plays', value: stats?.statistics.totalPlays ?? '12,450', icon: <Play size={20} />, color: '#3FD6FF' },
          { label: 'Total Followers', value: stats?.statistics.totalFollowers ?? '1,280', icon: <Heart size={20} />, color: '#FF5B5B' },
          { label: 'Published Songs', value: stats?.statistics.totalSongs ?? '24', icon: <Music size={20} />, color: '#3DDC84' },
          { label: 'Albums & Playlists', value: stats?.statistics.totalAlbums ?? '8', icon: <Disc3 size={20} />, color: '#F7B500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#777' }}>{stat.label}</span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${stat.color}15`,
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.icon}
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              {isLoading ? '...' : stat.value}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  )
}