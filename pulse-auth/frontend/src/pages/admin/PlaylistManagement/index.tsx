import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ListMusic,
  Trash2,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { 
  usePlaylists, 
  useDeletePlaylist,
} from '@/hooks/artist/usePlaylists'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { Playlist } from '@/types/playlist.types'

const PAGE_SIZE = 12

// ─── Empty state ──────────────────────────────────────────────────────────────

function PlaylistEmptyState({ isSearch }: { isSearch?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', gridColumn: '1 / -1' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'rgba(247,181,0,0.06)',
          border: '1px solid rgba(247,181,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#F7B500',
        }}
      >
        <ListMusic size={28} />
      </div>
      <p style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
        {isSearch ? 'No playlists found' : 'No playlists yet'}
      </p>
      <p style={{ fontSize: 14, color: '#888', maxWidth: 300, margin: '0 auto' }}>
        {isSearch 
          ? 'Try adjusting your search keywords.' 
          : 'No playlists have been created on the platform yet.'}
      </p>
    </div>
  )
}

// ─── Playlist Card ────────────────────────────────────────────────────────────

function PlaylistCard({
  playlist,
  onDelete,
}: {
  playlist: Playlist
  onDelete: (p: Playlist) => void
}) {
  const artistName = (typeof playlist.artistId === 'object' && playlist.artistId) 
    ? playlist.artistId.stageName || 'Unknown Artist' 
    : 'Unknown Artist'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
      style={{
        background: '#121212',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', paddingTop: '100%', position: 'relative', background: '#1a1a1a' }}>
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333',
            }}
          >
            <ListMusic size={48} />
          </div>
        )}

        {/* Visibility badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '4px 8px',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 10,
            fontWeight: 700,
            color: playlist.isPublic ? '#3DDC84' : '#FF5B5B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {playlist.isPublic ? 'Public' : 'Private'}
        </div>

        {/* Hover Actions */}
        <div 
          className="playlist-actions"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 6,
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.opacity = '1'
          }}
        >
          <button
            onClick={(e) => { e.preventDefault(); onDelete(playlist); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,91,91,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <style>{`.group:hover .playlist-actions { opacity: 0.9 !important; }`}</style>

      <div style={{ padding: '16px' }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 4px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em',
          }}
          title={playlist.title}
        >
          {playlist.title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: '#888',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {artistName}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export function PlaylistManagementPage() {
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null)

  // Fetch all playlists (admin view)
  const { data: playlistsData, isLoading } = usePlaylists({ keyword, page, limit: PAGE_SIZE })
  const playlists = playlistsData?.data || []
  const totalPages = playlistsData?.totalPages || 1
  const totalItems = playlistsData?.total || 0

  const { mutateAsync: deletePlaylist, isPending: isDeleting } = useDeletePlaylist()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deletePlaylist(deleteTarget._id)
    setDeleteTarget(null)
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(247,181,0,0.08)',
              border: '1px solid rgba(247,181,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F7B500',
              flexShrink: 0,
            }}
          >
            <ListMusic size={24} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Playlist Management
            </h1>
            <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Monitor and manage all playlists on the platform
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#555' }} />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                height: 40,
                width: 240,
                paddingLeft: 40,
                paddingRight: 16,
                borderRadius: 12,
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </form>
        </div>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ 
              background: '#121212', 
              borderRadius: 16, 
              border: '1px solid rgba(255,255,255,0.04)',
              overflow: 'hidden'
            }}>
              <div style={{ width: '100%', paddingTop: '100%', background: 'rgba(255,255,255,0.02)' }} />
              <div style={{ padding: '16px' }}>
                <div style={{ height: 16, width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 14, width: '50%', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }} />
              </div>
            </div>
          ))
        ) : playlists.length > 0 ? (
          playlists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onDelete={setDeleteTarget}
            />
          ))
        ) : (
          <PlaylistEmptyState isSearch={!!keyword} />
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Playlist"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Playlist"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
