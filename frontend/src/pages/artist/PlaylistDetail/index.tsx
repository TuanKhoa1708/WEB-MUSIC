import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListMusic,
  ArrowLeft,
  Clock,
  Plus,
  Trash2,
  Music,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import { 
  usePlaylistById, 
} from '@/hooks/artist/usePlaylists'
import { 
  usePlaylistSongs, 
  useAddSongToPlaylist, 
  useRemoveSongFromPlaylist 
} from '@/hooks/artist/usePlaylistSongs'
import { useSongs } from '@/hooks/artist/useSongs'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { Song } from '@/types/song.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function SongCover({ title, coverUrl }: { title: string; coverUrl?: string }) {
  const initials = title
    ? title.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '♪'

  const colors = ['#3FD6FF', '#A78BFA', '#F7B500', '#3DDC84', '#FB923C', '#FF5B5B']
  const color = title ? colors[title.charCodeAt(0) % colors.length] : '#3FD6FF'

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: coverUrl ? 'transparent' : `${color}14`,
        border: `1px solid ${color}28`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontSize: 13, fontWeight: 800, color, letterSpacing: '-0.01em' }}>
          {initials}
        </span>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Queries
  const { data: playlist, isLoading: isLoadingPlaylist } = usePlaylistById(id!)
  const { data: songsData, isLoading: isLoadingSongs } = usePlaylistSongs(id!)
  
  // Mutations
  const { mutateAsync: removeSong, isPending: isRemoving } = useRemoveSongFromPlaylist(id!)
  const { mutateAsync: addSong, isPending: isAdding } = useAddSongToPlaylist(id!)

  // Local state
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Search songs query (for add modal)
  const { data: searchResults, isLoading: isSearching } = useSongs({
    keyword: searchKeyword,
    limit: 10, // only grab top 10 for quick search
  })

  // Derived state
  const playlistSongs = songsData ?? []
  const totalDuration = playlistSongs.reduce((sum: number, item: any) => sum + ((item.songId as any).duration || 0), 0)

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return
    await removeSong(removeTarget)
    setRemoveTarget(null)
  }

  const handleAddSong = async (songId: string) => {
    await addSong({ playlistId: id!, songId })
    // We can keep modal open to add more or close it
    // setIsAddModalOpen(false) 
  }

  if (isLoadingPlaylist) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={32} color="#3FD6FF" />
      </div>
    )
  }

  if (!playlist) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>Playlist not found</h2>
        <button onClick={() => navigate('/artist/playlists')} style={{ marginTop: 16, background: '#3FD6FF', color: '#000', padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
          Back to Playlists
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Banner ───────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(to bottom, rgba(63,214,255,0.1), transparent)',
          padding: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: 32,
          alignItems: 'flex-end',
        }}
      >
        <button
          onClick={() => navigate('/artist/playlists')}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            width: 36,
            height: 36,
            borderRadius: 18,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Cover */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 16,
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ListMusic size={64} color="#444" />
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#3FD6FF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Playlist
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
            {playlist.title}
          </h1>
          <p style={{ fontSize: 15, color: '#aaa', maxWidth: 600, marginBottom: 16 }}>
            {playlist.description || 'No description provided.'}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#888', fontWeight: 500 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>{typeof playlist.userId === 'object' ? playlist.userId.username : 'You'}</span>
            <span>•</span>
            <span>{playlistSongs.length} songs</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
            <span>•</span>
            <span style={{ color: playlist.isPublic ? '#3DDC84' : '#FF5B5B' }}>
              {playlist.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div style={{ padding: '32px 40px', flex: 1, background: '#090909' }}>
        
        {/* Actions bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Tracks</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              padding: '0 20px',
              borderRadius: 20,
              background: 'rgba(63,214,255,0.1)',
              border: '1px solid rgba(63,214,255,0.2)',
              color: '#3FD6FF',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Songs
          </motion.button>
        </div>

        {/* Tracks List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 80px 48px', gap: 16, padding: '0 16px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ textAlign: 'center' }}>#</div>
            <div>Title</div>
            <div>Artist</div>
            <div style={{ textAlign: 'right' }}><Clock size={14} style={{ display: 'inline' }} /></div>
            <div></div>
          </div>

          {/* Rows */}
          {isLoadingSongs ? (
            <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" size={24} color="#888" /></div>
          ) : playlistSongs.length === 0 ? (
            <div style={{ padding: '64px 0', textAlign: 'center', color: '#666' }}>
              <Music size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 15 }}>This playlist is empty.</p>
              <button onClick={() => setIsAddModalOpen(true)} style={{ marginTop: 12, background: 'transparent', color: '#3FD6FF', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Find songs to add
              </button>
            </div>
          ) : (
            playlistSongs.map((ps: any, idx: number) => {
              const song = ps.songId as any as Song
              const artistName = typeof song.artistId === 'object' ? (song.artistId as any).stageName : 'Unknown Artist'
              return (
                <div
                  key={ps._id}
                  className="song-row group"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 1fr 80px 48px',
                    gap: 16,
                    padding: '12px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.2s',
                    borderRadius: 8,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#666', fontWeight: 500 }}>
                    {idx + 1}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <SongCover title={song.title} coverUrl={song.coverUrl} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {song.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {artistName}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {formatDuration(song.duration)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setRemoveTarget(ps._id)}
                      title="Remove from playlist"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'transparent',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#FF5B5B'; e.currentTarget.style.background = 'rgba(255,91,91,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Song"
        description="Are you sure you want to remove this song from the playlist?"
        confirmLabel="Remove"
        cancelLabel="Keep"
        variant="danger"
        isLoading={isRemoving}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemoveTarget(null)}
      />

      {/* ── Add Song Modal ─────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 100,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 101,
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                width: '100%',
                maxWidth: 600,
                boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                height: 600,
                maxHeight: '90vh',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Add Songs to Playlist</h3>
                <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: 16, top: 13, color: '#666' }} />
                  <input
                    type="text"
                    placeholder="Search for songs..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{
                      width: '100%',
                      height: 44,
                      paddingLeft: 44,
                      paddingRight: 16,
                      borderRadius: 12,
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px' }}>
                {isSearching ? (
                  <div style={{ textAlign: 'center', padding: 40 }}><Loader2 className="animate-spin" size={24} color="#888" /></div>
                ) : searchResults?.data?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>No songs found matching "{searchKeyword}"</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {searchResults?.data?.map(song => {
                      const alreadyInPlaylist = playlistSongs.some((ps: any) => (ps.songId as any)._id === song._id)
                      const artistName = typeof song.artistId === 'object' ? (song.artistId as any).stageName : 'Unknown'
                      
                      return (
                        <div
                          key={song._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.03)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <SongCover title={song.title} coverUrl={song.coverUrl} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{song.title}</div>
                              <div style={{ fontSize: 12, color: '#888' }}>{artistName}</div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleAddSong(song._id)}
                            disabled={alreadyInPlaylist || isAdding}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              background: alreadyInPlaylist ? 'transparent' : 'rgba(63,214,255,0.1)',
                              border: `1px solid ${alreadyInPlaylist ? 'rgba(255,255,255,0.1)' : 'rgba(63,214,255,0.2)'}`,
                              color: alreadyInPlaylist ? '#666' : '#3FD6FF',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: alreadyInPlaylist ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            {alreadyInPlaylist ? (
                              'Added'
                            ) : (
                              <>
                                <Plus size={14} strokeWidth={2.5} />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
