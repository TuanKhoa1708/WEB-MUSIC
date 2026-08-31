import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Radio, LogIn, Loader2, Music2, Crown } from 'lucide-react'
import { useListenRoom } from '@/contexts/ListenRoomContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export function JoinListenRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { joinRoom, isConnecting, isInRoom, roomCode } = useListenRoom()
  const { user } = useAuth()

  const [code, setCode] = useState(searchParams.get('code') || '')
  const [isJoining, setIsJoining] = useState(false)

  // Auto-join if code is in URL
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode && !isInRoom) {
      handleJoin(urlCode)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to home once joined
  useEffect(() => {
    if (isInRoom && roomCode) {
      toast.success('Joined the session! 🎵')
      navigate('/listener/home')
    }
  }, [isInRoom, roomCode, navigate])

  const handleJoin = async (joinCode?: string) => {
    const targetCode = (joinCode || code).toUpperCase().trim()
    if (!targetCode || targetCode.length !== 6) {
      toast.error('Please enter a valid 6-character room code')
      return
    }
    setIsJoining(true)
    const success = await joinRoom(targetCode)
    if (!success) {
      toast.error('Could not join room. The code may be invalid or the session has ended.')
    }
    setIsJoining(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #080808 0%, #0d0d12 50%, #08080f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(63,214,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative' }}
      >
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}>
          {/* Top gradient stripe */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, #3FD6FF, #2094ff, #9B59FF)',
          }} />

          <div style={{ padding: '36px 32px' }}>
            {/* Icon + title */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
                background: 'linear-gradient(135deg, rgba(63,214,255,0.15), rgba(32,148,255,0.08))',
                border: '1px solid rgba(63,214,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Radio size={28} color="#3FD6FF" />
              </div>
              <h1 style={{
                fontSize: 24, fontWeight: 900, color: '#fff',
                letterSpacing: '-0.03em', marginBottom: 8,
              }}>
                Join Listening Session
              </h1>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>
                Enter the room code to listen together in real-time
              </p>
            </div>

            {/* User info */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: 24,
              }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#000',
                  }}>
                    {(user.username || user.fullName)[0].toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8' }}>
                    {user.username || user.fullName}
                  </p>
                  <p style={{ fontSize: 11, color: '#444' }}>Joining as listener</p>
                </div>
                <Music2 size={14} color="#3FD6FF" />
              </div>
            )}

            {/* Code input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700, color: '#555',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                Room Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="e.g. AB12CD"
                maxLength={6}
                autoFocus
                style={{
                  width: '100%', height: 52, padding: '0 16px',
                  borderRadius: 14,
                  background: 'rgba(63,214,255,0.04)',
                  border: '1px solid rgba(63,214,255,0.2)',
                  color: '#3FD6FF',
                  fontSize: 24, fontWeight: 900, letterSpacing: '0.2em',
                  fontFamily: 'monospace', textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(63,214,255,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(63,214,255,0.2)'}
              />
            </div>

            {/* Join button */}
            <button
              onClick={() => handleJoin()}
              disabled={isJoining || isConnecting || code.length !== 6}
              style={{
                width: '100%', height: 50, borderRadius: 14, border: 'none',
                background: code.length === 6
                  ? 'linear-gradient(135deg, #3FD6FF, #2094ff)'
                  : 'rgba(255,255,255,0.06)',
                color: code.length === 6 ? '#000' : '#444',
                fontSize: 15, fontWeight: 800,
                cursor: code.length === 6 ? 'pointer' : 'not-allowed',
                opacity: (isJoining || isConnecting) ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: code.length === 6 ? '0 8px 32px rgba(63,214,255,0.25)' : 'none',
              }}
            >
              {isJoining || isConnecting ? (
                <><Loader2 size={18} className="animate-spin" /> Joining...</>
              ) : (
                <><LogIn size={18} /> Join Session</>
              )}
            </button>

            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '100%', marginTop: 12, padding: '10px 0',
                background: 'none', border: 'none',
                color: '#444', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#888'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
            >
              ← Go back
            </button>
          </div>
        </div>

        {/* Premium note */}
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Crown size={12} color="#FFB900" />
          <p style={{ fontSize: 12, color: '#444' }}>
            Session sharing is a <span style={{ color: '#FFB900', fontWeight: 700 }}>Premium</span> feature
          </p>
        </div>
      </motion.div>
    </div>
  )
}
