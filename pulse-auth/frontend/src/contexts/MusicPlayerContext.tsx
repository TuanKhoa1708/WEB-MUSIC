import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { Song } from '@/types/song.types'
import { useAuth } from '@/contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RepeatMode = 'none' | 'one' | 'all'

export interface MusicPlayerContextValue {
  // Current state
  currentSong: Song | null
  queue: Song[]
  queueIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  repeatMode: RepeatMode
  shuffleMode: boolean
  isQueueOpen: boolean

  // Actions
  playSong: (song: Song, queue?: Song[]) => void
  togglePlay: () => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  toggleQueue: () => void
  addToQueue: (song: Song) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MusicPlayerContext = createContext<MusicPlayerContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [queue, setQueue] = useState<Song[]>([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none')
  const [shuffleMode, setShuffleMode] = useState(false)
  const [isQueueOpen, setIsQueueOpen] = useState(false)

  // ── Initialize audio element once ────────────────────────────────────────────

  useEffect(() => {
    const audio = new Audio()
    audio.volume = 0.8
    audioRef.current = audio

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration || 0)
    const handleEnded = () => handleSongEnd()
    const handleError = () => {
      setIsPlaying(false)
      console.error('Audio playback error')
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.pause()
      audio.src = ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Song end handler ─────────────────────────────────────────────────────────
  // Note: using a ref-based approach to avoid stale closures

  const queueRef = useRef(queue)
  const queueIndexRef = useRef(queueIndex)
  const repeatModeRef = useRef(repeatMode)
  const shuffleModeRef = useRef(shuffleMode)

  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { queueIndexRef.current = queueIndex }, [queueIndex])
  useEffect(() => { repeatModeRef.current = repeatMode }, [repeatMode])
  useEffect(() => { shuffleModeRef.current = shuffleMode }, [shuffleMode])

  const handleSongEnd = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    const repeat = repeatModeRef.current
    const shuffle = shuffleModeRef.current
    const audio = audioRef.current
    if (!audio) return

    if (repeat === 'one') {
      audio.currentTime = 0
      audio.play().catch(console.error)
      return
    }

    if (shuffle && q.length > 1) {
      let nextIdx: number
      do { nextIdx = Math.floor(Math.random() * q.length) } while (nextIdx === idx)
      setQueueIndex(nextIdx)
      setCurrentSong(q[nextIdx])
      audio.src = q[nextIdx].audioUrl
      audio.play().catch(console.error)
      return
    }

    const nextIdx = idx + 1
    if (nextIdx < q.length) {
      setQueueIndex(nextIdx)
      setCurrentSong(q[nextIdx])
      audio.src = q[nextIdx].audioUrl
      audio.play().catch(console.error)
    } else if (repeat === 'all' && q.length > 0) {
      setQueueIndex(0)
      setCurrentSong(q[0])
      audio.src = q[0].audioUrl
      audio.play().catch(console.error)
    } else {
      setIsPlaying(false)
    }
  }, [])

  // ── Audio event listener re-bind on song end handler ─────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.addEventListener('ended', handleSongEnd)
    return () => audio.removeEventListener('ended', handleSongEnd)
  }, [handleSongEnd])

  // ── Volume sync ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    const audio = audioRef.current
    if (!audio) return

    const q = newQueue ?? [song]
    const idx = q.findIndex((s) => s._id === song._id)
    const finalIdx = idx >= 0 ? idx : 0

    setQueue(q)
    setQueueIndex(finalIdx)
    setCurrentSong(song)

    audio.src = song.audioUrl
    audio.currentTime = 0
    audio.play().catch(console.error)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return
    if (audio.paused) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [currentSong])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play().catch(console.error)
  }, [])

  const next = useCallback(() => {
    const q = queueRef.current
    const idx = queueIndexRef.current
    const shuffle = shuffleModeRef.current
    const audio = audioRef.current
    if (!audio || q.length === 0) return

    let nextIdx: number
    if (shuffle && q.length > 1) {
      do { nextIdx = Math.floor(Math.random() * q.length) } while (nextIdx === idx)
    } else {
      nextIdx = (idx + 1) % q.length
    }

    setQueueIndex(nextIdx)
    setCurrentSong(q[nextIdx])
    audio.src = q[nextIdx].audioUrl
    audio.play().catch(console.error)
  }, [])

  const previous = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    // If more than 3s into song, restart; otherwise go to previous
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }

    const q = queueRef.current
    const idx = queueIndexRef.current
    const prevIdx = (idx - 1 + q.length) % q.length

    setQueueIndex(prevIdx)
    setCurrentSong(q[prevIdx])
    audio.src = q[prevIdx].audioUrl
    audio.play().catch(console.error)
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all'
      if (prev === 'all') return 'one'
      return 'none'
    })
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffleMode((prev) => !prev)
  }, [])

  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev)
  }, [])

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song])
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentSong(null)
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.src = ''
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  // ── Auto-clear queue on logout ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      clearQueue()
    }
  }, [isAuthenticated, clearQueue])

  const value: MusicPlayerContextValue = {
    currentSong,
    queue,
    queueIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    shuffleMode,
    isQueueOpen,
    playSong,
    togglePlay,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMusicPlayer(): MusicPlayerContextValue {
  const ctx = useContext(MusicPlayerContext)
  if (!ctx) throw new Error('useMusicPlayer must be used inside <MusicPlayerProvider>')
  return ctx
}
