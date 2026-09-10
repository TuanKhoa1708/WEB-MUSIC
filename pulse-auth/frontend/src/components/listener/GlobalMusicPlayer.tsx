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

const AD_EVERY_N_SONGS = 3
const AD_DURATION_MS = 15000

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

const FREE_SKIP_LIMIT = 6
const SKIP_RESET_MS = 60 * 60 * 1000

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

  const [showAdBanner, setShowAdBanner] = useState(false)
  const songCountRef = useRef(0)
  const adTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

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
      <PremiumUpgradeModal
        isOpen={modalOpen}
        onClose={closeModal}
        feature={modalConfig.feature}
        description={modalConfig.description}
      />

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
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[49] bg-gradient-to-br from-[#3FD6FF]/10 to-[#2094ff]/5 border border-[#3FD6FF]/25 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(63,214,255,0.08)] whitespace-nowrap"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            <Radio size={12} color="#3FD6FF" />
            <span className="text-xs text-[#3FD6FF] font-bold">
              Listening with friends · Host controls playback
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[49] bg-gradient-to-br from-[#0f0f0f] to-[#161610] border border-[#FFB900]/25 rounded-[14px] px-[18px] py-3 flex items-center gap-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,185,0,0.1)] w-[calc(100vw-48px)] max-w-[520px]"
          >
            <div className="w-9 h-9 rounded-[10px] shrink-0 bg-gradient-to-br from-[#FFB900]/15 to-[#FF8C00]/10 border border-[#FFB900]/30 flex items-center justify-center">
              <Headphones size={16} color="#FFB900" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#FFB900] m-0">
                Enjoying your music? 🎵
              </p>
              <p className="text-[11px] text-[#666] mt-0.5 mb-0">
                Get HD audio, unlimited skips &amp; no ads with Premium.
              </p>
            </div>

            <button
              onClick={() => { dismissAd(); navigate('/listener/premium') }}
              className="flex items-center gap-1.5 shrink-0 bg-gradient-to-br from-[#FFB900] to-[#FF8C00] border-none rounded-lg text-black text-[11px] font-extrabold px-3 py-1.5 cursor-pointer whitespace-nowrap"
            >
              <Crown size={11} /> Upgrade
            </button>

            <button
              onClick={dismissAd}
              className="bg-transparent border-none text-[#555] cursor-pointer p-1 shrink-0 hover:text-white transition-colors"
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
        className="fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-between gap-2 md:gap-4 px-3 md:px-6 z-50"
      >
        {/* Left: Song info */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 max-w-[30%] md:max-w-[25%] lg:max-w-[30%]">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a] relative">
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#444]">
                <Music2 size={20} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div
              className="text-xs md:text-sm font-semibold text-white truncate cursor-pointer"
              title={currentSong.title}
            >
              {currentSong.title}
            </div>
            <div className="text-[11px] text-[#666] truncate">
              {getArtistName(currentSong)}
            </div>
          </div>

          <button
            onClick={() => toggleFavorite(currentSong)}
            title={favored ? 'Remove from favorites' : 'Add to favorites'}
            className={`bg-none border-none cursor-pointer p-1 transition-colors flex-shrink-0 ${favored ? 'text-[#3FD6FF]' : 'text-[#555]'}`}
          >
            <Heart size={16} fill={favored ? '#3FD6FF' : 'none'} />
          </button>
        </div>

        {/* Center: Controls + progress */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[500px] px-2">
          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ControlBtn
              onClick={toggleShuffle}
              active={shuffleMode}
              title="Shuffle"
              disabled={isGuestLocked}
            >
              <Shuffle size={14} className="sm:w-[15px] sm:h-[15px]" />
            </ControlBtn>

            <ControlBtn onClick={previous} title="Previous" disabled={isGuestLocked}>
              <SkipBack size={16} className="sm:w-[18px] sm:h-[18px]" />
            </ControlBtn>

            <button
              onClick={isGuestLocked ? undefined : togglePlay}
              disabled={isGuestLocked}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-none flex items-center justify-center transition-all ${isGuestLocked ? 'bg-[#555] cursor-not-allowed opacity-50' : 'bg-white text-black cursor-pointer hover:bg-[#e0e0e0] active:scale-95'
                }`}
            >
              {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" className="ml-0.5" />}
            </button>

            <ControlBtn
              onClick={handleNext}
              title={isPremium ? 'Next' : `Next (${Math.max(0, FREE_SKIP_LIMIT - skipCount)} skips left)`}
              locked={!isPremium && skipCount >= FREE_SKIP_LIMIT}
              disabled={isGuestLocked}
            >
              <SkipForward size={16} className="sm:w-[18px] sm:h-[18px]" />
            </ControlBtn>

            <ControlBtn
              onClick={toggleRepeat}
              active={repeatMode !== 'none'}
              title={repeatMode === 'none' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
              disabled={isGuestLocked}
            >
              {repeatMode === 'one' ? <Repeat1 size={14} className="sm:w-[15px] sm:h-[15px]" /> : <Repeat size={14} className="sm:w-[15px] sm:h-[15px]" />}
            </ControlBtn>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full mt-1">
            <span className="text-[10px] sm:text-[11px] text-[#555] min-w-[28px] sm:min-w-[32px] text-right">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-[#2a2a2a] rounded-full cursor-pointer relative overflow-hidden hover:h-1.5 transition-all"
            >
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#3FD6FF] to-[#2094ff] rounded-full transition-[width] duration-100 linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#555] min-w-[28px] sm:min-w-[32px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume + queue */}
        <div className="flex items-center gap-1.5 md:gap-2 justify-end min-w-0">
          {/* Audio Quality Badge */}
          <button
            onClick={() => {
              if (!isPremium) {
                openModal('HD Audio Quality', 'Premium members enjoy crystal-clear audio. Upgrade to unlock 320kbps high-definition streaming.')
              }
            }}
            title={isPremium ? 'HD Audio — 320kbps' : 'Standard Audio — Upgrade for HD'}
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-extrabold border transition-all ${isPremium
                ? 'bg-[#FFB900]/10 border-[#FFB900]/30 text-[#FFB900] cursor-default'
                : 'bg-white/5 border-white/10 text-[#555] cursor-pointer'
              }`}
          >
            {isPremium ? (
              <><Headphones size={10} /> HD</>
            ) : (
              <><Lock size={9} /> STD</>
            )}
          </button>

          {/* Share Session Button */}
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
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${isInRoom
                  ? 'bg-gradient-to-r from-[#3FD6FF]/20 to-[#2094ff]/10 border-[#3FD6FF]/40 text-[#3FD6FF]'
                  : 'bg-white/5 border-white/10 text-[#666] hover:text-white hover:border-white/20'
                }`}
            >
              {isInRoom ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.7)]" />
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

          {/* Mute & Volume slider */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="bg-none border-none text-[#666] hover:text-white cursor-pointer p-1 transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <div
              onClick={handleVolumeClick}
              className="w-14 lg:w-20 h-1 bg-[#2a2a2a] rounded-full cursor-pointer relative overflow-hidden hover:h-1.5 transition-all"
            >
              <div
                className="absolute left-0 top-0 h-full bg-[#3FD6FF] rounded-full transition-[width] duration-75"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

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
      className={`bg-none border-none p-1.5 rounded-md transition-colors flex items-center gap-0.5 relative ${disabled
          ? 'text-[#444] cursor-not-allowed opacity-60'
          : locked
            ? 'text-[#FFB900] cursor-pointer'
            : active
              ? 'text-[#3FD6FF] cursor-pointer'
              : 'text-[#777] hover:text-white cursor-pointer'
        }`}
    >
      {children}
      {locked && <Lock size={9} className="ml-0.5 opacity-80" />}
    </button>
  )
}