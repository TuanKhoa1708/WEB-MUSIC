import { useState } from 'react'
import { Play, Pause, Music2, ListPlus } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import type { Song } from '@/types/song.types'

interface SongRowProps {
  song: Song
  index?: number
  queue?: Song[]
  showAlbum?: boolean
  onAddToPlaylist?: (song: Song) => void
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

export function SongRow({ song, index, queue, showAlbum = false, onAddToPlaylist }: SongRowProps) {
  const { playSong, currentSong, isPlaying, togglePlay } = useMusicPlayer()
  const isCurrent = currentSong?._id === song._id
  const [hovered, setHovered] = useState(false)

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playSong(song, queue ?? [song])
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: showAlbum ? '40px 1fr 1fr 80px 60px 32px' : '40px 1fr 80px 60px 32px',
        alignItems: 'center',
        gap: 12,
        padding: '6px 12px',
        borderRadius: 8,
        background: isCurrent ? 'rgba(63,214,255,0.05)' : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        transition: 'background 0.15s',
        cursor: 'default',
      }}
    >
      {/* Index / Play */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
        {hovered || isCurrent ? (
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, cursor: 'pointer' }} onClick={handlePlay}>
        <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
          {song.coverUrl ? (
            <img src={song.coverUrl} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
              <Music2 size={14} />
            </div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: isCurrent ? '#3FD6FF' : '#ddd', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {song.title}
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

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
        <FavoriteButton song={song} size={14} />
      </div>

      {/* Add to playlist */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {onAddToPlaylist && (
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
        )}
      </div>
    </div>
  )
}
