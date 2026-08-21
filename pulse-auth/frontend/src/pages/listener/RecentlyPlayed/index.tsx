import { Clock, Trash2 } from 'lucide-react'
import { useHistory } from '@/hooks/listener/useHistory'
import { useAuth } from '@/contexts/AuthContext'
import { SongRow } from '@/components/listener/SongRow'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import { clearHistoryService } from '@/services/history.service'
import { useQueryClient } from '@tanstack/react-query'
import { HISTORY_KEYS } from '@/hooks/listener/useHistory'
import toast from 'react-hot-toast'
import type { Song } from '@/types/song.types'
import type { History } from '@/types/history.types'

export function RecentlyPlayedPage() {
  const { user } = useAuth()
  const { data, isLoading } = useHistory(50)
  const qc = useQueryClient()

  const historyItems = data?.data ?? []
  const songs: Song[] = historyItems
    .map((h: History) => (typeof h.songId === 'object' ? h.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  const handleClear = async () => {
    if (!user?.id) return
    if (!confirm('Clear all listening history?')) return
    try {
      await clearHistoryService(user.id)
      qc.invalidateQueries({ queryKey: HISTORY_KEYS.user(user.id) })
      toast.success('History cleared.')
    } catch {
      toast.error('Failed to clear history.')
    }
  }

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(63,214,255,0.1), rgba(32,148,255,0.05))',
            border: '1px solid rgba(63,214,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={28} color="#3FD6FF88" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
              Recently Played
            </h1>
            <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>
              {songs.length} tracks
            </p>
          </div>
        </div>
        {songs.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 600,
              padding: '7px 14px', cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 size={13} /> Clear history
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          icon={<Clock size={56} />}
          title="No listening history"
          description="Songs you play will appear here."
        />
      ) : (
        <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {songs.map((song, i) => (
            <SongRow key={`${song._id}-${i}`} song={song} index={i} queue={songs} />
          ))}
        </div>
      )}
    </div>
  )
}
