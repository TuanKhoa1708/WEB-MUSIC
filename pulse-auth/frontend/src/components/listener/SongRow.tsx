import { useState } from 'react'
import { Play, Pause, Music2, ListPlus, Download, Lock } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { PremiumUpgradeModal, usePremiumModal } from '@/components/premium/PremiumUpgradeModal'
import { useIsPremium } from '@/hooks/listener/useSubscription'
import type { Song } from '@/types/song.types'

interface SongRowProps {
  song: Song
  index?: number
  queue?: Song[]
  showAlbum?: boolean
  onAddToPlaylist?: (song: Song) => void
  /** If true, this song is Premium-only — clicking it opens upgrade modal */
  locked?: boolean
}

function formatDuration(s: number): string {
  if (!s) return '--:--'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function getArtistName(song: Song): string {
  if (!song.artistId) return 'Unknown Artist'
  if (typeof song.artistId === 'object') return song.artistId.stageName
  return 'Unknown Artist'
}

function getAlbumName(song: Song): string {
  if (!song.albumId) return '—'
  if (typeof song.albumId === 'object' && song.albumId !== null) return (song.albumId as any).title
  return '—'
}

export function SongRow({ song, index, queue, showAlbum = false, onAddToPlaylist, locked = false }: SongRowProps) {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer()
  const isPremium = useIsPremium()
  const { isOpen: modalOpen, config: modalConfig, openModal, closeModal } = usePremiumModal()
  const isCurrent = currentSong?._id === song._id
  const [hovered, setHovered] = useState(false)

  const handlePlay = () => {
    if (locked) {
      openModal(
        'Full Playlist Access',
        'Upgrade to Premium to listen to all songs in this playlist or album without limits.'
      )
      return
    }
    if (isCurrent) {
      togglePlay()
    } else {
      playSong(song, queue ?? [song])
    }
  }

  const handleDownload = () => {
    if (!isPremium) {
      openModal(
        'Download Songs',
        'Save music for offline listening — exclusively for Premium members.'
      )
      return
    }
    // In a real app, trigger download here
    window.open(song.audioUrl, '_blank')
  }

  return (
    <>
      <PremiumUpgradeModal
        isOpen={modalOpen}
        onClose={closeModal}
        feature={modalConfig.feature}
        description={modalConfig.description}
      />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: showAlbum ? '40px 1fr 1fr 80px 60px 32px 32px' : '40px 1fr 80px 60px 32px 32px',
          alignItems: 'center',
          gap: 12,
          padding: '6px 12px',
          borderRadius: 8,
          background: locked
            ? 'transparent'
            : isCurrent
            ? 'rgba(63,214,255,0.05)'
            : hovered
            ? 'rgba(255,255,255,0.03)'
            : 'transparent',
          transition: 'background 0.15s',
          cursor: locked ? 'default' : 'default',
          opacity: locked ? 0.55 : 1,
        }}
      >
        {/* Index / Play */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
          {locked ? (
            <button
              onClick={handlePlay}
              title="Premium only"
              style={{ background: 'none', border: 'none', color: '#FFB900', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <Lock size={14} />
            </button>
          ) : hovered || isCurrent ? (
            <button
              onClick={handlePlay}
              style={{ background: 'none', border: 'none', color: isCurrent ? '#3FD6FF' : '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
          ) : (
            <span style={{ fontSize: 13, color: '#555', textAlign: 'center' }}>
              {index !== undefined ? index + 1 : null}
            </span>
          )}
        </div>

        {/* Title + artist */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, cursor: locked ? 'pointer' : 'pointer' }} onClick={handlePlay}>
          <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a', position: 'relative' }}>
            {song.coverUrl ? (
              <img src={song.coverUrl} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                <Music2 size={14} />
              </div>
            )}
            {/* Lock overlay on cover for locked songs */}
            {locked && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={12} color="#FFB900" />
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: locked ? '#666' : isCurrent ? '#3FD6FF' : '#ddd', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {song.title}
              {locked && (
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#FFB900', background: 'rgba(255,185,0,0.12)', border: '1px solid rgba(255,185,0,0.25)', borderRadius: 4, padding: '1px 5px', verticalAlign: 'middle' }}>
                  PREMIUM
                </span>
              )}
            </p>
            <p style={{ fontSize: 12, color: '#555', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getArtistName(song)}
            </p>
          </div>
        </div>

        {/* Album */}
        {showAlbum && (
          <p style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {getAlbumName(song)}
          </p>
        )}

        {/* Duration */}
        <p style={{ fontSize: 12, color: '#555', textAlign: 'right' }}>
          {formatDuration(song.duration)}
        </p>

        {/* Favorite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
          {!locked && <FavoriteButton song={song} size={14} />}
        </div>

        {/* Download (Premium only) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload() }}
            title={isPremium ? 'Download song' : 'Download — Premium only'}
            style={{
              background: 'none',
              border: 'none',
              color: hovered ? (isPremium ? '#3FD6FF' : '#FFB900') : 'transparent',
              cursor: 'pointer',
              padding: 3,
              transition: 'color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              position: 'relative',
            }}
          >
            <Download size={13} />
            {!isPremium && hovered && (
              <Lock size={8} style={{ position: 'absolute', bottom: 2, right: 1, color: '#FFB900' }} />
            )}
          </button>
        </div>

        {/* Add to playlist */}
        {onAddToPlaylist && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song) }}
              title="Add to playlist"
              style={{
                background: 'none', border: 'none',
                color: hovered ? '#555' : 'transparent',
                cursor: 'pointer', padding: 3, transition: 'color 0.15s',
              }}
            >
              <ListPlus size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
