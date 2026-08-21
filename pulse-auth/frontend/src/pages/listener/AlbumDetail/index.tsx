import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle, Disc3 } from 'lucide-react'
import { useAlbumDetail } from '@/hooks/listener/useAlbums'
import { useSongs } from '@/hooks/listener/useSongs'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import type { Song } from '@/types/song.types'

function getTotalDuration(songs: Song[]): string {
  const total = songs.reduce((acc, s) => acc + (s.duration || 0), 0)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()

  const { data: album, isLoading: albumLoading } = useAlbumDetail(id!)
  // Fetch songs for this album
  const { data: songsData, isLoading: songsLoading } = useSongs({ limit: 100 })

  // Filter songs by albumId (since backend /albums/:id .populate('songs') needs Song.albumId field)
  const albumSongs = (songsData?.data ?? []).filter((song) => {
    if (typeof song.albumId === 'object' && song.albumId !== null) {
      return (song.albumId as any)._id === id
    }
    return song.albumId === id
  })

  const handlePlayAll = () => {
    if (albumSongs.length > 0) playSong(albumSongs[0], albumSongs)
  }

  const handleShuffle = () => {
    if (albumSongs.length > 0) {
      const shuffled = [...albumSongs].sort(() => Math.random() - 0.5)
      playSong(shuffled[0], shuffled)
    }
  }

  if (albumLoading) {
    return (
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ height: 200, background: '#111', borderRadius: 16, marginBottom: 24 }} />
        {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (!album) {
    return <EmptyState icon={<Disc3 size={48} />} title="Album not found" />
  }

  const artistName = album.artistId
    ? typeof album.artistId === 'object' ? (album.artistId as any).stageName : 'Unknown Artist'
    : 'Unknown Artist'

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 1000, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#666',
          fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Album header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 36 }}>
        {/* Cover */}
        <div style={{
          width: 180, height: 180,
          borderRadius: 16,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
              <Disc3 size={60} />
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Album</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.04em' }}>
            {album.title}
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#555', fontSize: 13 }}>
            <span style={{ color: '#ddd', fontWeight: 600 }}>{artistName}</span>
            {album.releaseYear && <><span>•</span><span>{album.releaseYear}</span></>}
            {albumSongs.length > 0 && (
              <><span>•</span><span>{albumSongs.length} songs, {getTotalDuration(albumSongs)}</span></>
            )}
          </div>

          {/* Buttons */}
          {albumSongs.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={handlePlayAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#3FD6FF', border: 'none', borderRadius: 10,
                  color: '#000', fontSize: 14, fontWeight: 700, padding: '10px 22px',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#5de0ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#3FD6FF')}
              >
                <Play size={16} fill="#000" /> Play
              </button>
              <button
                onClick={handleShuffle}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, color: '#ddd', fontSize: 14, fontWeight: 600,
                  padding: '10px 22px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <Shuffle size={15} /> Shuffle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Songs */}
      {songsLoading ? (
        <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : albumSongs.length === 0 ? (
        <EmptyState icon={<Disc3 size={48} />} title="No songs in this album yet" />
      ) : (
        <>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 80px 60px 32px',
            gap: 12, padding: '0 12px 8px',
            borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 4,
          }}>
            <span style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>#</span>
            <span style={{ fontSize: 11, color: '#444' }}>Title</span>
            <span style={{ fontSize: 11, color: '#444', textAlign: 'right' }}>Duration</span>
            <span />
            <span />
          </div>
          <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {albumSongs.map((song, i) => (
              <SongRow key={song._id} song={song} index={i} queue={albumSongs} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
