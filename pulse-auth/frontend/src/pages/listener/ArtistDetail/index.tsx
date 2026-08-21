import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, User2 } from 'lucide-react'
import { useArtistDetail } from '@/hooks/listener/useArtists'
import { useSongs } from '@/hooks/listener/useSongs'
import { useAlbumsList } from '@/hooks/listener/useAlbums'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { AlbumCard } from '@/components/listener/AlbumCard'
import { SectionHeader } from '@/components/listener/SectionHeader'

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()

  const { data: artist, isLoading: artistLoading } = useArtistDetail(id!)
  const { data: allSongs } = useSongs({ limit: 100, artistId: id })
  const { data: allAlbums } = useAlbumsList({ limit: 50 })

  const artistSongs = allSongs?.data ?? []
  const artistAlbums = (allAlbums?.data ?? []).filter((album) => {
    const aid = typeof album.artistId === 'object' ? (album.artistId as any)._id : album.artistId
    return aid === id
  })

  if (artistLoading) {
    return (
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ height: 240, background: '#111', borderRadius: 16, marginBottom: 24 }} />
      </div>
    )
  }

  if (!artist) return null

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Hero banner */}
      <div style={{
        height: 260,
        background: artist.coverImage
          ? `url(${artist.coverImage}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0d1a2e 0%, #0a0a0a 100%)',
        position: 'relative',
        borderRadius: '0 0 24px 24px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(9,9,9,0.2) 0%, rgba(9,9,9,0.9) 80%, rgba(9,9,9,1) 100%)',
        }} />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', top: 24, left: 24,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 8,
            color: '#ddd', fontSize: 13, cursor: 'pointer', padding: '6px 12px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Artist info */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            background: 'linear-gradient(135deg, #1a2a3a, #0a0a1a)',
            border: '3px solid rgba(63,214,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {artist.avatarUrl ? (
              <img src={artist.avatarUrl} alt={artist.stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User2 size={40} color="#3FD6FF33" />
            )}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3FD6FF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Artist</p>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.04em', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
              {artist.stageName}
            </h1>
            <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
              {artistSongs.length} songs • {artistAlbums.length} albums
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 32px 0' }}>
        {/* Bio */}
        {artist.bio && (
          <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 32, maxWidth: 600 }}>
            {artist.bio}
          </p>
        )}

        {/* Play button */}
        {artistSongs.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
            <button
              onClick={() => playSong(artistSongs[0], artistSongs)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#3FD6FF', border: 'none', borderRadius: 10,
                color: '#000', fontSize: 14, fontWeight: 700, padding: '10px 22px',
                cursor: 'pointer',
              }}
            >
              <Play size={16} fill="#000" /> Play All
            </button>
          </div>
        )}

        {/* Songs */}
        {artistSongs.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="Popular Songs" />
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {artistSongs.map((song, i) => (
                <SongRow key={song._id} song={song} index={i} queue={artistSongs} showAlbum />
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {artistAlbums.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="Albums" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {artistAlbums.map((album, i) => (
                <AlbumCard key={album._id} album={album} delay={i * 0.05} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
