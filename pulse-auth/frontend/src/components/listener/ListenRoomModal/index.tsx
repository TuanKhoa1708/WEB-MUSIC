import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Users, Crown, LogOut, Radio, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useListenRoom } from '@/contexts/ListenRoomContext'
import type { RoomMember } from '@/contexts/ListenRoomContext'
import toast from 'react-hot-toast'

// ─── Member Avatar ────────────────────────────────────────────────────────────

function MemberAvatar({ member }: { member: RoomMember }) {
  const initial = (member.username || '?')[0].toUpperCase()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative' }}>
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.username}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: member.isHost
              ? 'linear-gradient(135deg, #FFB900, #FF6B00)'
              : 'linear-gradient(135deg, #3FD6FF, #2094ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#000',
          }}>
            {initial}
          </div>
        )}
        {member.isHost && (
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#FFB900',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #141414',
          }}>
            <Crown size={8} color="#000" />
          </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8', lineHeight: 1.2 }}>
          {member.username}
        </p>
        <p style={{ fontSize: 11, color: member.isHost ? '#FFB900' : '#555', marginTop: 1 }}>
          {member.isHost ? 'Host · Controls playback' : 'Listener'}
        </p>
      </div>
    </div>
  )
}

// ─── ListenRoomModal ──────────────────────────────────────────────────────────

interface ListenRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ListenRoomModal({ isOpen, onClose }: ListenRoomModalProps) {
  const { roomCode, members, isHost, leaveRoom } = useListenRoom()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  if (!roomCode) return null

  const shareUrl = `${window.location.origin}/listener/room/join?code=${roomCode}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      toast.success('Room code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied!')
    } catch {
      toast.error('Could not copy link')
    }
  }

  const handleLeave = () => {
    leaveRoom()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 420,
              background: '#111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(63,214,255,0.06), rgba(32,148,255,0.04))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(63,214,255,0.2), rgba(32,148,255,0.1))',
                  border: '1px solid rgba(63,214,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Radio size={18} color="#3FD6FF" />
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                    Live Listening Session
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                      animation: 'pulse 2s infinite',
                    }} />
                    <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>LIVE</span>
                    <span style={{ fontSize: 11, color: '#555' }}>·</span>
                    <Users size={10} color="#555" />
                    <span style={{ fontSize: 11, color: '#555' }}>{members.length} listener{members.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)', color: '#555', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Room Code */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Room Code
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px',
                  background: 'rgba(63,214,255,0.04)',
                  border: '1px solid rgba(63,214,255,0.2)',
                  borderRadius: 14,
                }}>
                  <span style={{
                    flex: 1,
                    fontSize: 28, fontWeight: 900, color: '#3FD6FF',
                    letterSpacing: '0.2em', fontFamily: 'monospace',
                  }}>
                    {roomCode}
                  </span>
                  <button
                    onClick={copyCode}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10,
                      background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(63,214,255,0.12)',
                      border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(63,214,255,0.25)'}`,
                      color: copied ? '#4ade80' : '#3FD6FF',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share link + QR toggle */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={copyLink}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#aaa', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <Copy size={13} /> Copy Share Link
                </button>
                <button
                  onClick={() => setShowQR(v => !v)}
                  style={{
                    padding: '10px 14px', borderRadius: 10,
                    border: `1px solid ${showQR ? 'rgba(63,214,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    background: showQR ? 'rgba(63,214,255,0.1)' : 'rgba(255,255,255,0.04)',
                    color: showQR ? '#3FD6FF' : '#aaa',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  <QrCode size={14} /> QR
                </button>
              </div>

              {/* QR Code */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      padding: 16,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14,
                    }}>
                      <div style={{ padding: 12, background: '#fff', borderRadius: 10 }}>
                        <QRCodeSVG value={shareUrl} size={140} />
                      </div>
                      <p style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>
                        Scan to join the session
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  In this session
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {members.map((m) => (
                    <MemberAvatar key={m.userId} member={m} />
                  ))}
                  {members.length === 1 && (
                    <p style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>
                      Share the code above to invite others...
                    </p>
                  )}
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={handleLeave}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 12,
                  border: '1px solid rgba(255,91,91,0.2)',
                  background: 'rgba(255,91,91,0.08)',
                  color: '#FF5B5B', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,91,91,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,91,91,0.08)' }}
              >
                <LogOut size={14} />
                {isHost ? 'End Session for Everyone' : 'Leave Session'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
