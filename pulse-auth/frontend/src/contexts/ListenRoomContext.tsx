import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { socket } from '@/lib/socket'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import type { Song } from '@/types/song.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoomMember {
  userId: string
  username: string
  avatarUrl?: string
  isHost: boolean
}

export interface RoomState {
  song: Song | null
  queue: Song[]
  currentTime: number
  isPlaying: boolean
}

export interface ListenRoomContextValue {
  isInRoom: boolean
  roomCode: string | null
  isHost: boolean
  members: RoomMember[]
  isConnecting: boolean
  createRoom: () => void
  joinRoom: (code: string) => Promise<boolean>
  leaveRoom: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ListenRoomContext = createContext<ListenRoomContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ListenRoomProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { currentSong, queue, currentTime, isPlaying, playSong, seek, pause, resume } = useMusicPlayer()

  const [isInRoom, setIsInRoom] = useState(false)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  // Track whether we are applying a remote sync (to avoid feedback loops)
  const applyingRemoteSync = useRef(false)
  const roomCodeRef = useRef<string | null>(null)

  useEffect(() => {
    roomCodeRef.current = roomCode
  }, [roomCode])

  // ── Build current state payload ─────────────────────────────────────────────

  const buildState = useCallback((): RoomState => ({
    song: currentSong,
    queue,
    currentTime,
    isPlaying,
  }), [currentSong, queue, currentTime, isPlaying])

  // ── Connect socket once ─────────────────────────────────────────────────────

  const ensureConnected = useCallback(() => {
    if (!socket.connected) {
      socket.connect()
    }
  }, [])

  // ── Host: broadcast sync whenever player state changes ──────────────────────

  useEffect(() => {
    if (!isInRoom || !isHost || !roomCode || applyingRemoteSync.current) return

    socket.emit('room:host-sync', {
      code: roomCode,
      state: {
        song: currentSong,
        queue,
        currentTime,
        isPlaying,
      },
    })
  }, [currentSong, isPlaying, isInRoom, isHost, roomCode]) // deliberately not including currentTime

  // ── Host: periodic time sync (every 5s to keep guests in sync) ──────────────
  useEffect(() => {
    if (!isInRoom || !isHost || !roomCode) return
    const interval = setInterval(() => {
      socket.emit('room:host-sync', {
        code: roomCode,
        state: { currentTime, isPlaying },
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [isInRoom, isHost, roomCode, currentTime, isPlaying])

  // ── Socket event listeners ──────────────────────────────────────────────────

  useEffect(() => {
    // Room successfully created
    socket.on('room:created', ({ code }: { code: string }) => {
      setRoomCode(code)
      setIsInRoom(true)
      setIsHost(true)
      setIsConnecting(false)
      setMembers([{
        userId: user?.id || '',
        username: user?.username || user?.fullName || 'You',
        avatarUrl: user?.avatarUrl,
        isHost: true,
      }])
      toast.success(`Room created! Code: ${code}`)
    })

    // Received full room state (guest joining)
    socket.on('room:state', ({ code, members: m, state }: {
      code: string
      hostUsername: string
      members: RoomMember[]
      state: RoomState
    }) => {
      setRoomCode(code)
      setIsInRoom(true)
      setIsHost(false)
      setIsConnecting(false)
      setMembers(m)

      // Apply host's current state
      applyingRemoteSync.current = true
      if (state.song) {
        playSong(state.song, state.queue?.length ? state.queue : [state.song])
        // Seek after a short delay to let audio load
        setTimeout(() => {
          seek(state.currentTime || 0)
          if (!state.isPlaying) pause()
          applyingRemoteSync.current = false
        }, 1000)
      } else {
        applyingRemoteSync.current = false
      }
    })

    // Sync event from host (guest receives)
    socket.on('room:sync', ({ state }: { state: RoomState }) => {
      applyingRemoteSync.current = true
      if (state.song) {
        // If song changed, play new song
        playSong(state.song, state.queue?.length ? state.queue : [state.song])
        setTimeout(() => {
          seek(state.currentTime || 0)
          if (state.isPlaying) resume()
          else pause()
          applyingRemoteSync.current = false
        }, 300)
      } else {
        // Just update playback state
        if (state.currentTime !== undefined) seek(state.currentTime)
        if (state.isPlaying !== undefined) {
          state.isPlaying ? resume() : pause()
        }
        applyingRemoteSync.current = false
      }
    })

    // Member update
    socket.on('room:member-update', ({ members: m, joined, left }: {
      members: RoomMember[]
      joined?: { username: string }
      left?: { username: string }
    }) => {
      setMembers(m)
      if (joined) toast(`🎵 ${joined.username} joined the session`, { icon: '👋' })
      if (left) toast(`${left.username} left the session`, { icon: '👋' })
    })

    // Room closed by host
    socket.on('room:closed', ({ reason }: { reason: string }) => {
      toast.error(`Session ended: ${reason}`)
      resetRoom()
    })

    // Host asked to push state
    socket.on('room:push-state', ({ requesterSocketId }: { requesterSocketId: string }) => {
      socket.emit('room:push-state-response', {
        code: roomCodeRef.current,
        state: buildState(),
        requesterSocketId,
      })
    })

    // Errors
    socket.on('room:error', ({ message }: { message: string }) => {
      toast.error(message)
      setIsConnecting(false)
    })

    return () => {
      socket.off('room:created')
      socket.off('room:state')
      socket.off('room:sync')
      socket.off('room:member-update')
      socket.off('room:closed')
      socket.off('room:push-state')
      socket.off('room:error')
    }
  }, [user, playSong, seek, pause, resume, buildState])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const resetRoom = useCallback(() => {
    setIsInRoom(false)
    setRoomCode(null)
    setIsHost(false)
    setMembers([])
    setIsConnecting(false)
    socket.disconnect()
  }, [])

  const createRoom = useCallback(() => {
    if (!user) {
      toast.error('You must be logged in to create a session')
      return
    }
    setIsConnecting(true)
    ensureConnected()

    setTimeout(() => {
      socket.emit('room:create', {
        userId: user.id,
        username: user.username || user.fullName,
        avatarUrl: user.avatarUrl,
        state: buildState(),
      })
    }, 300)
  }, [user, buildState, ensureConnected])

  const joinRoom = useCallback(async (code: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to join a session')
      return false
    }

    return new Promise((resolve) => {
      setIsConnecting(true)
      ensureConnected()

      const upperCode = code.toUpperCase().trim()

      const onState = () => { resolve(true) }
      const onError = () => {
        setIsConnecting(false)
        resolve(false)
      }

      socket.once('room:state', onState)
      socket.once('room:error', onError)

      setTimeout(() => {
        socket.emit('room:join', {
          code: upperCode,
          userId: user.id,
          username: user.username || user.fullName,
          avatarUrl: user.avatarUrl,
        })
      }, 300)

      // Timeout
      setTimeout(() => {
        socket.off('room:state', onState)
        socket.off('room:error', onError)
        if (isConnecting) {
          setIsConnecting(false)
          resolve(false)
        }
      }, 8000)
    })
  }, [user, ensureConnected, isConnecting])

  const leaveRoom = useCallback(() => {
    if (roomCode) {
      socket.emit('room:leave', { code: roomCode })
    }
    resetRoom()
    toast('You left the session', { icon: '👋' })
  }, [roomCode, resetRoom])

  const value: ListenRoomContextValue = {
    isInRoom,
    roomCode,
    isHost,
    members,
    isConnecting,
    createRoom,
    joinRoom,
    leaveRoom,
  }

  return (
    <ListenRoomContext.Provider value={value}>
      {children}
    </ListenRoomContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useListenRoom(): ListenRoomContextValue {
  const ctx = useContext(ListenRoomContext)
  if (!ctx) throw new Error('useListenRoom must be used inside <ListenRoomProvider>')
  return ctx
}
