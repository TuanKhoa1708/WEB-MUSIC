import { useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Music,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Radio,
  BarChart2,
  Clock,
  Tag,
  User,
  Filter,
  ChevronDown,
} from 'lucide-react'
import {
  useSongs,
  useSongStats,
  useDeleteSong,
  useCreateSong,
  useUpdateSong,
  useArtistOptions,
} from '@/hooks/admin/useSongs'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import type { Column } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/admin/SearchBar'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { SongForm } from '@/components/admin/SongForm'
import { SongDetailModal } from '@/components/admin/SongDetailModal'
import type {
  Song,
  SongQueryParams,
  CreateSongInput,
  UpdateSongInput,
  ArtistRef,
  AlbumRef,
} from '@/types/song.types'

const PAGE_SIZE = 10

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatPlays(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function SongCover({ title, coverUrl }: { title: string; coverUrl?: string }) {
  const initials = title
    ? title.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '♪'

  const colors = ['#3FD6FF', '#A78BFA', '#F7B500', '#3DDC84', '#FB923C', '#FF5B5B']
  const color = title ? colors[title.charCodeAt(0) % colors.length] : '#3FD6FF'

  return (
    <div
      className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center overflow-hidden shrink-0"
      style={{
        background: coverUrl ? 'transparent' : `${color}14`,
        border: `1px solid ${color}28`,
      }}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span className="text-xs font-extrabold tracking-[-0.01em]" style={{ color }}>
          {initials}
        </span>
      )}
    </div>
  )
}

function SongEmptyState() {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-14 h-14 rounded-2xl bg-[#3FD6FF]/5 border border-[#3FD6FF]/10 flex items-center justify-center mx-auto mb-4 text-[#3FD6FF]">
        <Music size={24} />
      </div>
      <p className="text-[15px] text-[#aaa] font-semibold mb-1.5 m-0">
        No songs found
      </p>
      <p className="text-[13px] text-[#444] m-0">
        Try adjusting your search or filters.
      </p>
    </div>
  )
}

function ActionBtn({
  icon,
  title,
  color,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  color: string
  onClick?: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-[30px] h-[30px] rounded-lg border border-transparent bg-transparent text-[#3a3a3a] flex items-center justify-center cursor-pointer transition-all duration-150"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}12`
        e.currentTarget.style.borderColor = `${color}30`
        e.currentTarget.style.color = color
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.color = '#3a3a3a'
      }}
    >
      {icon}
    </button>
  )
}

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Classical',
  'Electronic', 'Dance', 'Country', 'Folk', 'Indie', 'Metal',
  'Punk', 'Reggae', 'Soul', 'Blues', 'Latin', 'K-Pop', 'V-Pop',
]

function FilterSelect({
  value,
  onChange,
  icon,
  placeholder,
  children,
  id,
}: {
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  placeholder: string
  children: React.ReactNode
  id?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative shrink-0">
      <span
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-[1] transition-colors duration-150 ${value ? 'text-[#3FD6FF]' : 'text-[#555]'
          }`}
      >
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`h-[38px] pl-[30px] pr-7 rounded-[10px] text-xs font-semibold cursor-pointer appearance-none min-w-[120px] transition-all duration-150 outline-none font-sans ${value ? 'bg-[#3FD6FF]/5 text-[#3FD6FF]' : 'bg-white/5 text-[#666]'
          }`}
        style={{
          border: `1px solid ${focused || value
              ? 'rgba(63,214,255,0.25)'
              : 'rgba(255,255,255,0.06)'
            }`,
        }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
      />
    </div>
  )
}

export function SongManagementPage() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [keyword, setKeyword] = useState('')
  const [artistId, setArtistId] = useState('')
  const [genre, setGenre] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Song | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Song | null>(null)
  const [detailSong, setDetailSong] = useState<Song | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const queryParams: SongQueryParams = {
    keyword,
    artistId: artistId || undefined,
    genre: genre || undefined,
    page,
    limit: PAGE_SIZE,
  }

  const { data, isLoading } = useSongs(queryParams)
  const { data: stats } = useSongStats()
  const { data: artistOptions } = useArtistOptions()
  const { mutateAsync: deleteSong, isPending: isDeleting } = useDeleteSong()
  const { mutateAsync: createSong, isPending: isCreating } = useCreateSong()
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong()

  const handleSearchChange = useCallback((v: string) => {
    setKeyword(v)
    setPage(1)
  }, [])

  const handleArtistChange = useCallback((v: string) => {
    setArtistId(v)
    setPage(1)
  }, [])

  const handleGenreChange = useCallback((v: string) => {
    setGenre(v)
    setPage(1)
  }, [])

  const handleReset = () => {
    setKeyword('')
    setArtistId('')
    setGenre('')
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteSong(deleteTarget._id)
    setDeleteTarget(null)
  }

  const handleFormSubmit = async (formData: CreateSongInput | UpdateSongInput) => {
    if (editTarget) {
      await updateSong(formData as UpdateSongInput)
    } else {
      await createSong(formData as CreateSongInput)
    }
    setIsFormOpen(false)
  }

  const hasFilters = !!(keyword || artistId || genre)

  const columns: Column<Song>[] = [
    {
      key: 'song',
      header: 'Song',
      render: (row) => {
        const artist =
          typeof row.artistId === 'object'
            ? (row.artistId as ArtistRef).stageName
            : row.artistId
        return (
          <div className="flex items-center gap-3">
            <SongCover title={row.title} coverUrl={row.coverUrl} />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white tracking-[-0.01em] truncate max-w-[200px]">
                {row.title}
              </div>
              <div className="text-[11px] text-[#444] mt-0.5">
                {artist}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'album',
      header: 'Album',
      render: (row) => {
        const albumName =
          row.albumId
            ? typeof row.albumId === 'object'
              ? (row.albumId as AlbumRef).title
              : row.albumId
            : null
        return (
          <span className={`text-xs font-medium ${albumName ? 'text-[#888]' : 'text-[#333]'}`}>
            {albumName || '—'}
          </span>
        )
      },
    },
    {
      key: 'genre',
      header: 'Genre',
      render: (row) =>
        row.genre ? (
          <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-md bg-[#3FD6FF]/5 border border-[#3FD6FF]/10 text-[11px] text-[#3FD6FF] font-semibold">
            {row.genre}
          </span>
        ) : (
          <span className="text-xs text-[#333]">—</span>
        ),
    },
    {
      key: 'duration',
      header: 'Duration',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-[#666] font-semibold tabular-nums flex items-center gap-1 justify-end">
          <Clock size={11} className="text-[#444]" />
          {formatDuration(row.duration)}
        </span>
      ),
    },
    {
      key: 'playCount',
      header: 'Plays',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-[#888] font-semibold tabular-nums flex items-center gap-1 justify-end">
          <BarChart2 size={11} className="text-[#444]" />
          {formatPlays(row.playCount)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      render: (row) => (
        <span className="text-xs text-[#444]">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <ActionBtn
            icon={<Eye size={13} />}
            title="View"
            color="#3FD6FF"
            onClick={() => {
              setDetailSong(row)
              setIsDetailOpen(true)
            }}
          />
          {!isAdmin && (
            <ActionBtn
              icon={<Edit2 size={13} />}
              title="Edit"
              color="#F7B500"
              onClick={() => {
                setEditTarget(row)
                setIsFormOpen(true)
              }}
            />
          )}
          <ActionBtn
            icon={<Trash2 size={13} />}
            title="Delete"
            color="#FF5B5B"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 36px)', minHeight: '100%', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-start justify-between flex-wrap gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(63,214,255,0.15), rgba(63,214,255,0.03))',
              border: '1px solid rgba(63,214,255,0.25)',
              color: '#3FD6FF',
              boxShadow: '0 0 20px rgba(63,214,255,0.1)',
            }}
          >
            <Music size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 2.5vw, 28px)' }} className="font-extrabold text-white tracking-tight leading-tight m-0">
              Song Management
            </h1>
            <p style={{ fontSize: 'clamp(13px, 1.5vw, 14px)' }} className="text-[#777] mt-1.5 m-0">
              Manage songs in the Pulse music library
            </p>
          </div>
        </div>

        {/* Add Song button */}
        {!isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setEditTarget(null)
              setIsFormOpen(true)
            }}
            id="btn-add-song"
            className="flex items-center gap-2 h-10 px-5 rounded-xl border-none bg-gradient-to-br from-[#3FD6FF] to-[#2094ff] text-black text-[14px] font-bold cursor-pointer shrink-0 font-sans"
            style={{ boxShadow: '0 4px 20px rgba(63,214,255,0.25)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Song
          </motion.button>
        )}
      </motion.div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div
        className="grid gap-5 mb-9"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <StatCard
          icon={<Music size={20} />}
          iconColor="#3FD6FF"
          label="Total Songs"
          value={stats?.totalSongs ?? '—'}
          trend={12}
          trendLabel="vs last month"
          delay={0.05}
        />
        <StatCard
          icon={<BarChart2 size={20} />}
          iconColor="#A78BFA"
          label="Total Plays"
          value={stats ? formatPlays(stats.totalPlays) : '—'}
          delay={0.1}
        />
        <StatCard
          icon={<Filter size={20} />}
          iconColor="#F7B500"
          label="Filtered Results"
          value={data?.total ?? '—'}
          delay={0.15}
        />
      </div>

      {/* ── Table card ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-3 p-4 md:p-6 border-b border-white/5">
          <SearchBar
            value={keyword}
            onChange={handleSearchChange}
            placeholder="Search songs by title..."
          />

          <FilterSelect
            id="filter-artist"
            value={artistId}
            onChange={handleArtistChange}
            icon={<User size={12} />}
            placeholder="All Artists"
          >
            {(artistOptions ?? []).map((a) => (
              <option key={a._id} value={a._id} style={{ background: '#1a1a1a' }}>
                {a.stageName}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            id="filter-genre"
            value={genre}
            onChange={handleGenreChange}
            icon={<Tag size={12} />}
            placeholder="All Genres"
          >
            {GENRES.map((g) => (
              <option key={g} value={g} style={{ background: '#1a1a1a' }}>
                {g}
              </option>
            ))}
          </FilterSelect>

          {hasFilters && (
            <button
              onClick={handleReset}
              id="btn-reset-filters"
              className="h-[38px] px-3.5 rounded-[10px] border border-[#FF5B5B]/20 bg-[#FF5B5B]/5 hover:bg-[#FF5B5B]/15 text-[#FF5B5B] text-xs font-semibold cursor-pointer flex items-center gap-1.5 font-sans transition-all duration-150 shrink-0"
            >
              <Radio size={12} />
              Reset
            </button>
          )}

          {!isLoading && data && (
            <span className="ml-auto text-[13px] text-[#444] font-medium whitespace-nowrap">
              <span className="text-[#777] font-semibold">{data.total}</span> songs
            </span>
          )}
        </div>

        {/* Table */}
        <div>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(row) => row._id}
            isLoading={isLoading}
            skeletonRows={PAGE_SIZE}
            emptyState={<SongEmptyState />}
          />
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5">
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </motion.div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Song"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Song"
        cancelLabel="Keep Song"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <SongForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditTarget(null)
        }}
        song={editTarget}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      <SongDetailModal
        song={detailSong}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setDetailSong(null)
        }}
        onEdit={!isAdmin ? (s) => {
          setEditTarget(s)
          setIsFormOpen(true)
        } : undefined}
      />
    </div>
  )
}