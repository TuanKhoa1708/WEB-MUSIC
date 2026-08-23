import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle, ListMusic } from 'lucide-react'
import { usePlaylistDetail, usePlaylistSongs } from '@/hooks/listener/usePlaylists'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import type { Song } from '@/types/song.types'
import type { PlaylistSong } from '@/types/playlist.types'

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()

  const { data: playlist, isLoading: playlistLoading } = usePlaylistDetail(id!)
  const { data: playlistSongs, isLoading: songsLoading } = usePlaylistSongs(id!)

  const songs: Song[] = (playlistSongs ?? [])
    .map((ps: PlaylistSong) => (typeof ps.songId === 'object' ? ps.songId as unknown as Song : null))
    .filter(Boolean) as Song[]



  if (playlistLoading) {
    return (
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ height: 180, background: '#111', borderRadius: 16, marginBottom: 24 }} />
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (!playlist) return null

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 1000, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 36 }}>
        {/* Cover */}
        <div style={{
          width: 160, height: 160, borderRadius: 16, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(63,214,255,0.08), rgba(32,148,255,0.04))',
          border: '1px solid rgba(63,214,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ListMusic size={52} color="#3FD6FF22" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Playlist</p>

          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.04em' }}>
            {playlist.title}
          </h1>

          <p style={{ fontSize: 13, color: '#555', margin: '0 0 16px' }}>
            {songs.length} songs
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {songs.length > 0 && (
              <>
                <button
                  onClick={() => playSong(songs[0], songs)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#3FD6FF', border: 'none', borderRadius: 10,
                    color: '#000', fontSize: 13, fontWeight: 700, padding: '9px 18px', cursor: 'pointer',
                  }}
                >
                  <Play size={15} fill="#000" /> Play
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...songs].sort(() => Math.random() - 0.5)
                    playSong(shuffled[0], shuffled)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#ddd', fontSize: 13, fontWeight: 600,
                    padding: '9px 18px', cursor: 'pointer',
                  }}
                >
                  <Shuffle size={14} /> Shuffle
                </button>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Songs */}
      {songsLoading ? (
        <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : songs.length === 0 ? (
        <EmptyState icon={<ListMusic size={48} />} title="This playlist is empty" description="Search for songs and add them to this playlist." />
      ) : (
        <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {(playlistSongs ?? []).map((ps: PlaylistSong, i: number) => {
            const song = typeof ps.songId === 'object' ? ps.songId as unknown as Song : null
            if (!song) return null
            return (
              <div key={ps._id} style={{ display: 'grid', gridTemplateColumns: '1fr 32px', alignItems: 'center' }}>
                <SongRow song={song} index={i} queue={songs} />

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
