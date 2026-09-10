import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User2 } from 'lucide-react'
import type { Artist } from '@/types/artist.types'

interface ArtistCardProps {
  artist: Artist
  delay?: number
}

export function ArtistCard({ artist, delay = 0 }: ArtistCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/listener/artists/${artist._id}`)}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '20px 12px 16px',
        background: '#111',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 16,
        transition: 'border-color 0.2s',
      }}
      onHoverStart={(e) => {
        const el = e.target as HTMLElement
        if (el.closest('.artist-card')) (el.closest('.artist-card') as HTMLElement).style.borderColor = 'rgba(63,214,255,0.2)'
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(63,214,255,0.1), rgba(32,148,255,0.1))',
        border: '2px solid rgba(63,214,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {artist.avatarUrl ? (
          <img src={artist.avatarUrl} alt={artist.stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <User2 size={32} color="#3FD6FF44" />
        )}
      </div>

      {/* Info */}
      <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {artist.stageName}
        </p>
        <p style={{ fontSize: 11, color: '#555', margin: '4px 0 0' }}>
          Artist
        </p>
      </div>
    </motion.div>
  )
}
