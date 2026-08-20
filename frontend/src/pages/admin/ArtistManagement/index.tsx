import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Mic2,
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
import type { Artist, ArtistQueryParams, CreateArtistInput, UpdateArtistInput } from '@/types/artist.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Avatar initials ──────────────────────────────────────────────────────────

function ArtistAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const colors = ['#3FD6FF', '#3DDC84', '#F7B500', '#FF5B5B', '#A78BFA', '#FB923C']
  const color = name ? colors[name.charCodeAt(0) % colors.length] : '#3FD6FF'

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

// ─── Main page component ──────────────────────────────────────────────────────

export function ArtistManagementPage() {
  // ── Filters state ──────────────────────────────────────
  const [keyword, setKeyword]       = useState('')
  const [page, setPage]           = useState(1)

  // ── Delete & Modal dialog state ────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [editTarget, setEditTarget]     = useState<Artist | null>(null)

  const queryParams: ArtistQueryParams = {
    keyword,
    page,
    limit: PAGE_SIZE,
  }

  // ── Data ───────────────────────────────────────────────
  const { data, isLoading } = useArtists(queryParams)
  const { data: stats }     = useArtistStats()
  const { mutateAsync: deleteArtist, isPending: isDeleting } = useDeleteArtist()
  const { mutateAsync: createArtist, isPending: isCreating } = useCreateArtist()
  const { mutateAsync: updateArtist, isPending: isUpdating } = useUpdateArtist()

  // ── Handlers ───────────────────────────────────────────
  const handleSearchChange = useCallback((v: string) => {
    setKeyword(v)
    setPage(1)
  }, [])

  const handleReset = () => {
    setKeyword('')
    setPage(1)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteArtist(deleteTarget._id)
    setDeleteTarget(null)
  }

  const handleModalSubmit = async (formData: CreateArtistInput | UpdateArtistInput) => {
    if (editTarget) {
      await updateArtist(formData as UpdateArtistInput)
    } else {
      await createArtist(formData as CreateArtistInput)
    }
  }

  const hasFilters = !!keyword

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
          </div>
        </div>
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
      key: 'socialLinks',
      header: 'Social Links',
      align: 'center',
      render: (row) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {row.socialLinks?.facebook && <span style={{ color: '#1877F2', fontSize: 12 }}>FB</span>}
          {row.socialLinks?.instagram && <span style={{ color: '#E4405F', fontSize: 12 }}>IG</span>}
          {row.socialLinks?.youtube && <span style={{ color: '#FF0000', fontSize: 12 }}>YT</span>}
        </div>
      ),
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
            value={keyword}
            onChange={handleSearchChange}
            placeholder="Search by stage name..."
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
            keyExtractor={(row) => row._id}
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
              pageSize={PAGE_SIZE}
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
