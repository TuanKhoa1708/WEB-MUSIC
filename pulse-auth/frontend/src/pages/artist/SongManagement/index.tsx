import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Plus, Edit2, Trash2, Search, Play } from 'lucide-react'
import {
  useSongs,
  useDeleteSong,
  useCreateSong,
  useUpdateSong
} from '@/hooks/artist/useSongs'
import { useAuth } from '@/contexts/AuthContext'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { SongForm } from '@/components/admin/SongForm'
import type { Song, SongQueryParams, CreateSongInput, UpdateSongInput } from '@/types/song.types'

const PAGE_SIZE = 12

// ─── Empty state ─────────────────────────────────────────────────────────────

function SongEmptyState({ isSearch }: { isSearch?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 col-span-full">
      <div className="w-16 h-16 rounded-[20px] bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center mb-5 text-[#3FD6FF]">
        <Music size={28} />
      </div>
      <p className="text-lg text-white font-bold mb-2 tracking-tight">
        {isSearch ? 'No songs found' : 'No songs yet'}
      </p>
      <p className="text-sm text-[#888] max-w-[300px]">
        {isSearch
          ? 'Try adjusting your search keywords.'
          : 'Upload your first song to share your music with the world.'}
      </p>
    </div>
  )
}

// ─── Artist Song Card ────────────────────────────────────────────────────────

function ArtistSongCard({
  song,
  onEdit,
  onDelete,
}: {
  song: Song
  onEdit: (s: Song) => void
  onDelete: (s: Song) => void
}) {
  const artistName = typeof song.artistId === 'object'
    ? song.artistId.stageName || 'Unknown Artist'
    : 'Unknown Artist'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group bg-[#121212] rounded-2xl overflow-hidden border border-white/5 flex flex-col relative"
    >
      <div className="w-full pt-[100%] relative bg-[#1a1a1a]">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#333]">
            <Music size={48} />
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => onEdit(song)}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-[#3FD6FF]/80"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(song)}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-red-500/80"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-[15px] font-bold text-white mb-1 truncate tracking-tight"
          title={song.title}
        >
          {song.title}
        </h3>
        <p className="text-[13px] text-[#888] truncate m-0">
          {artistName}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main page component ─────────────────────────────────────────────────────

export function ArtistSongManagementPage() {
  const { user } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Song | null>(null)

  const artistId = user?.artistId || ''
  
  const queryParams: SongQueryParams = {
    keyword,
    artistId, // only fetch this artist's songs
    page,
    limit: PAGE_SIZE,
  }

  const { data: songsData, isLoading } = useSongs(queryParams)
  
  const { mutateAsync: deleteSong, isPending: isDeleting } = useDeleteSong()
  const { mutateAsync: createSong, isPending: isCreating } = useCreateSong()
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteSong(deleteTarget._id)
    setDeleteTarget(null)
  }

  const handleModalSubmit = async (formData: CreateSongInput | UpdateSongInput) => {
    if (editTarget) {
      await updateSong(formData as UpdateSongInput)
    } else {
      await createSong(formData as CreateSongInput)
    }
    setIsModalOpen(false)
  }

  return (
    <div
      style={{ padding: "clamp(16px, 3vw, 28px)", minHeight: "100%" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 lg:mb-10"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center text-[#3FD6FF] flex-shrink-0">
            <Music size={24} />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-white tracking-[-0.03em] m-0">
              My Songs
            </h1>
            <p style={{ fontSize: 15, color: '#555', margin: '8px 0 0' }}>
              Manage and upload your music catalog
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3.5 top-3 text-[#555]" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full sm:w-[240px] pl-10 pr-4 rounded-xl bg-[#141414] border border-white/10 text-white text-sm outline-none focus:border-[#3FD6FF]/50 transition-colors"
              style={{ paddingLeft: '2.5rem' }}
            />
          </form>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setEditTarget(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 h-10 px-5 rounded-xl border-none bg-gradient-to-br from-[#3FD6FF] to-[#2094ff] text-black text-sm font-bold cursor-pointer shadow-[0_4px_20px_rgba(63,214,255,0.3)] flex-shrink-0"
            style={{ gap: '8px' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Upload Song
          </motion.button>
        </div>
      </motion.div>

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
        ) : songsData?.data && songsData.data.length > 0 ? (
          songsData.data.map((song) => (
            <ArtistSongCard
              key={song._id}
              song={song}
              onEdit={(s) => {
                setEditTarget(s)
                setIsModalOpen(true)
              }}
              onDelete={setDeleteTarget}
            />
          ))
        ) : (
          <SongEmptyState isSearch={!!keyword} />
        )}
      </div>

      {songsData && songsData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={songsData.page}
            totalPages={songsData.totalPages}
            totalItems={songsData.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Song"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Song"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <SongForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        song={editTarget}
        onSubmit={handleModalSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}
