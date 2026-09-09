import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle, ListMusic, Crown, Lock } from 'lucide-react'
import { usePlaylistDetail, usePlaylistSongs } from '@/hooks/listener/usePlaylists'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import { PremiumUpgradeModal, usePremiumModal } from '@/components/premium/PremiumUpgradeModal'
import { useIsPremium } from '@/hooks/listener/useSubscription'
import type { Song } from '@/types/song.types'
import type { PlaylistSong } from '@/types/playlist.types'

const FREE_PREVIEW_LIMIT = 3

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()
  const isPremium = useIsPremium()
  const { isOpen: modalOpen, config: modalConfig, openModal, closeModal } = usePremiumModal()

  const { data: playlist, isLoading: playlistLoading } = usePlaylistDetail(id!)
  const { data: playlistSongs, isLoading: songsLoading } = usePlaylistSongs(id!)

  const songs: Song[] = (playlistSongs ?? [])
    .map((ps: PlaylistSong) => (typeof ps.songId === 'object' ? ps.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  const handlePlayAll = () => {
    if (!isPremium && songs.length > FREE_PREVIEW_LIMIT) {
      openModal(
        'Full Playlist Access',
        `Free accounts can only preview the first ${FREE_PREVIEW_LIMIT} songs. Upgrade to Premium to listen to the full playlist.`
      )
      return
    }
    if (songs.length > 0) playSong(songs[0], songs)
  }

  const handleShuffle = () => {
    if (!isPremium && songs.length > FREE_PREVIEW_LIMIT) {
      openModal(
        'Full Playlist Access',
        `Free accounts can only preview the first ${FREE_PREVIEW_LIMIT} songs. Upgrade to Premium to shuffle the full playlist.`
      )
      return
    }
    const shuffled = [...songs].sort(() => Math.random() - 0.5)
    if (shuffled.length > 0) playSong(shuffled[0], shuffled)
  }

  if (playlistLoading) {
    return (
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-8 md:pt-10 max-w-[1000px] mx-auto">
        <div className="h-44 bg-[#111] rounded-2xl mb-6" />
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (!playlist) return null

  const isGated = !isPremium && songs.length > FREE_PREVIEW_LIMIT
  const lockedFrom = FREE_PREVIEW_LIMIT

  return (
    <>
      <PremiumUpgradeModal
        isOpen={modalOpen}
        onClose={closeModal}
        feature={modalConfig.feature}
        description={modalConfig.description}
      />

      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-8 md:pt-10 pb-8 max-w-[1000px] mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-none border-none text-[#666] hover:text-white text-xs md:text-sm cursor-pointer mb-6 p-0 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-8 md:mb-9 text-center sm:text-left">
          {/* Cover */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex-shrink-0 bg-gradient-to-br from-[#3FD6FF]/10 to-[#2094ff]/5 border border-[#3FD6FF]/10 flex items-center justify-center overflow-hidden shadow-lg">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
            ) : (
              <ListMusic size={52} className="text-[#3FD6FF]/20" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#555] uppercase tracking-widest mb-1">Playlist</p>

            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white mb-2 tracking-tight leading-tight">
              {playlist.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#555] mb-3">
              {songs.length} songs
            </p>

            {/* Free tier notice */}
            {isGated && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3 bg-[#FFB900]/10 border border-[#FFB900]/20">
                <Lock size={11} className="text-[#FFB900]" />
                <span className="text-[11px] text-[#FFB900] font-semibold">
                  Preview: {FREE_PREVIEW_LIMIT} of {songs.length} songs · Upgrade to unlock all
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {songs.length > 0 && (
                <>
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-2 bg-[#3FD6FF] hover:bg-[#2094ff] border-none rounded-xl text-black text-xs sm:text-sm font-bold px-4 py-2.5 cursor-pointer transition-colors"
                  >
                    <Play size={15} fill="#000" /> Play
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[#ddd] text-xs sm:text-sm font-semibold px-4 py-2.5 cursor-pointer transition-colors"
                  >
                    <Shuffle size={14} /> Shuffle
                  </button>

                  {/* Upgrade CTA for free users */}
                  {isGated && (
                    <button
                      onClick={() => openModal('Full Playlist Access', `Listen to all ${songs.length} songs with Premium.`)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-[#FFB900]/15 to-[#FF8C00]/10 border border-[#FFB900]/30 hover:border-[#FFB900]/50 rounded-xl text-[#FFB900] text-xs font-bold px-3.5 py-2.5 cursor-pointer transition-colors"
                    >
                      <Crown size={13} /> Unlock All
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Songs */}
        {songsLoading ? (
          <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : songs.length === 0 ? (
          <EmptyState icon={<ListMusic size={48} />} title="This playlist is empty" description="Search for songs and add them to this playlist." />
        ) : (
          <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
            {(playlistSongs ?? []).map((ps: PlaylistSong, i: number) => {
              const song = typeof ps.songId === 'object' ? ps.songId as unknown as Song : null
              if (!song) return null
              const isLocked = !isPremium && i >= lockedFrom
              return (
                <div key={ps._id} className="grid grid-cols-[1fr_auto] items-center">
                  <SongRow song={song} index={i} queue={songs} locked={isLocked} />
                </div>
              )
            })}

            {/* Premium upsell at bottom when gated */}
            {isGated && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-5 bg-gradient-to-b from-transparent to-[#FFB900]/5 border-t border-[#FFB900]/10 text-center">
                <div className="flex items-center gap-2">
                  <Crown size={16} className="text-[#FFB900]" />
                  <span className="text-xs sm:text-sm text-[#888]">
                    {songs.length - FREE_PREVIEW_LIMIT} more songs locked
                  </span>
                </div>
                <button
                  onClick={() => openModal('Full Playlist Access', `Listen to all ${songs.length} songs with Premium.`)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-[#FFB900] to-[#FF8C00] hover:brightness-110 border-none rounded-lg text-black text-xs font-extrabold px-3.5 py-2 cursor-pointer transition-all"
                >
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}