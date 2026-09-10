import { useState } from 'react'
import { Heart, Music2 } from 'lucide-react'
import { useFavoriteContext } from '@/contexts/FavoriteContext'
import { useHistory } from '@/hooks/listener/useHistory'
import { SongRow } from '@/components/listener/SongRow'
import { SectionHeader } from '@/components/listener/SectionHeader'
import { EmptyState } from '@/components/listener/EmptyState'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import type { Song } from '@/types/song.types'
import type { History } from '@/types/history.types'
type Tab = 'favorites' | 'history'

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('favorites')

  const { favorites, isLoading: favLoading } = useFavoriteContext()



  const { data: historyData, isLoading: historyLoading } = useHistory(20)
  const historyItems = historyData?.data ?? []

  // Favorite songs
  const favSongs: Song[] = favorites
    .map((f) => (typeof f.songId === 'object' ? f.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  // History songs
  const historySongs: Song[] = historyItems
    .map((h: History) => (typeof h.songId === 'object' ? h.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
          My Library
        </h1>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: '#111', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
          {(['favorites', 'history'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '7px 16px',
                borderRadius: 9,
                border: 'none',
                background: activeTab === tab ? 'rgba(63,214,255,0.12)' : 'transparent',
                color: activeTab === tab ? '#3FD6FF' : '#666',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}


      {activeTab === 'favorites' && (
        <section>
          <SectionHeader
            title="Favorite Songs"
            subtitle={`${favSongs.length} songs`}
            seeAllLink="/listener/favorites"
          />
          {favLoading ? (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : favSongs.length === 0 ? (
            <EmptyState
              icon={<Heart size={48} />}
              title="No favorites yet"
              description="Heart songs you love to see them here."
            />
          ) : (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {favSongs.map((song, i) => (
                <SongRow key={song._id} song={song} index={i} queue={favSongs} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section>
          <SectionHeader
            title="Recently Played"
            subtitle={`${historySongs.length} tracks`}
            seeAllLink="/listener/history"
          />
          {historyLoading ? (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : historySongs.length === 0 ? (
            <EmptyState
              icon={<Music2 size={48} />}
              title="No history yet"
              description="Start listening to music — your history will appear here."
            />
          ) : (
            <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {historySongs.map((song, i) => (
                <SongRow key={`${song._id}-${i}`} song={song} index={i} queue={historySongs} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
