import { useState } from 'react'
import { Heart, Music2, ListMusic, Plus, X, Check } from 'lucide-react'
import { useFavoriteContext } from '@/contexts/FavoriteContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePlaylistsList, useCreatePlaylist } from '@/hooks/listener/usePlaylists'
import { useHistory } from '@/hooks/listener/useHistory'
import { SongRow } from '@/components/listener/SongRow'
import { PlaylistCard } from '@/components/listener/PlaylistCard'
import { SectionHeader } from '@/components/listener/SectionHeader'
import { EmptyState } from '@/components/listener/EmptyState'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import type { Song } from '@/types/song.types'
import type { History } from '@/types/history.types'
type Tab = 'playlists' | 'favorites' | 'history'

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('playlists')
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')

  const { user } = useAuth()
  const { favorites, isLoading: favLoading } = useFavoriteContext()

  // Playlists — filter by current user
  const { data: playlistsData, isLoading: playlistsLoading } = usePlaylistsList({ limit: 50 })
  const userPlaylists = (playlistsData?.data ?? []).filter((pl) => {
    const uid = typeof pl.userId === 'object' ? (pl.userId as any)._id : pl.userId
    return uid === user?.id
  })

  const { data: historyData, isLoading: historyLoading } = useHistory(20)
  const historyItems = historyData?.data ?? []

  const createPlaylist = useCreatePlaylist()

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim() || !user?.id) return
    await createPlaylist.mutateAsync({
      title: newPlaylistTitle.trim(),
      userId: user.id,
      isPublic: false,
    })
    setNewPlaylistTitle('')
    setShowCreatePlaylist(false)
  }

  // Favorite songs
  const favSongs: Song[] = favorites
    .map((f) => (typeof f.songId === 'object' ? f.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  // History songs
  const historySongs: Song[] = historyItems
    .map((h: History) => (typeof h.songId === 'object' ? h.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
          My Library
        </h1>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: '#111', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['playlists', 'favorites', 'history'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 16px',
                borderRadius: 9,
                border: 'none',
                background: activeTab === tab ? 'rgba(63,214,255,0.12)' : 'transparent',
                color: activeTab === tab ? '#3FD6FF' : '#666',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'playlists' && (
        <section>
          <SectionHeader
            title="Playlists"
            action={
              <button
                onClick={() => setShowCreatePlaylist(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(63,214,255,0.1)',
                  border: '1px solid rgba(63,214,255,0.2)',
                  borderRadius: 8, color: '#3FD6FF', fontSize: 12, fontWeight: 600,
                  padding: '5px 12px', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(63,214,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(63,214,255,0.1)')}
              >
                <Plus size={13} /> New Playlist
              </button>
            }
          />

          {/* Create playlist form */}
          {showCreatePlaylist && (
            <div style={{
              background: '#111', borderRadius: 12, padding: 16, marginBottom: 20,
              border: '1px solid rgba(63,214,255,0.15)',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <input
                autoFocus
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePlaylist() }}
                style={{
                  flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, color: '#fff', fontSize: 14, padding: '8px 12px', outline: 'none',
                }}
              />
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistTitle.trim() || createPlaylist.isPending}
                style={{
                  background: '#3FD6FF', border: 'none', borderRadius: 8, color: '#000',
                  fontSize: 13, fontWeight: 700, padding: '8px 14px', cursor: 'pointer',
                }}
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setShowCreatePlaylist(false); setNewPlaylistTitle('') }}
                style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 }}
              >
                <X size={15} />
              </button>
            </div>
          )}

          {playlistsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 200, background: '#111', borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : userPlaylists.length === 0 ? (
            <EmptyState
              icon={<ListMusic size={48} />}
              title="No playlists yet"
              description="Create a playlist to start organizing your music."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {userPlaylists.map((pl, i) => (
                <PlaylistCard key={pl._id} playlist={pl} delay={i * 0.05} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'favorites' && (
        <section>
          <SectionHeader
            title="Favorite Songs"
            subtitle={`${favSongs.length} songs`}
            seeAllLink="/listener/favorites"
          />
          {favLoading ? (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : favSongs.length === 0 ? (
            <EmptyState
              icon={<Heart size={48} />}
              title="No favorites yet"
              description="Heart songs you love to see them here."
            />
          ) : (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {favSongs.map((song, i) => (
                <SongRow key={song._id} song={song} index={i} queue={favSongs} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section>
          <SectionHeader
            title="Recently Played"
            subtitle={`${historySongs.length} tracks`}
            seeAllLink="/listener/history"
          />
          {historyLoading ? (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : historySongs.length === 0 ? (
            <EmptyState
              icon={<Music2 size={48} />}
              title="No history yet"
              description="Start listening to music — your history will appear here."
            />
          ) : (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {historySongs.map((song, i) => (
                <SongRow key={`${song._id}-${i}`} song={song} index={i} queue={historySongs} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
