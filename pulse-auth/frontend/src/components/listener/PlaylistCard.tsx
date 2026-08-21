import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ListMusic } from 'lucide-react'
import type { Playlist } from '@/types/playlist.types'

interface PlaylistCardProps {
  playlist: Playlist
  delay?: number
  songCount?: number
}

export function PlaylistCard({ playlist, delay = 0, songCount }: PlaylistCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/listener/playlists/${playlist._id}`)}
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', paddingTop: '100%', background: 'linear-gradient(135deg, #0d2233, #0a1a0a)' }}>
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(63,214,255,0.08), rgba(32,148,255,0.08))',
          }}>
            <ListMusic size={40} color="#3FD6FF33" />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 10px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {playlist.title}
        </p>
        <p style={{ fontSize: 12, color: '#666', margin: '3px 0 0' }}>
          {songCount !== undefined ? `${songCount} songs` : 'Playlist'}
        </p>
      </div>
    </motion.div>
  )
}
