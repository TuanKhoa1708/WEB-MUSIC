import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Disc3,
  User,
  Calendar,
  Hash,
} from 'lucide-react'
import type { Album } from '@/types/album.types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '13px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#555',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>
          {label}
        </p>
        <div style={{ fontSize: 13, color: '#ccc', fontWeight: 500, wordBreak: 'break-word' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

interface AlbumDetailModalProps {
  album: Album | null
  isOpen: boolean
  onClose: () => void
}

export function AlbumDetailModal({ album, isOpen, onClose }: AlbumDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!album) return null

  const artistName = (typeof album.artistId === 'object' && album.artistId) 
    ? album.artistId.stageName || 'Unknown Artist' 
    : 'Unknown Artist'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              maxWidth: 500,
              maxHeight: 'calc(100vh - 48px)',
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* ── Hero Section ─────────────────────────────────────── */}
            <div
              style={{
                position: 'relative',
                padding: '24px 24px 20px',
                background: 'linear-gradient(135deg, rgba(63,214,255,0.06) 0%, rgba(32,148,255,0.03) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Cover art */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'rgba(63,214,255,0.06)',
                    border: '1px solid rgba(63,214,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Disc3 size={28} color="#3FD6FF" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {album.title}
                  </h2>
                  <p style={{ fontSize: 13, color: '#3FD6FF', fontWeight: 600, marginBottom: 8 }}>
                    {artistName}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        height: 24,
                        paddingLeft: 10,
                        paddingRight: 10,
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        fontSize: 11,
                        color: '#888',
                        fontWeight: 600,
                      }}
                    >
                      {new Date(album.releaseDate).getFullYear()}
                    </span>
                  </div>
                </div>

                {/* Close btn */}
                <button
                  onClick={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#555',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#555'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── Details ───────────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 0' }}>
              <DetailRow
                icon={<Hash size={13} />}
                label="Album ID"
                value={<span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>{album._id}</span>}
              />
              <DetailRow
                icon={<User size={13} />}
                label="Artist"
                value={artistName}
              />
              <DetailRow
                icon={<Calendar size={13} />}
                label="Release Date"
                value={formatDate(album.releaseDate)}
              />
              <DetailRow
                icon={<Calendar size={13} />}
                label="Created Date"
                value={formatDate(album.createdAt)}
              />
              <DetailRow
                icon={<Hash size={13} />}
                label="Last Updated"
                value={formatDate(album.updatedAt)}
              />
            </div>

            {/* ── Footer ───────────────────────────────────────────── */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  height: 38,
                  paddingLeft: 18,
                  paddingRight: 18,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'transparent',
                  color: '#666',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
