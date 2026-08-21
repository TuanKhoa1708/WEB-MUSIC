import { motion } from 'framer-motion'
import { X, Music2, Play } from 'lucide-react'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import type { Song } from '@/types/song.types'

function getArtistName(song: Song): string {
  if (!song.artistId) return ''
  if (typeof song.artistId === 'object') return song.artistId.stageName
  return ''
}

export function QueuePanel() {
  const { queue, currentSong, queueIndex, playSong, removeFromQueue, clearQueue, toggleQueue } = useMusicPlayer()
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 0,
        width: 320,
        maxHeight: 'calc(100vh - 160px)',
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px 0 0 12px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 49,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Queue</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#888', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
          <button
            onClick={toggleQueue}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Queue list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {queue.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#444', fontSize: 13 }}>
            Queue is empty
          </div>
        ) : (
          queue.map((song: Song, i: number) => {
            const isCurrent = song._id === currentSong?._id && i === queueIndex
            return (
              <div
                key={`${song._id}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  background: isCurrent ? 'rgba(63,214,255,0.06)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
                onClick={() => playSong(song, queue)}
              >
                {/* Cover */}
                <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', border: isCurrent ? '1px solid #3FD6FF40' : '1px solid transparent' }}>
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                      <Music2 size={14} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#3FD6FF' : '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getArtistName(song)}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(i) }}
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                )}

                {isCurrent && (
                  <div style={{ color: '#3FD6FF', flexShrink: 0 }}>
                    <Play size={13} fill="#3FD6FF" />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
