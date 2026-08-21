import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Filter,
  Radio,
  Eye,
  X,
  Mail,
  Calendar,
  Clock3,
  UserCircle2,
} from 'lucide-react'
import { useListeners, useToggleListenerStatus, useListenerStats } from '@/hooks/admin/useListeners'
import { StatCard } from '@/components/admin/StatCard'
import { DataTable } from '@/components/admin/DataTable'
import type { Column } from '@/components/admin/DataTable'
import { SearchBar } from '@/components/admin/SearchBar'
import { Pagination } from '@/components/admin/Pagination'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { User, UserQueryParams } from '@/types/user.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(dateStr)
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ListenerAvatar({ user }: { user: User }) {
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user.username?.slice(0, 2).toUpperCase() ?? '?'

  // Deterministic color from username
  const colors = ['#3FD6FF', '#A78BFA', '#F7B500', '#3DDC84', '#FB923C', '#FF6B9D']
  const color = colors[(user.username?.charCodeAt(0) ?? 0) % colors.length]

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        flexShrink: 0,
        overflow: 'hidden',
        border: `1.5px solid ${color}30`,
        background: user.avatarUrl ? 'transparent' : `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      ) : (
        <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: '-0.01em' }}>
          {initials}
        </span>
      )}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 22,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 6,
        background: isActive ? 'rgba(61,220,132,0.08)' : 'rgba(255,91,91,0.08)',
        border: `1px solid ${isActive ? 'rgba(61,220,132,0.2)' : 'rgba(255,91,91,0.2)'}`,
        fontSize: 11,
        color: isActive ? '#3DDC84' : '#FF5B5B',
        fontWeight: 700,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {isActive ? (
        <CheckCircle2 size={10} />
      ) : (
        <XCircle size={10} />
      )}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Verified badge ───────────────────────────────────────────────────────────

function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  if (!isVerified) {
    return <span style={{ fontSize: 12, color: '#333' }}>—</span>
  }
  return (
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
        border: '1px solid rgba(63,214,255,0.15)',
        fontSize: 11,
        color: '#3FD6FF',
        fontWeight: 700,
      }}
    >
      <CheckCircle2 size={10} />
      Verified
    </span>
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

// ─── Filter select ────────────────────────────────────────────────────────────

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
          display: 'flex',
          alignItems: 'center',
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
          minWidth: 130,
          transition: 'all 0.15s',
          outline: 'none',
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function ListenerEmptyState({ hasFilters }: { hasFilters: boolean }) {
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
        <Users size={24} />
      </div>
      <p style={{ fontSize: 15, color: '#aaa', fontWeight: 600, marginBottom: 6 }}>
        {hasFilters ? 'No listeners match your search' : 'No listeners yet'}
      </p>
      <p style={{ fontSize: 13, color: '#444' }}>
        {hasFilters
          ? 'Try adjusting your search or filters.'
          : 'Listeners will appear here once users register.'}
      </p>
    </div>
  )
}

// ─── Listener Detail Modal ────────────────────────────────────────────────────

function ListenerDetailModal({
  user,
  isOpen,
  onClose,
}: {
  user: User | null
  isOpen: boolean
  onClose: () => void
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(480px, calc(100vw - 32px))',
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              zIndex: 1001,
              padding: 28,
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.04)',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = '#666'
              }}
            >
              <X size={14} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ flexShrink: 0 }}>
                <ListenerAvatar user={user} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.fullName}
                </div>
                <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                  @{user.username}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <StatusBadge isActive={user.isActive} />
              </div>
            </div>

            {/* Details grid */}
            <div
              style={{
                display: 'grid',
                gap: 14,
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 14,
                padding: '18px 20px',
              }}
            >
              {[
                { icon: <Mail size={13} />, label: 'Email', value: user.email },
                { icon: <UserCircle2 size={13} />, label: 'Role', value: user.role },
                {
                  icon: <CheckCircle2 size={13} />,
                  label: 'Verified',
                  value: user.isVerified ? 'Yes' : 'No',
                  valueColor: user.isVerified ? '#3FD6FF' : '#555',
                },
                {
                  icon: <Clock3 size={13} />,
                  label: 'Last Login',
                  value: user.lastLogin ? formatRelativeDate(user.lastLogin) : 'Never',
                },
                {
                  icon: <Calendar size={13} />,
                  label: 'Joined',
                  value: formatDate(user.createdAt),
                },
                {
                  icon: <Calendar size={13} />,
                  label: 'Updated',
                  value: formatDate(user.updatedAt),
                },
              ].map(({ icon, label, value, valueColor }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#444',
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: valueColor ?? '#888',
                      fontWeight: 600,
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 260,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ListenerManagementPage() {
  // ── Filter / search state ─────────────────────────────────
  const [rawKeyword, setRawKeyword] = useState('')
  const [keyword, setKeyword]       = useState('')
  const [isActive, setIsActive]     = useState('')
  const [page, setPage]             = useState(1)

  // ── Modal state ───────────────────────────────────────────
  const [detailUser, setDetailUser]       = useState<User | null>(null)
  const [isDetailOpen, setIsDetailOpen]   = useState(false)
  const [toggleTarget, setToggleTarget]   = useState<User | null>(null)

  // ── Debounce keyword (400ms) ──────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback((v: string) => {
    setRawKeyword(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setKeyword(v)
      setPage(1)
    }, 400)
  }, [])

  const handleIsActiveChange = useCallback((v: string) => {
    setIsActive(v)
    setPage(1)
  }, [])

  const handleReset = () => {
    setRawKeyword('')
    setKeyword('')
    setIsActive('')
    setPage(1)
  }

  const hasFilters = !!(rawKeyword || isActive)

  // ── Query params — role defaults to "user" on backend ─────
  const queryParams: UserQueryParams = {
    keyword,
    isActive: isActive || undefined,
    page,
    limit: PAGE_SIZE,
    // role not passed — backend defaults to "user" (listeners only)
  }

  // ── Data ──────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useListeners(queryParams)
  const { mutateAsync: toggleStatus, isPending: isToggling } = useToggleListenerStatus()
  const { data: statsData, isLoading: isLoadingStats } = useListenerStats()

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return
    await toggleStatus({ id: toggleTarget._id, isActive: !toggleTarget.isActive })
    setToggleTarget(null)
  }

  // ── Table columns ─────────────────────────────────────────
  const columns: Column<User>[] = [
    {
      key: 'listener',
      header: 'Listener',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ListenerAvatar user={row} />
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
                maxWidth: 180,
              }}
            >
              {row.fullName}
            </div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
              @{row.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            color: '#666',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            maxWidth: 220,
          }}
        >
          {row.email}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge isActive={row.isActive} />,
    },
    {
      key: 'verified',
      header: 'Verified',
      render: (row) => <VerifiedBadge isVerified={row.isVerified} />,
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (row) => (
        <span
          style={{
            fontSize: 12,
            color: '#555',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Clock3 size={11} style={{ color: '#333', flexShrink: 0 }} />
          {formatRelativeDate(row.lastLogin)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (row) => (
        <span style={{ fontSize: 12, color: '#444' }}>{formatDate(row.createdAt)}</span>
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
            title="View details"
            color="#3FD6FF"
            onClick={() => {
              setDetailUser(row)
              setIsDetailOpen(true)
            }}
          />
          <ActionBtn
            icon={
              row.isActive ? <ShieldOff size={13} /> : <ShieldCheck size={13} />
            }
            title={row.isActive ? 'Deactivate listener' : 'Reactivate listener'}
            color={row.isActive ? '#FF5B5B' : '#3DDC84'}
            onClick={() => setToggleTarget(row)}
          />
        </div>
      ),
    },
  ]

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px', minHeight: '100%' }}>

      {/* ── Page header ───────────────────────────────────── */}
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
          flexWrap: 'wrap',
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
            <Users size={20} />
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
              Listener Management
            </h1>
            <p style={{ fontSize: 13, color: '#444', marginTop: 4 }}>
              View and manage Pulse music listeners
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat card ──────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={<Users size={18} />}
          iconColor="#3FD6FF"
          label="Total Listeners"
          value={isLoadingStats ? '—' : (statsData?.totalListeners ?? '—')}
          delay={0.05}
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          iconColor="#3DDC84"
          label="Active Listeners"
          value={isLoadingStats ? '—' : (statsData?.activeListeners ?? '—')}
          delay={0.1}
        />
        <StatCard
          icon={<Filter size={18} />}
          iconColor="#F7B500"
          label="Filtered Results"
          value={isLoading ? '—' : (data?.total ?? '—')}
          delay={0.15}
        />
      </div>

      {/* ── Table card ─────────────────────────────────────── */}
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
        {/* ── Toolbar ──────────────────────────────────── */}
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
            value={rawKeyword}
            onChange={handleSearchChange}
            placeholder="Search by name, username or email..."
          />

          {/* isActive filter */}
          <FilterSelect
            id="filter-status"
            value={isActive}
            onChange={handleIsActiveChange}
            icon={<Filter size={12} />}
            placeholder="All Statuses"
          >
            <option value="true" style={{ background: '#1a1a1a' }}>Active</option>
            <option value="false" style={{ background: '#1a1a1a' }}>Inactive</option>
          </FilterSelect>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={handleReset}
              id="btn-reset-listener-filters"
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
          {!isLoading && !isError && data && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: '#333',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#555' }}>{data.total.toLocaleString()}</span> listeners
            </span>
          )}
        </div>

        {/* ── Error state ───────────────────────────────── */}
        {isError && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(255,91,91,0.08)',
                border: '1px solid rgba(255,91,91,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: '#FF5B5B',
              }}
            >
              <XCircle size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#FF5B5B', marginBottom: 6 }}>
              Unable to load listeners
            </p>
            <p style={{ fontSize: 12, color: '#444' }}>
              {(error as Error)?.message ?? 'Something went wrong. Please try again.'}
            </p>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────── */}
        {!isError && (
          <div>
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              keyExtractor={(row) => row._id}
              isLoading={isLoading}
              skeletonRows={PAGE_SIZE}
              emptyState={<ListenerEmptyState hasFilters={hasFilters} />}
            />
          </div>
        )}

        {/* ── Pagination ────────────────────────────────── */}
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

      {/* ── Listener detail modal ──────────────────────── */}
      <ListenerDetailModal
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setDetailUser(null)
        }}
      />

      {/* ── Toggle status confirm ──────────────────────── */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.isActive ? 'Deactivate Listener' : 'Reactivate Listener'}
        description={
          toggleTarget?.isActive
            ? `Deactivating "${toggleTarget?.fullName}" will prevent them from accessing their account. You can reactivate them at any time.`
            : `Reactivating "${toggleTarget?.fullName}" will restore their account access.`
        }
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Reactivate'}
        cancelLabel="Cancel"
        variant={toggleTarget?.isActive ? 'danger' : 'warning'}
        isLoading={isToggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}
