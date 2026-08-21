import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  header: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string
  isLoading?: boolean
  skeletonRows?: number
  emptyState?: ReactNode
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 20px' }}>
          <div
            style={{
              height: 14,
              borderRadius: 7,
              background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              width: i === 0 ? '60%' : i === cols - 1 ? '40%' : '75%',
            }}
          />
        </td>
      ))}
    </tr>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 6,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        background: '#111',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto',
          }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: '#0d0d0d',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 20px',
                    textAlign: col.align ?? 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#444',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    width: col.width,
                    userSelect: 'none',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ───────────────────────────────────────────── */}
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '64px 20px' }}>
                  {emptyState ?? (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#333',
                        fontSize: 14,
                      }}
                    >
                      No data found.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {data.map((row, index) => (
                  <motion.tr
                    key={keyExtractor(row, index)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'default',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        'rgba(255,255,255,0.025)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: '13px 20px',
                          textAlign: col.align ?? 'left',
                          fontSize: 13,
                          color: '#ccc',
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.render(row, index)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
