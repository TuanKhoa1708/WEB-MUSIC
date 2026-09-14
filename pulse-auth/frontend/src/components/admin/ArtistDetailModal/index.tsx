import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Mail,
  Calendar,
  Hash,
  Activity,
  CheckCircle,
  Globe,
} from 'lucide-react'
import type { Artist } from '@/types/artist.types'

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

interface ArtistDetailModalProps {
  artist: Artist | null
  isOpen: boolean
  onClose: () => void
}

export function ArtistDetailModal({ artist, isOpen, onClose }: ArtistDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!artist) return null

  // Ensure social links are accessible even if nested
  const facebook = artist.socialLinks?.facebook || (artist as any).facebook
  const instagram = artist.socialLinks?.instagram || (artist as any).instagram
  const youtube = artist.socialLinks?.youtube || (artist as any).youtube
  
  const hasSocials = !!(facebook || instagram || youtube)

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
                background: 'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(139,92,246,0.03) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'rgba(167,139,250,0.06)',
                    border: '1px solid rgba(167,139,250,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.stageName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <User size={28} color="#A78BFA" />
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
                    {artist.stageName}
                  </h2>
                  <p style={{ fontSize: 13, color: '#A78BFA', fontWeight: 600, marginBottom: 8 }}>
                    Artist Profile
                  </p>
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
                label="Artist ID"
                value={<span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>{artist._id}</span>}
              />
              
              {/* Note: In a real app we might populate user email, but if not available we skip */}
              {artist.bio && (
                <DetailRow
                  icon={<User size={13} />}
                  label="Biography"
                  value={
                    <pre
                      style={{
                        fontSize: 12,
                        color: '#888',
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {artist.bio}
                    </pre>
                  }
                />
              )}

              {hasSocials && (
                <DetailRow
                  icon={<Globe size={13} />}
                  label="Social Links"
                  value={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {facebook && (
                        <a href={facebook} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b5998', textDecoration: 'none', fontSize: 12 }}>
                          <Globe size={12} /> {facebook}
                        </a>
                      )}
                      {instagram && (
                        <a href={instagram} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e1306c', textDecoration: 'none', fontSize: 12 }}>
                          <Globe size={12} /> {instagram}
                        </a>
                      )}
                      {youtube && (
                        <a href={youtube} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff0000', textDecoration: 'none', fontSize: 12 }}>
                          <Globe size={12} /> {youtube}
                        </a>
                      )}
                    </div>
                  }
                />
              )}

              <DetailRow
                icon={<Calendar size={13} />}
                label="Joined Date"
                value={formatDate(artist.createdAt)}
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
