import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle, ListMusic, Pencil, Trash2, Check, X } from 'lucide-react'
import { usePlaylistDetail, usePlaylistSongs, useUpdatePlaylist, useDeletePlaylist, useRemoveSongFromPlaylist } from '@/hooks/listener/usePlaylists'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useAuth } from '@/contexts/AuthContext'
import { SongRow } from '@/components/listener/SongRow'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import type { Song } from '@/types/song.types'
import type { PlaylistSong } from '@/types/playlist.types'

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { playSong } = useMusicPlayer()

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  const { data: playlist, isLoading: playlistLoading } = usePlaylistDetail(id!)
  const { data: playlistSongs, isLoading: songsLoading } = usePlaylistSongs(id!)
  const updatePlaylist = useUpdatePlaylist()
  const deletePlaylist = useDeletePlaylist()
  const removeSong = useRemoveSongFromPlaylist()

  const songs: Song[] = (playlistSongs ?? [])
    .map((ps: PlaylistSong) => (typeof ps.songId === 'object' ? ps.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  const isOwner = () => {
    if (!user || !playlist) return false
    const uid = typeof playlist.userId === 'object' ? (playlist.userId as any)._id : playlist.userId
    return uid === user.id
  }

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return
    await deletePlaylist.mutateAsync(id!)
    navigate('/listener/library')
  }

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || !id) return
    await updatePlaylist.mutateAsync({ _id: id, title: editTitle.trim() })
    setEditing(false)
  }

  const startEdit = () => {
    setEditTitle(playlist?.title ?? '')
    setEditing(true)
  }

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

          {/* Editable title */}
          {editing ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle() }}
                style={{
                  background: '#1a1a1a', border: '1px solid rgba(63,214,255,0.3)',
                  borderRadius: 8, color: '#fff', fontSize: 28, fontWeight: 900,
                  padding: '4px 10px', outline: 'none', letterSpacing: '-0.03em',
                }}
              />
              <button onClick={handleSaveTitle} style={{ background: 'rgba(63,214,255,0.1)', border: 'none', borderRadius: 8, color: '#3FD6FF', cursor: 'pointer', padding: '6px 10px' }}>
                <Check size={16} />
              </button>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.04em' }}>
              {playlist.title}
            </h1>
          )}

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
            {isOwner() && (
              <>
                <button
                  onClick={startEdit}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#888', cursor: 'pointer', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', cursor: 'pointer', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <Trash2 size={13} /> Delete
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
                {isOwner() && (
                  <button
                    onClick={() => removeSong.mutate({ playlistSongId: ps._id, playlistId: id! })}
                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', marginRight: 12 }}
                    title="Remove"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
