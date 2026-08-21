import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Repeat1, Shuffle,
  ListMusic, Heart, Music2,
} from 'lucide-react'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useFavoriteContext } from '@/contexts/FavoriteContext'
import type { Song } from '@/types/song.types'
import { QueuePanel } from '@/components/listener/QueuePanel'

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function getArtistName(song: Song): string {
  if (!song.artistId) return 'Unknown Artist'
  if (typeof song.artistId === 'object') return song.artistId.stageName
  return 'Unknown Artist'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalMusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration,
    volume, isMuted, repeatMode, shuffleMode, isQueueOpen,
    togglePlay, next, previous, seek, setVolume, toggleMute,
    toggleRepeat, toggleShuffle, toggleQueue,
  } = useMusicPlayer()
  const { isFavorite, toggleFavorite } = useFavoriteContext()
  const progressRef = useRef<HTMLDivElement>(null)

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const favored = isFavorite(currentSong._id)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    seek(ratio * duration)
  }

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const v = Math.max(0, Math.min(1, x / rect.width))
    setVolume(v)
  }

  return (
    <>
      {/* Queue Panel */}
      <AnimatePresence>
        {isQueueOpen && <QueuePanel />}
      </AnimatePresence>

      {/* Player bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          alignItems: 'center',
          gap: 16,
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        {/* Left: Song info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Cover */}
          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', position: 'relative' }}>
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                <Music2 size={20} />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13, fontWeight: 600, color: '#fff',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                cursor: 'pointer',
              }}
              title={currentSong.title}
            >
              {currentSong.title}
            </div>
            <div
              style={{
                fontSize: 11, color: '#666',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {getArtistName(currentSong)}
            </div>
          </div>

          {/* Favorite */}
          <button
            onClick={() => toggleFavorite(currentSong)}
            title={favored ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              background: 'none',
              border: 'none',
              color: favored ? '#3FD6FF' : '#555',
              cursor: 'pointer',
              padding: 4,
              transition: 'color 0.2s',
              flexShrink: 0,
            }}
          >
            <Heart size={16} fill={favored ? '#3FD6FF' : 'none'} />
          </button>
        </div>

        {/* Center: Controls + progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Shuffle */}
            <ControlBtn
              onClick={toggleShuffle}
              active={shuffleMode}
              title="Shuffle"
            >
              <Shuffle size={15} />
            </ControlBtn>

            {/* Previous */}
            <ControlBtn onClick={previous} title="Previous">
              <SkipBack size={18} />
            </ControlBtn>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: '#fff',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.1s, background 0.2s',
                color: '#000',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e0e0e0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.93)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
            </button>

            {/* Next */}
            <ControlBtn onClick={next} title="Next">
              <SkipForward size={18} />
            </ControlBtn>

            {/* Repeat */}
            <ControlBtn
              onClick={toggleRepeat}
              active={repeatMode !== 'none'}
              title={repeatMode === 'none' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
            >
              {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
            </ControlBtn>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 500 }}>
            <span style={{ fontSize: 11, color: '#555', minWidth: 32, textAlign: 'right' }}>
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              style={{
                flex: 1,
                height: 4,
                background: '#2a2a2a',
                borderRadius: 4,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                const inner = e.currentTarget.firstChild as HTMLElement
                if (inner) inner.style.height = '6px'
                e.currentTarget.style.height = '6px'
              }}
              onMouseLeave={(e) => {
                const inner = e.currentTarget.firstChild as HTMLElement
                if (inner) inner.style.height = '4px'
                e.currentTarget.style.height = '4px'
              }}
            >
              <div style={{
                position: 'absolute',
                left: 0, top: 0,
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3FD6FF, #2094ff)',
                borderRadius: 4,
                transition: 'width 0.1s linear',
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#555', minWidth: 32 }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume + queue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          {/* Queue */}
          <ControlBtn onClick={toggleQueue} active={isQueueOpen} title="Queue">
            <ListMusic size={16} />
          </ControlBtn>

          {/* Mute */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Volume slider */}
          <div
            onClick={handleVolumeClick}
            style={{
              width: 80,
              height: 4,
              background: '#2a2a2a',
              borderRadius: 4,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.height = '6px')}
            onMouseLeave={(e) => (e.currentTarget.style.height = '4px')}
          >
            <div style={{
              position: 'absolute',
              left: 0, top: 0,
              height: '100%',
              width: `${isMuted ? 0 : volume * 100}%`,
              background: '#3FD6FF',
              borderRadius: 4,
              transition: 'width 0.05s',
            }} />
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Control button ────────────────────────────────────────────────────────────

function ControlBtn({ children, onClick, active, title }: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none',
        border: 'none',
        color: active ? '#3FD6FF' : '#777',
        cursor: 'pointer',
        padding: '6px 8px',
        borderRadius: 6,
        transition: 'color 0.2s, background 0.2s',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = '#777'
      }}
    >
      {children}
    </button>
  )
}
