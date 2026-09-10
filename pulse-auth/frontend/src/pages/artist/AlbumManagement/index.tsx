import { useState } from 'react'
import { useLocation } from 'react-router-dom'
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
  useDeleteAlbum,
  useCreateAlbum,
  useUpdateAlbum
} from '@/hooks/artist/useAlbums'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { AlbumForm } from '@/components/artist/AlbumForm'
import type { Album, AlbumQueryParams, CreateAlbumInput, UpdateAlbumInput } from '@/types/album.types'

const PAGE_SIZE = 12

function AlbumEmptyState({ isSearch }: { isSearch?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 col-span-full">
      <div className="w-16 h-16 rounded-[20px] bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center mb-5 text-[#3FD6FF]">
        <Disc3 size={28} />
      </div>
      <p className="text-lg text-white font-bold mb-2 tracking-tight">
        {isSearch ? 'No albums found' : 'No albums yet'}
      </p>
      <p className="text-sm text-[#888] max-w-[300px]">
        {isSearch
          ? 'Try adjusting your search keywords.'
          : 'Create your first album and start building your music catalog.'}
      </p>
    </div>
  )
}

function AlbumCard({
  album,
  onEdit,
  onDelete,
  isAdmin,
}: {
  album: Album
  onEdit: (a: Album) => void
  onDelete: (a: Album) => void
  isAdmin: boolean
}) {
  const artistName = (typeof album.artistId === 'object' && album.artistId)
    ? album.artistId.stageName || 'Unknown Artist'
    : 'Unknown Artist'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-[#121212] rounded-2xl overflow-hidden border border-white/5 flex flex-col relative"
    >
      {/* Aspect Ratio Box for Cover */}
      <div className="w-full pt-[100%] relative bg-[#1a1a1a]">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#333]">
            <Music size={48} />
          </div>
        )}

        {/* Hover Action Menu */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-90">
          {!isAdmin && (
            <button
              onClick={() => onEdit(album)}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-[#3FD6FF]/80"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(album)}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-red-500/80"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-[15px] font-bold text-white mb-1 truncate tracking-tight"
          title={album.title}
        >
          {album.title}
        </h3>
        <p className="text-[13px] text-[#888] truncate m-0">
          {artistName} • {album.releaseYear || 'Unknown Year'}
        </p>
      </div>
    </motion.div>
  )
}

export function AlbumManagementPage() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Album | null>(null)

  const queryParams: AlbumQueryParams = {
    keyword,
    page,
    limit: PAGE_SIZE,
  }

  const { data, isLoading } = useAlbums(queryParams)
  const { mutateAsync: deleteAlbum, isPending: isDeleting } = useDeleteAlbum()
  const { mutateAsync: createAlbum, isPending: isCreating } = useCreateAlbum()
  const { mutateAsync: updateAlbum, isPending: isUpdating } = useUpdateAlbum()

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

  return (
    <div
      className="px-6 md:px-8 lg:px-10 pt-8 md:pt-10"
      style={{ maxWidth: 1400, margin: '0 auto' }}
    >

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 lg:mb-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center text-[#3FD6FF] flex-shrink-0">
            <Disc3 size={24} />
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl lg:text-[32px]"
              style={{ fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}
            >
              My Albums
            </h1>
            <p style={{ fontSize: 15, color: '#555', margin: '8px 0 0' }}>
              Create and manage your music catalog
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3.5 top-3 text-[#555]" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full sm:w-[240px] pl-10 pr-4 rounded-xl bg-[#141414] border border-white/10 text-white text-sm outline-none focus:border-[#3FD6FF]/50 transition-colors"
            />
          </form>

          {/* Add Album button */}
          {!isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border-none bg-gradient-to-br from-[#3FD6FF] to-[#2094ff] text-black text-sm font-bold cursor-pointer shadow-[0_4px_20px_rgba(63,214,255,0.3)] flex-shrink-0"
              onClick={() => {
                setEditTarget(null)
                setIsModalOpen(true)
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              Create Album
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── Album Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
              <div className="w-full pt-[100%] bg-white/5" />
              <div className="p-4">
                <div className="h-4 w-4/5 bg-white/5 rounded mb-2" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((album) => (
            <AlbumCard
              key={album._id}
              album={album}
              isAdmin={isAdmin}
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
        <div className="flex justify-center">
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Confirm delete dialog ── */}
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

      {/* ── Add / Edit Modal ── */}
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