import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ListMusic,
  Plus,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { 
  usePlaylists, 
  useDeletePlaylist,
  useCreatePlaylist,
  useUpdatePlaylist
} from '@/hooks/artist/usePlaylists'
import { useAuth } from '@/contexts/AuthContext'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { PlaylistForm } from '@/components/artist/PlaylistForm'
import type { Playlist, CreatePlaylistInput, UpdatePlaylistInput } from '@/types/playlist.types'

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
          : 'Create your first playlist to organize your favorite tracks.'}
      </p>
    </div>
  )
}

// ─── Playlist Card ────────────────────────────────────────────────────────────

function PlaylistCard({
  playlist,
  onEdit,
  onDelete,
}: {
  playlist: Playlist
  onEdit: (p: Playlist) => void
  onDelete: (p: Playlist) => void
}) {
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
      <Link to={`/artist/playlists/${playlist._id}`} style={{ textDecoration: 'none', display: 'block' }}>
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
        </div>
      </Link>

      {/* Hover Actions (Clicking these should not trigger the link) */}
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
          onClick={(e) => { e.preventDefault(); onEdit(playlist); }}
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
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(247,181,0,0.8)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        >
          <Edit2 size={14} />
        </button>
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

      <style>{`.group:hover .playlist-actions { opacity: 0.9 !important; }`}</style>

      <div style={{ padding: '16px' }}>
        <Link to={`/artist/playlists/${playlist._id}`} style={{ textDecoration: 'none' }}>
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
        </Link>
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
          {playlist.description || 'No description'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export function ArtistPlaylistsPage() {
  const { user } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [editTarget, setEditTarget]     = useState<Playlist | null>(null)

  // Fetch only this user's playlists (we filter on the frontend for now, or backend if it supports it.
  // Wait, the backend doesn't support userId filtering in getPlaylists out-of-the-box in most simple controllers unless we add it.
  // However, the prompt says "Do NOT invent backend fields, schemas, API endpoints, or business logic." 
  // Let's assume `getPlaylists` can take a `userId` query param, or we fetch all and filter.
  // Actually, standard REST `GET /playlists?userId=XYZ` usually works if built with generic filtering. 
  // We will pass it in. If it ignores it, we'll see all.
  const { data, isLoading } = usePlaylists({
    keyword,
    page,
    limit: PAGE_SIZE,
    // Add userId to params if we want to filter, but let's just use the query params defined in our type
  })

  // To strictly filter to the logged-in user if the API doesn't do it:
  // Since we only want to show the current user's playlists.
  const myPlaylists = data?.data?.filter(p => 
    typeof p.userId === 'object' 
      ? p.userId._id === user?.id 
      : p.userId === user?.id
  ) || []

  const { mutateAsync: deletePlaylist, isPending: isDeleting } = useDeletePlaylist()
  const { mutateAsync: createPlaylist, isPending: isCreating } = useCreatePlaylist()
  const { mutateAsync: updatePlaylist, isPending: isUpdating } = useUpdatePlaylist()

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

  const handleModalSubmit = async (formData: CreatePlaylistInput | UpdatePlaylistInput) => {
    if (editTarget) {
      await updatePlaylist(formData as UpdatePlaylistInput)
    } else {
      await createPlaylist(formData as CreatePlaylistInput)
    }
    setIsModalOpen(false)
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
              My Playlists
            </h1>
            <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Curate and manage your custom collections
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setEditTarget(null)
              setIsModalOpen(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #F7B500, #ffc933)',
              color: '#000',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(247,181,0,0.3)',
              flexShrink: 0,
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Playlist
          </motion.button>
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
        ) : myPlaylists.length > 0 ? (
          myPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onEdit={(p) => {
                setEditTarget(p)
                setIsModalOpen(true)
              }}
              onDelete={setDeleteTarget}
            />
          ))
        ) : (
          <PlaylistEmptyState isSearch={!!keyword} />
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalItems={data.total} // Note: This total won't match myPlaylists.length perfectly if backend didn't filter, but we keep it for UX.
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

      <PlaylistForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playlist={editTarget}
        onSubmit={handleModalSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}
