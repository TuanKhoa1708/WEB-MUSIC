import { Heart, Play, Shuffle } from 'lucide-react'
import { useFavoriteContext } from '@/contexts/FavoriteContext'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { EmptyState } from '@/components/listener/EmptyState'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import type { Song } from '@/types/song.types'
import { useNavigate } from 'react-router-dom'

export function FavoriteSongsPage() {
  const { favorites, isLoading } = useFavoriteContext()
  const { playSong } = useMusicPlayer()
  const navigate = useNavigate()

  const songs: Song[] = favorites
    .map((f) => (typeof f.songId === 'object' ? f.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  const handlePlayAll = () => {
    if (songs.length > 0) playSong(songs[0], songs)
  }

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5)
      playSong(shuffled[0], shuffled)
    }
  }

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Icon */}
          <div style={{
            width: 120, height: 120, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(63,214,255,0.15), rgba(32,148,255,0.08))',
            border: '1px solid rgba(63,214,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Heart size={52} color="#3FD6FF" fill="rgba(63,214,255,0.2)" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Playlist</p>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.04em' }}>
              Liked Songs
            </h1>
            <p style={{ fontSize: 14, color: '#555', margin: 0 }}>
              {songs.length} songs
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {songs.length > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleShuffle}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, color: '#ddd', fontSize: 13, fontWeight: 600,
                padding: '9px 18px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <Shuffle size={15} /> Shuffle
            </button>
            <button
              onClick={handlePlayAll}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#3FD6FF',
                border: 'none',
                borderRadius: 10, color: '#000', fontSize: 13, fontWeight: 700,
                padding: '9px 18px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5de0ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#3FD6FF')}
            >
              <Play size={15} fill="#000" /> Play all
            </button>
          </div>
        )}
      </div>

      {/* Songs list */}
      {isLoading ? (
        <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon={<Heart size={56} />}
          title="Songs you like will appear here"
          description="Save songs by tapping the heart icon."
          action={
            <button
              onClick={() => navigate('/listener/search')}
              style={{
                background: '#3FD6FF', border: 'none', borderRadius: 10,
                color: '#000', fontSize: 13, fontWeight: 700, padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              Find music
            </button>
          }
        />
      ) : (
        <>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 60px 32px', gap: 12, padding: '0 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>#</div>
            <div style={{ fontSize: 11, color: '#444' }}>Title</div>
            <div style={{ fontSize: 11, color: '#444', textAlign: 'right' }}>Duration</div>
            <div />
            <div />
          </div>
          <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {songs.map((song, i) => (
              <SongRow key={song._id} song={song} index={i} queue={songs} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
