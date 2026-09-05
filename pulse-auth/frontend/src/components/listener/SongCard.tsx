import { motion } from 'framer-motion'
import { Play, Music2, Radio } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useListenRoom } from '@/contexts/ListenRoomContext'
import toast from 'react-hot-toast'
import type { Song } from '@/types/song.types'

interface SongCardProps {
  song: Song
  queue?: Song[]
  delay?: number
}

function getArtistName(song: Song): string {
  if (!song.artistId) return 'Unknown Artist'
  if (typeof song.artistId === 'object') return song.artistId.stageName
  return 'Unknown Artist'
}

export function SongCard({ song, queue, delay = 0 }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = useMusicPlayer()
  const { isInRoom, isHost } = useListenRoom()
  const isGuestLocked = isInRoom && !isHost
  const isCurrent = currentSong?._id === song._id

  const handleClick = () => {
    if (isGuestLocked) {
      toast('🎵 Host controls playback in this session', { icon: <Radio size={14} /> })
      return
    }
    playSong(song, queue ?? [song])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={handleClick}
      style={{
        background: isCurrent ? 'rgba(63,214,255,0.06)' : '#111',
        border: isCurrent ? '1px solid rgba(63,214,255,0.2)' : '1px solid rgba(255,255,255,0.04)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: isGuestLocked ? 'not-allowed' : 'pointer',
        transition: 'transform 0.2s, background 0.2s',
        position: 'relative',
        opacity: isGuestLocked ? 0.75 : 1,
      }}
      whileHover={isGuestLocked ? undefined : { y: -3 }}
    >
      {/* Cover */}
      <div style={{ position: 'relative', paddingTop: '100%', background: '#181818' }}>
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
            <Music2 size={36} />
          </div>
        )}

        {/* Play overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isCurrent && isPlaying ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
          className="play-overlay"
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3FD6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={16} fill="#000" color="#000" style={{ marginLeft: 2 }} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? '#3FD6FF' : '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {song.title}
            </p>
            <p style={{ fontSize: 12, color: '#666', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getArtistName(song)}
            </p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton song={song} size={14} />
          </div>
        </div>
      </div>

      <style>{`.play-overlay:hover { opacity: 1 !important; }`}</style>
    </motion.div>
  )
}
