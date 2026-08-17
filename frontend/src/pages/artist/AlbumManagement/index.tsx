import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Disc3,
  Plus,
  Edit2,
  Trash2,
  Search,
  Music,
} from 'lucide-react'
import { 
  useAlbums, 
  useAlbumStats, 
  useDeleteAlbum,
  useCreateAlbum,
  useUpdateAlbum
} from '@/hooks/artist/useAlbums'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { AlbumForm } from '@/components/artist/AlbumForm'
import type { Album, AlbumQueryParams, CreateAlbumInput, UpdateAlbumInput } from '@/types/album.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12 // Using 12 for grid layouts (3x4 or 4x3)

// ─── Empty state ──────────────────────────────────────────────────────────────

function AlbumEmptyState({ isSearch }: { isSearch?: boolean }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', gridColumn: '1 / -1' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'rgba(63,214,255,0.06)',
          border: '1px solid rgba(63,214,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#3FD6FF',
        }}
      >
        <Disc3 size={28} />
      </div>
      <p style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
        {isSearch ? 'No albums found' : 'No albums yet'}
      </p>
      <p style={{ fontSize: 14, color: '#888', maxWidth: 300, margin: '0 auto' }}>
        {isSearch 
          ? 'Try adjusting your search keywords.' 
          : 'Create your first album and start building your music catalog.'}
      </p>
    </div>
  )
}

// ─── Album Card ───────────────────────────────────────────────────────────────

function AlbumCard({
  album,
  onEdit,
  onDelete,
}: {
  album: Album
  onEdit: (a: Album) => void
  onDelete: (a: Album) => void
}) {
  const artistName = typeof album.artistId === 'object' ? album.artistId?.stageName : 'Unknown Artist'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      style={{
        background: '#121212',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        group: 'album-card',
      }}
    >
      {/* Aspect Ratio Box for Cover */}
      <div style={{ width: '100%', paddingTop: '100%', position: 'relative', background: '#1a1a1a' }}>
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
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
            <Music size={48} />
          </div>
        )}

        {/* Hover Action Menu */}
        <div 
          className="album-actions"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 6,
            opacity: 0.9,
          }}
        >
          <button
            onClick={() => onEdit(album)}
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
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(63,214,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(album)}
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
          title={album.title}
        >
          {album.title}
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
          {artistName} • {album.releaseYear || 'Unknown Year'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export function AlbumManagementPage() {
  // ── Filters state ──────────────────────────────────────
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('') // Local state for input before debouncing
  const [page, setPage] = useState(1)

  // ── Delete & Modal dialog state ────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [editTarget, setEditTarget]     = useState<Album | null>(null)

  const queryParams: AlbumQueryParams = {
    keyword,
    page,
    limit: PAGE_SIZE,
  }

  // ── Data ───────────────────────────────────────────────
  const { data, isLoading } = useAlbums(queryParams)
  const { mutateAsync: deleteAlbum, isPending: isDeleting } = useDeleteAlbum()
  const { mutateAsync: createAlbum, isPending: isCreating } = useCreateAlbum()
  const { mutateAsync: updateAlbum, isPending: isUpdating } = useUpdateAlbum()

  // ── Handlers ───────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteAlbum(deleteTarget._id)
    setDeleteTarget(null)
  }

  const handleModalSubmit = async (formData: CreateAlbumInput | UpdateAlbumInput) => {
    if (editTarget) {
      await updateAlbum(formData as UpdateAlbumInput)
    } else {
      await createAlbum(formData as CreateAlbumInput)
    }
    setIsModalOpen(false)
  }

  // ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>

      {/* ── Page header ──────────────────────────────── */}
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
              background: 'rgba(63,214,255,0.08)',
              border: '1px solid rgba(63,214,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3FD6FF',
              flexShrink: 0,
            }}
          >
            <Disc3 size={24} />
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
              Album Management
            </h1>
            <p style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Create and manage your music catalog
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#555' }} />
            <input
              type="text"
              placeholder="Search albums..."
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

          {/* Add Album button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 40,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
              color: '#000',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(63,214,255,0.3)',
              flexShrink: 0,
            }}
            onClick={() => {
              setEditTarget(null)
              setIsModalOpen(true)
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Album
          </motion.button>
        </div>
      </motion.div>

      {/* ── Album Grid ────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        {isLoading ? (
          // Loading Skeletons
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
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((album) => (
            <AlbumCard
              key={album._id}
              album={album}
              onEdit={(a) => {
                setEditTarget(a)
                setIsModalOpen(true)
              }}
              onDelete={setDeleteTarget}
            />
          ))
        ) : (
          <AlbumEmptyState isSearch={!!keyword} />
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Confirm delete dialog ──────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Album"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Album"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Add / Edit Modal ───────────────────────────── */}
      <AlbumForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        album={editTarget}
        onSubmit={handleModalSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}
