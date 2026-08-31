import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Repeat1, Shuffle,
  ListMusic, Heart, Music2, Lock, Crown, Headphones, X, Radio,
} from 'lucide-react'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useFavoriteContext } from '@/contexts/FavoriteContext'
import { useAuth } from '@/contexts/AuthContext'
import { addHistoryApi } from '@/api/history.api'
import type { Song } from '@/types/song.types'
import { QueuePanel } from '@/components/listener/QueuePanel'
import { useIsPremium } from '@/hooks/listener/useSubscription'
import { PremiumUpgradeModal, usePremiumModal } from '@/components/premium/PremiumUpgradeModal'
import { useNavigate } from 'react-router-dom'
import { useListenRoom } from '@/contexts/ListenRoomContext'
import { ListenRoomModal } from '@/components/listener/ListenRoomModal'

// ─── Constants ────────────────────────────────────────────────────────────────
const AD_EVERY_N_SONGS = 3 // Show ad banner every N songs for free users
const AD_DURATION_MS = 15000 // Auto-dismiss after 15 seconds

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

// ─── Skip limit for free users ───────────────────────────────────────────────
const FREE_SKIP_LIMIT = 6 // per hour
const SKIP_RESET_MS = 60 * 60 * 1000 // 1 hour

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalMusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration,
    volume, isMuted, repeatMode, shuffleMode, isQueueOpen,
    togglePlay, next, previous, seek, setVolume, toggleMute,
    toggleRepeat, toggleShuffle, toggleQueue,
  } = useMusicPlayer()
  const { isFavorite, toggleFavorite } = useFavoriteContext()
  const { user } = useAuth()
  const isPremium = useIsPremium()
  const navigate = useNavigate()
  const { isOpen: modalOpen, config: modalConfig, openModal, closeModal } = usePremiumModal()
  const { isInRoom, isHost, isConnecting, createRoom, roomCode } = useListenRoom()
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const isGuestLocked = isInRoom && !isHost

  // Ad banner tracking for free users
  const [showAdBanner, setShowAdBanner] = useState(false)
  const songCountRef = useRef(0)
  const adTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Skip tracking for free users
  const [skipCount, setSkipCount] = useState(0)
  const skipResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNext = useCallback(() => {
    if (isPremium) {
      next()
      return
    }
    if (skipCount >= FREE_SKIP_LIMIT) {
      openModal('Unlimited Skips', `You've used your ${FREE_SKIP_LIMIT} free skips for this hour. Upgrade to Premium to skip freely.`)
      return
    }
    setSkipCount((c) => c + 1)
    // Reset counter after SKIP_RESET_MS
    if (skipResetRef.current) clearTimeout(skipResetRef.current)
    skipResetRef.current = setTimeout(() => setSkipCount(0), SKIP_RESET_MS)
    next()
  }, [isPremium, skipCount, next, openModal])

  useEffect(() => () => {
    if (skipResetRef.current) clearTimeout(skipResetRef.current)
  }, [])

  useEffect(() => {
    if (currentSong && user?.id) {
      addHistoryApi(user.id, currentSong._id).catch(console.error)

      // Show ad banner every N songs for free users
      if (!isPremium) {
        songCountRef.current += 1
        if (songCountRef.current % AD_EVERY_N_SONGS === 0) {
          setShowAdBanner(true)
          if (adTimerRef.current) clearTimeout(adTimerRef.current)
          adTimerRef.current = setTimeout(() => setShowAdBanner(false), AD_DURATION_MS)
        }
      }
    }
  }, [currentSong?._id, user?.id, isPremium])

  const dismissAd = useCallback(() => {
    setShowAdBanner(false)
    if (adTimerRef.current) clearTimeout(adTimerRef.current)
  }, [])

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const favored = isFavorite(currentSong._id)

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGuestLocked) return
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
      {/* Premium upgrade modal */}
      <PremiumUpgradeModal
        isOpen={modalOpen}
        onClose={closeModal}
        feature={modalConfig.feature}
        description={modalConfig.description}
      />

      {/* Listen Room Modal */}
      <ListenRoomModal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} />

      {/* Guest Session Indicator */}
      <AnimatePresence>
        {isInRoom && !isHost && (
          <motion.div
            key="guest-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              bottom: 88,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 49,
              background: 'linear-gradient(135deg, rgba(63,214,255,0.12), rgba(32,148,255,0.06))',
              border: '1px solid rgba(63,214,255,0.25)',
              borderRadius: 12,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(63,214,255,0.08)',
            }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 8px rgba(74,222,128,0.6)',
            }} />
            <Radio size={12} color="#3FD6FF" />
            <span style={{ fontSize: 12, color: '#3FD6FF', fontWeight: 700 }}>
              Listening with friends · Host controls playback
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Panel */}
      <AnimatePresence>
        {isQueueOpen && <QueuePanel />}
      </AnimatePresence>

      {/* Free Ad Banner */}
      <AnimatePresence>
        {showAdBanner && !isPremium && (
          <motion.div
            key="ad-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              bottom: 88, // just above player bar
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 49,
              background: 'linear-gradient(135deg, #0f0f0f, #161610)',
              border: '1px solid rgba(255,185,0,0.25)',
              borderRadius: 14,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,185,0,0.1)',
              maxWidth: 520,
              width: 'calc(100vw - 48px)',
            }}
          >
            {/* Ad icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(255,185,0,0.15), rgba(255,140,0,0.08))',
              border: '1px solid rgba(255,185,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Headphones size={16} color="#FFB900" />
            </div>

            {/* Ad text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#FFB900', margin: 0 }}>
                Enjoying your music? 🎵
              </p>
              <p style={{ fontSize: 11, color: '#666', margin: '2px 0 0' }}>
                Get HD audio, unlimited skips &amp; no ads with Premium.
              </p>
            </div>

            {/* Upgrade CTA */}
            <button
              onClick={() => { dismissAd(); navigate('/listener/premium') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                background: 'linear-gradient(135deg, #FFB900, #FF8C00)',
                border: 'none', borderRadius: 8,
                color: '#000', fontSize: 11, fontWeight: 800,
                padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Crown size={11} /> Upgrade
            </button>

            {/* Dismiss */}
            <button
              onClick={dismissAd}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4, flexShrink: 0 }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
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
              disabled={isGuestLocked}
            >
              <Shuffle size={15} />
            </ControlBtn>

            {/* Previous */}
            <ControlBtn onClick={previous} title="Previous" disabled={isGuestLocked}>
              <SkipBack size={18} />
            </ControlBtn>

            {/* Play/Pause */}
            <button
              onClick={isGuestLocked ? undefined : togglePlay}
              disabled={isGuestLocked}
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: isGuestLocked ? '#555' : '#fff',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isGuestLocked ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s, background 0.2s',
                color: '#000',
                opacity: isGuestLocked ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!isGuestLocked) e.currentTarget.style.background = '#e0e0e0' }}
              onMouseLeave={(e) => { if (!isGuestLocked) e.currentTarget.style.background = '#fff' }}
              onMouseDown={(e) => { if (!isGuestLocked) e.currentTarget.style.transform = 'scale(0.93)' }}
              onMouseUp={(e) => { if (!isGuestLocked) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
            </button>

            {/* Next */}
            <ControlBtn
              onClick={handleNext}
              title={isPremium ? 'Next' : `Next (${Math.max(0, FREE_SKIP_LIMIT - skipCount)} skips left)`}
              locked={!isPremium && skipCount >= FREE_SKIP_LIMIT}
              disabled={isGuestLocked}
            >
              <SkipForward size={18} />
            </ControlBtn>

            {/* Repeat */}
            <ControlBtn
              onClick={toggleRepeat}
              active={repeatMode !== 'none'}
              title={repeatMode === 'none' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
              disabled={isGuestLocked}
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
          {/* Audio Quality Badge */}
          <button
            onClick={() => {
              if (!isPremium) {
                openModal('HD Audio Quality', 'Premium members enjoy crystal-clear audio. Upgrade to unlock 320kbps high-definition streaming.')
              }
            }}
            title={isPremium ? 'HD Audio — 320kbps' : 'Standard Audio — Upgrade for HD'}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6,
              background: isPremium ? 'rgba(255,185,0,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isPremium ? 'rgba(255,185,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: isPremium ? '#FFB900' : '#555',
              fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
              cursor: isPremium ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isPremium ? (
              <><Headphones size={10} /> HD</>
            ) : (
              <><Lock size={9} /> STD</>
            )}
          </button>

          {/* Share Session Button (Premium only) */}
          {isPremium && (
            <button
              onClick={() => {
                if (!isInRoom) {
                  createRoom()
                  setIsRoomModalOpen(true)
                } else {
                  setIsRoomModalOpen(true)
                }
              }}
              disabled={isConnecting}
              title={isInRoom ? `Live session: ${roomCode}` : 'Share this session'}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 8,
                background: isInRoom
                  ? 'linear-gradient(135deg, rgba(63,214,255,0.2), rgba(32,148,255,0.12))'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isInRoom ? 'rgba(63,214,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: isInRoom ? '#3FD6FF' : '#666',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                cursor: isConnecting ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: isConnecting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if (!isInRoom) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}}
              onMouseLeave={(e) => { if (!isInRoom) { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}}
            >
              {isInRoom ? (
                <>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
                  <Radio size={12} />
                  LIVE
                </>
              ) : (
                <><Radio size={12} /> Share</>
              )}
            </button>
          )}

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

function ControlBtn({ children, onClick, active, title, locked, disabled }: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  title?: string
  locked?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        color: locked ? '#FFB900' : active ? '#3FD6FF' : disabled ? '#444' : '#777',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '6px 8px',
        borderRadius: 6,
        transition: 'color 0.2s, background 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        position: 'relative',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!active && !locked && !disabled) e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={(e) => {
        if (!active && !locked && !disabled) e.currentTarget.style.color = '#777'
      }}
    >
      {children}
      {locked && <Lock size={9} style={{ marginLeft: 1, opacity: 0.8 }} />}
    </button>
  )
}
