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

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Song cover thumbnail ─────────────────────────────────────────────────────

function SongCover({ title, coverUrl }: { title: string; coverUrl?: string }) {
  const initials = title
    ? title.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '♪'

  const colors = ['#3FD6FF', '#A78BFA', '#F7B500', '#3DDC84', '#FB923C', '#FF5B5B']
  const color = title ? colors[title.charCodeAt(0) % colors.length] : '#3FD6FF'

  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
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
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '-0.01em' }}>
          {initials}
        </span>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function SongEmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(63,214,255,0.06)',
          border: '1px solid rgba(63,214,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#3FD6FF',
        }}
      >
        <Music size={24} />
      </div>
      <p style={{ fontSize: 15, color: '#aaa', fontWeight: 600, marginBottom: 6 }}>
        No songs found
      </p>
      <p style={{ fontSize: 13, color: '#444' }}>
        Try adjusting your search or filters.
      </p>
    </div>
  )
}

// ─── Action button ────────────────────────────────────────────────────────────

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
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: '1px solid transparent',
        background: 'transparent',
        color: '#3a3a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
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

// ─── Filter bar ───────────────────────────────────────────────────────────────

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
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <span
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: value ? '#3FD6FF' : '#555',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'color 0.15s',
        }}
      >
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 38,
          paddingLeft: 30,
          paddingRight: 28,
          borderRadius: 10,
          border: `1px solid ${
            focused || value
              ? 'rgba(63,214,255,0.25)'
              : 'rgba(255,255,255,0.06)'
          }`,
          background: value ? 'rgba(63,214,255,0.05)' : 'rgba(255,255,255,0.02)',
          color: value ? '#3FD6FF' : '#666',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          appearance: 'none',
          minWidth: 140,
          transition: 'all 0.15s',
        }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={12}
        style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#444',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export function SongManagementPage() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // ── Filter state ───────────────────────────────────────
  const [keyword, setKeyword]   = useState('')
  const [artistId, setArtistId] = useState('')
  const [genre, setGenre]       = useState('')
  const [page, setPage]         = useState(1)

  // ── Modal state ────────────────────────────────────────
  const [deleteTarget, setDeleteTarget]   = useState<Song | null>(null)
  const [isFormOpen, setIsFormOpen]       = useState(false)
  const [editTarget, setEditTarget]       = useState<Song | null>(null)
  const [detailSong, setDetailSong]       = useState<Song | null>(null)
  const [isDetailOpen, setIsDetailOpen]   = useState(false)

  const queryParams: SongQueryParams = {
    keyword,
    artistId: artistId || undefined,
    genre: genre || undefined,
    page,
    limit: PAGE_SIZE,
  }

  // ── Data ────────────────────────────────────────────────
  const { data, isLoading }     = useSongs(queryParams)
  const { data: stats }         = useSongStats()
  const { data: artistOptions } = useArtistOptions()
  const { mutateAsync: deleteSong, isPending: isDeleting } = useDeleteSong()
  const { mutateAsync: createSong, isPending: isCreating } = useCreateSong()
  const { mutateAsync: updateSong, isPending: isUpdating } = useUpdateSong()

  // ── Handlers ───────────────────────────────────────────
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

  // ── Table columns ───────────────────────────────────────
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SongCover title={row.title} coverUrl={row.coverUrl} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 200,
                }}
              >
                {row.title}
              </div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
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
          <span style={{ fontSize: 12, color: albumName ? '#888' : '#333', fontWeight: 500 }}>
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
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 22,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 6,
              background: 'rgba(63,214,255,0.06)',
              border: '1px solid rgba(63,214,255,0.12)',
              fontSize: 11,
              color: '#3FD6FF',
              fontWeight: 600,
            }}
          >
            {row.genre}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: '#333' }}>—</span>
        ),
    },
    {
      key: 'duration',
      header: 'Duration',
      align: 'right',
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            color: '#666',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            justifyContent: 'flex-end',
          }}
        >
          <Clock size={11} style={{ color: '#444' }} />
          {formatDuration(row.duration)}
        </span>
      ),
    },
    {
      key: 'playCount',
      header: 'Plays',
      align: 'right',
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            color: '#888',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            justifyContent: 'flex-end',
          }}
        >
          <BarChart2 size={11} style={{ color: '#444' }} />
          {formatPlays(row.playCount)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added',
      render: (row) => (
        <span style={{ fontSize: 12, color: '#444' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
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

  // ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px', minHeight: '100%' }}>

      {/* ── Page header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28,
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: 'rgba(63,214,255,0.08)',
              border: '1px solid rgba(63,214,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3FD6FF',
              flexShrink: 0,
            }}
          >
            <Music size={20} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Song Management
            </h1>
            <p style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 42,
              paddingLeft: 18,
              paddingRight: 18,
              borderRadius: 11,
              border: 'none',
              background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
              color: '#000',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(63,214,255,0.3)',
              flexShrink: 0,
              letterSpacing: '-0.01em',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Song
          </motion.button>
        )}
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={<Music size={18} />}
          iconColor="#3FD6FF"
          label="Total Songs"
          value={stats?.totalSongs ?? '—'}
          trend={12}
          trendLabel="vs last month"
          delay={0.05}
        />
        <StatCard
          icon={<BarChart2 size={18} />}
          iconColor="#A78BFA"
          label="Total Plays"
          value={stats ? formatPlays(stats.totalPlays) : '—'}
          delay={0.1}
        />
        <StatCard
          icon={<Filter size={18} />}
          iconColor="#F7B500"
          label="Filtered Results"
          value={data?.total ?? '—'}
          delay={0.15}
        />
      </div>

      {/* ── Table card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <SearchBar
            value={keyword}
            onChange={handleSearchChange}
            placeholder="Search songs by title..."
          />

          {/* Artist filter */}
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

          {/* Genre filter */}
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

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={handleReset}
              id="btn-reset-filters"
              style={{
                height: 38,
                paddingLeft: 14,
                paddingRight: 14,
                borderRadius: 10,
                border: '1px solid rgba(255,91,91,0.2)',
                background: 'rgba(255,91,91,0.06)',
                color: '#FF5B5B',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,91,91,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,91,91,0.06)'
              }}
            >
              <Radio size={11} />
              Reset
            </button>
          )}

          {/* Result count */}
          {!isLoading && data && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: '#333',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#555' }}>{data.total}</span> songs
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
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
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

      {/* ── Confirm delete dialog ─────────────────────── */}
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

      {/* ── Add / Edit form modal ─────────────────────── */}
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

      {/* ── Detail modal ──────────────────────────────── */}
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
