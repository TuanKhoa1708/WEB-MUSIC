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
    <div style={{ padding: 'clamp(16px, 3vw, 28px)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: '#3FD6FF' }}>
              <Heart size={32} fill="#3FD6FF" />
            </div>
            <h1
              className="text-2xl md:text-3xl lg:text-[32px]"
              style={{ fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}
            >
              Liked Songs
            </h1>
          </div>
          <p style={{ fontSize: 15, color: '#555', margin: '8px 0 0' }}>
            {songs.length} songs
          </p>
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
