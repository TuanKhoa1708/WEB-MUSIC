import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, totalItems)

  // Build page numbers array with ellipsis
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
      }}
    >
      {/* Results count */}
      <span style={{ fontSize: 12, color: '#444', fontWeight: 500 }}>
        Showing{' '}
        <span style={{ color: '#888' }}>{from}–{to}</span>
        {' '}of{' '}
        <span style={{ color: '#888' }}>{totalItems.toLocaleString()}</span>{' '}
        results
      </span>

      {/* Page buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <PageBtn
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          ariaLabel="Previous page"
        >
          <ChevronLeft size={14} />
        </PageBtn>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              style={{ padding: '0 6px', color: '#333', fontSize: 13 }}
            >
              ···
            </span>
          ) : (
            <PageBtn
              key={p}
              onClick={() => onPageChange(p as number)}
              active={p === currentPage}
              ariaLabel={`Page ${p}`}
            >
              {p}
            </PageBtn>
          )
        )}

        <PageBtn
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          ariaLabel="Next page"
        >
          <ChevronRight size={14} />
        </PageBtn>
      </div>
    </div>
  )
}

// ─── Internal page button ─────────────────────────────────────────────────────

interface PageBtnProps {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  ariaLabel: string
}

function PageBtn({ children, onClick, active, disabled, ariaLabel }: PageBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        minWidth: 32,
        height: 32,
        borderRadius: 8,
        border: active
          ? '1px solid rgba(63,214,255,0.4)'
          : '1px solid rgba(255,255,255,0.06)',
        background: active ? 'rgba(63,214,255,0.1)' : 'transparent',
        color: active ? '#3FD6FF' : disabled ? '#2a2a2a' : '#666',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#aaa'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#666'
        }
      }}
    >
      {children}
    </button>
  )
}
