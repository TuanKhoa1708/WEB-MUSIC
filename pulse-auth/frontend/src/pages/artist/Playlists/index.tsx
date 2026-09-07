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

// ─── Empty state ─────────────────────────────────────────────────────────────

function PlaylistEmptyState({ isSearch }: { isSearch?: boolean }) {
  return (
    <div className="text-center py-16 px-6 col-span-full">
      <div className="w-16 h-16 rounded-[20px] bg-[#F7B500]/10 border border-[#F7B500]/20 flex items-center justify-center mx-auto mb-5 text-[#F7B500]">
        <ListMusic size={28} />
      </div>
      <p className="text-lg text-white font-bold mb-2 tracking-tight">
        {isSearch ? 'No playlists found' : 'No playlists yet'}
      </p>
      <p className="text-sm text-[#888] max-w-[300px] mx-auto">
        {isSearch
          ? 'Try adjusting your search keywords.'
          : 'Create your first playlist to organize your favorite tracks.'}
      </p>
    </div>
  )
}

// ─── Playlist Card ───────────────────────────────────────────────────────────

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
      className="group bg-[#121212] rounded-2xl overflow-hidden border border-white/5 flex flex-col relative"
    >
      <Link to={`/artist/playlists/${playlist._id}`} className="block no-underline">
        <div className="w-full pt-[100%] relative bg-[#1a1a1a]">
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#333]">
              <ListMusic size={48} />
            </div>
          )}

          {/* Visibility badge */}
          <div
            className={`absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider ${playlist.isPublic ? 'text-[#3DDC84]' : 'text-[#FF5B5B]'
              }`}
          >
            {playlist.isPublic ? 'Public' : 'Private'}
          </div>
        </div>
      </Link>

      {/* Hover Actions */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={(e) => { e.preventDefault(); onEdit(playlist); }}
          className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-[#F7B500]/80"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(playlist); }}
          className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-red-500/80"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/artist/playlists/${playlist._id}`} className="no-underline block">
          <h3
            className="text-[15px] font-bold text-white mb-1 truncate tracking-tight"
            title={playlist.title}
          >
            {playlist.title}
          </h3>
        </Link>
        <p className="text-[13px] text-[#888] truncate m-0">
          {playlist.description || 'No description'}
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main page component ─────────────────────────────────────────────────────

export function ArtistPlaylistsPage() {
  const { user } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Playlist | null>(null)

  const artistId = user?.id || ''
  const { data: playlistsData, isLoading } = usePlaylists({ artistId })

  const playlists = Array.isArray(playlistsData?.data) ? playlistsData.data : []
  const myPlaylists = playlists.filter((p) =>
    keyword ? p.title.toLowerCase().includes(keyword.toLowerCase()) : true
  )

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
    <div className="px-4 sm:px-6 md:px-10 py-6 md:py-8 min-h-full max-w-[1400px] mx-auto">

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7B500]/10 border border-[#F7B500]/20 flex items-center justify-center text-[#F7B500] flex-shrink-0">
            <ListMusic size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-[26px] font-extrabold text-white tracking-tight leading-tight">
              My Playlists
            </h1>
            <p className="text-xs md:text-sm text-[#666] mt-1">
              Curate and manage your custom collections
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3.5 top-3 text-[#555]" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full sm:w-[240px] pl-10 pr-4 rounded-xl bg-[#141414] border border-white/10 text-white text-sm outline-none focus:border-[#F7B500]/50 transition-colors"
            />
          </form>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setEditTarget(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 h-10 px-5 rounded-xl border-none bg-gradient-to-br from-[#F7B500] to-[#ffc933] text-black text-sm font-bold cursor-pointer shadow-[0_4px_20px_rgba(247,181,0,0.3)] flex-shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            Create Playlist
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
        artistId={artistId}
        onClose={() => setIsModalOpen(false)}
        playlist={editTarget}
        onSubmit={handleModalSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}