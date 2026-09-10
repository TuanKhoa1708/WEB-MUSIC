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
    <div className="px-6 md:px-8 lg:px-10 pt-8 md:pt-10 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl lg:text-[28px] font-black text-white m-0 mb-5 tracking-[-0.03em]">
          My Library
        </h1>

        {/* Tab bar */}
        <div className="flex gap-1 bg-[#111] rounded-xl p-1 w-fit border border-white/5">
          {(['favorites', 'history'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-[7px] rounded-lg border-none text-[13px] font-semibold cursor-pointer transition-all duration-200 capitalize ${
                activeTab === tab ? 'bg-[#3FD6FF]/10 text-[#3FD6FF]' : 'bg-transparent text-[#666] hover:text-[#ccc]'
              }`}
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
            <div className="bg-[#0d0d0d] rounded-[14px] border border-white/5 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : favSongs.length === 0 ? (
            <EmptyState
              icon={<Heart size={48} />}
              title="No favorites yet"
              description="Heart songs you love to see them here."
            />
          ) : (
            <div className="bg-[#0d0d0d] rounded-[14px] border border-white/5 overflow-hidden">
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
            <div className="bg-[#0d0d0d] rounded-[14px] border border-white/5 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : historySongs.length === 0 ? (
            <EmptyState
              icon={<Music2 size={48} />}
              title="No history yet"
              description="Start listening to music — your history will appear here."
            />
          ) : (
            <div className="bg-[#0d0d0d] rounded-[14px] border border-white/5 overflow-hidden">
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
