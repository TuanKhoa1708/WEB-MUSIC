import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Mic2,
  Music2,
  Users,
  Disc3,
  TrendingUp,
  Crown,
  ListMusic,
} from 'lucide-react'
import { useArtistStats } from '@/hooks/admin/useArtists'
import { useSongStats } from '@/hooks/admin/useSongs'
import { useListenerStats } from '@/hooks/admin/useListeners'
import { useAlbumStats } from '@/hooks/artist/useAlbums'

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function DashStatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  label: string
  value: string | number
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#0f0f0f',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 18,
        padding: '22px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${iconColor}12 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#555', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>{sub}</div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Quick Link Card ────────────────────────────────────────────────────────────

function QuickCard({
  icon,
  color,
  title,
  desc,
  href,
  delay,
}: {
  icon: React.ReactNode
  color: string
  title: string
  desc: string
  href: string
  delay: number
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      style={{
        display: 'block',
        background: '#0f0f0f',
        border: `1px solid ${color}18`,
        borderRadius: 16,
        padding: '18px 20px',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}35`
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}18`
      }}
    >
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: `${color}12`,
        border: `1px solid ${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{desc}</div>
    </motion.a>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { data: artistStats } = useArtistStats()
  const { data: songStats }   = useSongStats()
  const { data: listenerStats } = useListenerStats()
  const { data: albumStats }  = useAlbumStats()

  const totalListeners = listenerStats?.totalListeners ?? '—'
  const activeListeners = listenerStats?.activeListeners ?? '—'

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 36px)', minHeight: '100%' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(63,214,255,0.08)',
            border: '1px solid rgba(63,214,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3FD6FF',
          }}>
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: 0 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#444', margin: '4px 0 0' }}>
              Overview of Pulse platform metrics
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        <DashStatCard
          icon={<Users size={20} />}
          iconColor="#3FD6FF"
          iconBg="rgba(63,214,255,0.1)"
          label="Total Listeners"
          value={totalListeners}
          sub="Registered users"
          delay={0.05}
        />
        <DashStatCard
          icon={<Mic2 size={20} />}
          iconColor="#A78BFA"
          iconBg="rgba(167,139,250,0.1)"
          label="Artists"
          value={artistStats?.totalArtists ?? '—'}
          sub="Active artist accounts"
          delay={0.1}
        />
        <DashStatCard
          icon={<Music2 size={20} />}
          iconColor="#3DDC84"
          iconBg="rgba(61,220,132,0.1)"
          label="Songs"
          value={songStats?.totalSongs ?? '—'}
          sub="Tracks in the library"
          delay={0.15}
        />
        <DashStatCard
          icon={<Disc3 size={20} />}
          iconColor="#FFB900"
          iconBg="rgba(255,185,0,0.1)"
          label="Albums"
          value={albumStats?.totalAlbums ?? '—'}
          sub="Published albums"
          delay={0.2}
        />
        <DashStatCard
          icon={<Crown size={20} />}
          iconColor="#FF6B6B"
          iconBg="rgba(255,107,107,0.1)"
          label="Active Listeners"
          value={activeListeners}
          sub="Accounts active"
          delay={0.25}
        />
      </div>

      {/* ── Quick Access ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 24 }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#444', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
          Quick Access
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
        }}>
          <QuickCard
            icon={<Mic2 size={16} />}
            color="#3FD6FF"
            title="Artists"
            desc="Manage artist accounts and profiles"
            href="/admin/artists"
            delay={0.32}
          />
          <QuickCard
            icon={<Users size={16} />}
            color="#A78BFA"
            title="Listeners"
            desc="View and manage listener accounts"
            href="/admin/listeners"
            delay={0.35}
          />
          <QuickCard
            icon={<Music2 size={16} />}
            color="#3DDC84"
            title="Songs"
            desc="Browse and moderate song content"
            href="/admin/songs"
            delay={0.38}
          />
          <QuickCard
            icon={<ListMusic size={16} />}
            color="#FFB900"
            title="Playlists"
            desc="Manage platform playlists"
            href="/admin/playlists"
            delay={0.41}
          />
          <QuickCard
            icon={<TrendingUp size={16} />}
            color="#FF6B6B"
            title="Artist Requests"
            desc="Review pending artist applications"
            href="/admin/artist-requests"
            delay={0.44}
          />
        </div>
      </motion.div>

      {/* ── Platform Status ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 18,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#3DDC84',
          boxShadow: '0 0 8px rgba(61,220,132,0.6)',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Platform Online</div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>
            All services are running normally
          </div>
        </div>
      </motion.div>
    </div>
  )
}
