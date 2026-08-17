import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Music,
  User,
  Disc3,
  Clock,
  Tag,
  Play,
  Image as ImageIcon,
  AlignLeft,
  Hash,
  BarChart2,
  Calendar,
} from 'lucide-react'
import type { Song, ArtistRef, AlbumRef } from '@/types/song.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

// ─── Field row ────────────────────────────────────────────────────────────────

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

// ─── SongDetailModal ──────────────────────────────────────────────────────────

interface SongDetailModalProps {
  song: Song | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (song: Song) => void
}

export function SongDetailModal({ song, isOpen, onClose, onEdit }: SongDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!song) return null

  const artistName =
    typeof song.artistId === 'object'
      ? (song.artistId as ArtistRef).stageName
      : song.artistId

  const albumName =
    song.albumId
      ? typeof song.albumId === 'object'
        ? (song.albumId as AlbumRef).title
        : song.albumId
      : null

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
              maxWidth: 540,
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
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Music size={28} color="#3FD6FF" />
                  )}
                </div>

                {/* Title & artist */}
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
                    {song.title}
                  </h2>
                  <p style={{ fontSize: 13, color: '#3FD6FF', fontWeight: 600, marginBottom: 8 }}>
                    {artistName}
                  </p>
                  {/* Stats pills */}
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
                      <Clock size={10} />
                      {formatDuration(song.duration)}
                    </span>
                    {song.genre && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          height: 24,
                          paddingLeft: 10,
                          paddingRight: 10,
                          borderRadius: 6,
                          background: 'rgba(63,214,255,0.07)',
                          border: '1px solid rgba(63,214,255,0.15)',
                          fontSize: 11,
                          color: '#3FD6FF',
                          fontWeight: 600,
                        }}
                      >
                        <Tag size={10} />
                        {song.genre}
                      </span>
                    )}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        height: 24,
                        paddingLeft: 10,
                        paddingRight: 10,
                        borderRadius: 6,
                        background: 'rgba(247,181,0,0.07)',
                        border: '1px solid rgba(247,181,0,0.15)',
                        fontSize: 11,
                        color: '#F7B500',
                        fontWeight: 600,
                      }}
                    >
                      <BarChart2 size={10} />
                      {formatPlays(song.playCount)} plays
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

              {/* Audio preview (if valid .mp3 / .ogg) */}
              {song.audioUrl && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 11, color: '#444', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Audio Preview
                  </p>
                  <audio
                    controls
                    style={{
                      width: '100%',
                      height: 36,
                      borderRadius: 8,
                      outline: 'none',
                      filter: 'invert(1) hue-rotate(180deg)',
                      opacity: 0.8,
                    }}
                  >
                    <source src={song.audioUrl} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
            </div>

            {/* ── Details ───────────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 0' }}>
              <DetailRow
                icon={<Music size={13} />}
                label="Song ID"
                value={
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
                    {song._id}
                  </span>
                }
              />
              <DetailRow
                icon={<User size={13} />}
                label="Artist"
                value={artistName}
              />
              {albumName && (
                <DetailRow
                  icon={<Disc3 size={13} />}
                  label="Album"
                  value={albumName}
                />
              )}
              <DetailRow
                icon={<Tag size={13} />}
                label="Genre"
                value={song.genre || <span style={{ color: '#444' }}>Not specified</span>}
              />
              <DetailRow
                icon={<Clock size={13} />}
                label="Duration"
                value={`${formatDuration(song.duration)} (${song.duration}s)`}
              />
              <DetailRow
                icon={<BarChart2 size={13} />}
                label="Play Count"
                value={`${formatPlays(song.playCount)} plays`}
              />
              {song.audioUrl && (
                <DetailRow
                  icon={<Play size={13} />}
                  label="Audio URL"
                  value={
                    <a
                      href={song.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#3FD6FF',
                        textDecoration: 'none',
                        fontSize: 12,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                      }}
                    >
                      {song.audioUrl}
                    </a>
                  }
                />
              )}
              {song.coverUrl && (
                <DetailRow
                  icon={<ImageIcon size={13} />}
                  label="Cover URL"
                  value={
                    <a
                      href={song.coverUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#3FD6FF',
                        textDecoration: 'none',
                        fontSize: 12,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {song.coverUrl}
                    </a>
                  }
                />
              )}
              {song.description && (
                <DetailRow
                  icon={<AlignLeft size={13} />}
                  label="Description"
                  value={
                    <pre
                      style={{
                        fontSize: 12,
                        color: '#888',
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: 160,
                        overflowY: 'auto',
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {song.description}
                    </pre>
                  }
                />
              )}
              <DetailRow
                icon={<Calendar size={13} />}
                label="Created"
                value={formatDate(song.createdAt)}
              />
              <DetailRow
                icon={<Hash size={13} />}
                label="Last Updated"
                value={formatDate(song.updatedAt)}
              />
            </div>

            {/* ── Footer actions ────────────────────────────────────── */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
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
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                Close
              </button>
              {onEdit && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onEdit(song); onClose() }}
                  id="btn-detail-edit-song"
                  style={{
                    height: 38,
                    paddingLeft: 18,
                    paddingRight: 18,
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    boxShadow: '0 4px 14px rgba(63,214,255,0.25)',
                  }}
                >
                  Edit Song
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
