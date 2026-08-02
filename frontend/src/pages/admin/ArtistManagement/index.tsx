import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Mic2,
  BadgeCheck,
  Calendar,
  Users,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Radio,
} from 'lucide-react'
import { 
  useArtists, 
  useArtistStats, 
  useDeleteArtist,
  useCreateArtist,
  useUpdateArtist
} from '@/hooks/admin/useArtists'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import type { Column } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/admin/SearchBar'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ArtistModal } from '@/components/admin/ArtistModal'
import type { Artist, ArtistStatus, ArtistQueryParams, CreateArtistInput, UpdateArtistInput } from '@/types/artist.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const GENRES = [
  'All Genres',
  'Pop',
  'Hip-Hop',
  'R&B',
  'Rock',
  'Electronic',
  'Indie Pop',
  'Indie Rock',
  'Jazz',
  'Classical',
  'Country',
  'Bass',
]

const SORT_OPTIONS = [
  { label: 'Stage Name A–Z',     value: 'stageName_asc'    },
  { label: 'Stage Name Z–A',     value: 'stageName_desc'   },
  { label: 'Most Followers',     value: 'followers_desc'   },
  { label: 'Least Followers',    value: 'followers_asc'    },
  { label: 'Newest First',       value: 'createdAt_desc'   },
  { label: 'Oldest First',       value: 'createdAt_asc'    },
]

// ─── Badge ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ArtistStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  verified:  { label: 'Verified',  color: '#3DDC84', bg: 'rgba(61,220,132,0.1)',  dot: '#3DDC84' },
  pending:   { label: 'Pending',   color: '#F7B500', bg: 'rgba(247,181,0,0.1)',   dot: '#F7B500' },
  suspended: { label: 'Suspended', color: '#FF5B5B', bg: 'rgba(255,91,91,0.1)',   dot: '#FF5B5B' },
}

function StatusBadge({ status }: { status: ArtistStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 8,
        background: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
        border: `1px solid ${cfg.color}20`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
          boxShadow: `0 0 4px ${cfg.dot}`,
        }}
      />
      {cfg.label}
    </span>
  )
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function ArtistAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const colors = ['#3FD6FF', '#3DDC84', '#F7B500', '#FF5B5B', '#A78BFA', '#FB923C']
  const color = colors[name.charCodeAt(0) % colors.length]

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: avatarUrl ? 'transparent' : `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '-0.01em' }}>
          {initials}
        </span>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function ArtistEmptyState() {
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
          color: '#2a2a2a',
        }}
      >
        <Mic2 size={24} />
      </div>
      <p style={{ fontSize: 15, color: '#333', fontWeight: 600, marginBottom: 6 }}>
        No artists found
      </p>
      <p style={{ fontSize: 13, color: '#252525' }}>
        Try adjusting your search or filters.
      </p>
    </div>
  )
}

// ─── Select helper ────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 38,
        paddingLeft: 12,
        paddingRight: 28,
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.04)',
        color: value ? '#fff' : '#555',
        fontSize: 13,
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        minWidth: 140,
      }}
    >
      {placeholder && (
        <option value="" style={{ background: '#181818' }}>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: '#181818', color: '#fff' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export function ArtistManagementPage() {
  // ── Filters state ──────────────────────────────────────
  const [search, setSearch]       = useState('')
  const [genre, setGenre]         = useState('')
  const [status, setStatus]       = useState<ArtistStatus | ''>('')
  const [sort, setSort]           = useState('createdAt_desc')
  const [page, setPage]           = useState(1)

  // ── Delete & Modal dialog state ────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [editTarget, setEditTarget]     = useState<Artist | null>(null)

  // ── Derived query params ───────────────────────────────
  const [sortBy, sortOrder] = sort.split('_') as [ArtistQueryParams['sortBy'], ArtistQueryParams['sortOrder']]

  const queryParams: ArtistQueryParams = {
    search,
    genre: genre === 'All Genres' ? '' : genre,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize: PAGE_SIZE,
  }

  // ── Data ───────────────────────────────────────────────
  const { data, isLoading } = useArtists(queryParams)
  const { data: stats }     = useArtistStats()
  const { mutateAsync: deleteArtist, isPending: isDeleting } = useDeleteArtist()
  const { mutateAsync: createArtist, isPending: isCreating } = useCreateArtist()
  const { mutateAsync: updateArtist, isPending: isUpdating } = useUpdateArtist()

  // ── Handlers ───────────────────────────────────────────
  const handleSearchChange = useCallback((v: string) => {
    setSearch(v)
    setPage(1)
  }, [])

  const handleReset = () => {
    setSearch('')
    setGenre('')
    setStatus('')
    setSort('createdAt_desc')
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteArtist(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleModalSubmit = async (data: CreateArtistInput | UpdateArtistInput) => {
    if (editTarget) {
      await updateArtist(data as UpdateArtistInput)
    } else {
      await createArtist(data as CreateArtistInput)
    }
  }

  const hasFilters = !!search || !!genre || !!status || sort !== 'createdAt_desc'

  // ── Table columns ──────────────────────────────────────
  const columns: Column<Artist>[] = [
    {
      key: 'artist',
      header: 'Artist',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ArtistAvatar name={row.stageName} avatarUrl={row.avatarUrl} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              {row.stageName}
            </div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'genre',
      header: 'Genre',
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '3px 9px',
            borderRadius: 7,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            fontSize: 11,
            fontWeight: 600,
            color: '#888',
          }}
        >
          {row.genre}
        </span>
      ),
    },
    {
      key: 'followers',
      header: 'Followers',
      align: 'right',
      render: (row) => (
        <span style={{ fontSize: 13, color: '#ccc', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {row.followers >= 1_000_000
            ? `${(row.followers / 1_000_000).toFixed(1)}M`
            : row.followers >= 1_000
            ? `${(row.followers / 1_000).toFixed(0)}K`
            : row.followers.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'albums',
      header: 'Albums',
      align: 'center',
      render: (row) => (
        <span style={{ fontSize: 13, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
          {row.albums}
        </span>
      ),
    },
    {
      key: 'songs',
      header: 'Songs',
      align: 'center',
      render: (row) => (
        <span style={{ fontSize: 13, color: '#666', fontVariantNumeric: 'tabular-nums' }}>
          {row.songs}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
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
          <ActionBtn icon={<Eye size={13} />}   title="View"   color="#3FD6FF" />
          <ActionBtn 
            icon={<Edit2 size={13} />} 
            title="Edit"   
            color="#F7B500" 
            onClick={() => {
              setEditTarget(row)
              setIsModalOpen(true)
            }}
          />
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
            <Mic2 size={20} />
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
              Artist Management
            </h1>
            <p style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
              Manage artists registered on Pulse
            </p>
          </div>
        </div>

        {/* Add Artist button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
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
          }}
          onClick={() => {
            setEditTarget(null)
            setIsModalOpen(true)
          }}
          id="btn-add-artist"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Artist
        </motion.button>
      </motion.div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={<Mic2 size={18} />}
          iconColor="#3FD6FF"
          label="Total Artists"
          value={stats?.totalArtists ?? '—'}
          trend={8}
          trendLabel="vs last month"
          delay={0.05}
        />
        <StatCard
          icon={<BadgeCheck size={18} />}
          iconColor="#3DDC84"
          label="Verified Artists"
          value={stats?.verifiedArtists ?? '—'}
          trend={5}
          trendLabel="vs last month"
          delay={0.1}
        />
        <StatCard
          icon={<Calendar size={18} />}
          iconColor="#F7B500"
          label="New This Month"
          value={stats?.newThisMonth ?? '—'}
          trend={12}
          trendLabel="vs previous month"
          delay={0.15}
        />
        <StatCard
          icon={<Users size={18} />}
          iconColor="#A78BFA"
          iconBg="rgba(167,139,250,0.08)"
          label="Total Followers"
          value={
            stats
              ? stats.totalFollowers >= 1_000_000
                ? `${(stats.totalFollowers / 1_000_000).toFixed(1)}M`
                : `${(stats.totalFollowers / 1_000).toFixed(0)}K`
              : '—'
          }
          trend={3}
          trendLabel="vs last month"
          delay={0.2}
        />
      </div>

      {/* ── Table card ────────────────────────────────── */}
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
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, genre..."
          />

          <FilterSelect
            value={genre}
            onChange={(v) => { setGenre(v); setPage(1) }}
            options={GENRES.filter((g) => g !== 'All Genres').map((g) => ({ label: g, value: g }))}
            placeholder="All Genres"
          />

          <FilterSelect
            value={status}
            onChange={(v) => { setStatus(v as ArtistStatus | ''); setPage(1) }}
            options={[
              { label: 'Verified',  value: 'verified'  },
              { label: 'Pending',   value: 'pending'   },
              { label: 'Suspended', value: 'suspended' },
            ]}
            placeholder="All Status"
          />

          <FilterSelect
            value={sort}
            onChange={(v) => { setSort(v); setPage(1) }}
            options={SORT_OPTIONS}
          />

          {hasFilters && (
            <button
              onClick={handleReset}
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
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,91,91,0.12)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,91,91,0.06)'
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
              <span style={{ color: '#555' }}>{data.total}</span> artists
            </span>
          )}
        </div>

        {/* Table */}
        <div style={{ padding: '0' }}>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            skeletonRows={PAGE_SIZE}
            emptyState={<ArtistEmptyState />}
          />
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </motion.div>

      {/* ── Confirm delete dialog ──────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Artist"
        description={`Are you sure you want to remove "${deleteTarget?.stageName}"? This action cannot be undone and will delete all associated data.`}
        confirmLabel="Remove Artist"
        cancelLabel="Keep Artist"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Add / Edit Modal ───────────────────────────── */}
      <ArtistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artist={editTarget}
        onSubmit={handleModalSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

// ─── Action icon button ───────────────────────────────────────────────────────

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
        border: `1px solid transparent`,
        background: 'transparent',
        color: '#3a3a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = `${color}12`
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = `${color}30`
        ;(e.currentTarget as HTMLButtonElement).style.color = color
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'
        ;(e.currentTarget as HTMLButtonElement).style.color = '#3a3a3a'
      }}
    >
      {icon}
    </button>
  )
}
