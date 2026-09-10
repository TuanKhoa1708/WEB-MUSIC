import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Disc3 } from 'lucide-react'
import type { Album } from '@/types/album.types'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

interface AlbumCardProps {
  album: Album & { songs?: any[] }
  delay?: number
  onClick?: () => void
}

function getArtistName(album: Album): string {
  if (!album.artistId) return 'Unknown Artist'
  if (typeof album.artistId === 'object') return album.artistId.stageName
  return 'Unknown Artist'
}

export function AlbumCard({ album, delay = 0, onClick }: AlbumCardProps) {
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()

  const handleClick = () => {
    if (onClick) onClick()
    else navigate(`/listener/albums/${album._id}`)
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    // If album has songs loaded, play first one
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs)
    } else {
      navigate(`/listener/albums/${album._id}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={handleClick}
      whileHover={{ y: -3 }}
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', paddingTop: '100%', background: '#181818' }}>
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
            <Disc3 size={40} />
          </div>
        )}

        {/* Play button overlay */}
        <motion.div
          className="album-play-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
          }}
        >
          <button
            onClick={handlePlay}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: '#3FD6FF',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(63,214,255,0.4)',
            }}
          >
            <Play size={16} fill="#000" color="#000" style={{ marginLeft: 2 }} />
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 10px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {album.title}
        </p>
        <p style={{ fontSize: 12, color: '#666', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getArtistName(album)}{album.releaseYear ? ` • ${album.releaseYear}` : ''}
        </p>
      </div>
    </motion.div>
  )
}
