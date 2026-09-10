import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Shuffle, Disc3, Crown, Lock } from 'lucide-react'
import { useAlbumDetail } from '@/hooks/listener/useAlbums'
import { useSongs } from '@/hooks/listener/useSongs'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import { PremiumUpgradeModal, usePremiumModal } from '@/components/premium/PremiumUpgradeModal'
import { useIsPremium } from '@/hooks/listener/useSubscription'
import type { Song } from '@/types/song.types'

// Free users can preview this many songs before being gated
const FREE_PREVIEW_LIMIT = 3

function getTotalDuration(songs: Song[]): string {
  const total = songs.reduce((acc, s) => acc + (s.duration || 0), 0)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()
  const isPremium = useIsPremium()
  const { isOpen: modalOpen, config: modalConfig, openModal, closeModal } = usePremiumModal()

  const { data: album, isLoading: albumLoading } = useAlbumDetail(id!)
  const { data: songsData, isLoading: songsLoading } = useSongs({ limit: 100 })

  const albumSongs = (songsData?.data ?? []).filter((song) => {
    if (typeof song.albumId === 'object' && song.albumId !== null) {
      return (song.albumId as any)._id === id
    }
    return song.albumId === id
  })

  const isGated = !isPremium && albumSongs.length > FREE_PREVIEW_LIMIT

  const handlePlayAll = () => {
    if (isGated) {
      openModal(
        'Full Album Access',
        `Free accounts can only preview the first ${FREE_PREVIEW_LIMIT} songs. Upgrade to Premium to listen to the full album.`
      )
      return
    }
    if (albumSongs.length > 0) playSong(albumSongs[0], albumSongs)
  }

  const handleShuffle = () => {
    if (isGated) {
      openModal(
        'Full Album Access',
        `Free accounts can only preview the first ${FREE_PREVIEW_LIMIT} songs. Upgrade to Premium to shuffle the full album.`
      )
      return
    }
    const shuffled = [...albumSongs].sort(() => Math.random() - 0.5)
    if (shuffled.length > 0) playSong(shuffled[0], shuffled)
  }

  if (albumLoading) {
    return (
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-8 md:pt-10 max-w-[1000px] mx-auto">
        <div className="h-44 bg-[#111] rounded-2xl mb-6" />
        {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (!album) {
    return <EmptyState icon={<Disc3 size={48} />} title="Album not found" />
  }

  const artistName = album.artistId
    ? typeof album.artistId === 'object' ? (album.artistId as any).stageName : 'Unknown Artist'
    : 'Unknown Artist'

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

        {/* Album header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mb-8 md:mb-9 text-center sm:text-left">
          {/* Cover */}
          <div className="w-32 h-32 sm:w-40 sm:h-44 rounded-2xl flex-shrink-0 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] shadow-lg flex items-center justify-center overflow-hidden">
            {album.coverUrl ? (
              <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <Disc3 size={52} className="text-[#333]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#555] uppercase tracking-widest mb-1">Album</p>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white mb-2 tracking-tight leading-tight">
              {album.title}
            </h1>
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start text-[#555] text-xs sm:text-sm mb-2">
              <span className="text-[#ddd] font-semibold">{artistName}</span>
              {album.releaseYear && <><span>•</span><span>{album.releaseYear}</span></>}
              {albumSongs.length > 0 && (
                <><span>•</span><span>{albumSongs.length} songs, {getTotalDuration(albumSongs)}</span></>
              )}
            </div>

            {/* Free tier notice */}
            {isGated && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-3 bg-[#FFB900]/10 border border-[#FFB900]/20">
                <Lock size={11} color="#FFB900" />
                <span className="text-[11px] text-[#FFB900] font-semibold">
                  Preview: {FREE_PREVIEW_LIMIT} of {albumSongs.length} songs · Upgrade to unlock all
                </span>
              </div>
            )}

            {/* Buttons */}
            {albumSongs.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2">
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

                {/* Upgrade CTA */}
                {isGated && (
                  <button
                    onClick={() => openModal('Full Album Access', `Listen to all ${albumSongs.length} songs with Premium.`)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#FFB900]/15 to-[#FF8C00]/10 border border-[#FFB900]/30 hover:border-[#FFB900]/50 rounded-xl text-[#FFB900] text-xs font-bold px-3.5 py-2.5 cursor-pointer transition-colors"
                  >
                    <Crown size={13} /> Unlock All
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Songs */}
        {songsLoading ? (
          <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : albumSongs.length === 0 ? (
          <EmptyState icon={<Disc3 size={48} />} title="No songs in this album yet" />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_32px] sm:grid-cols-[40px_1fr_80px_60px_32px_32px] gap-3 px-3 pb-2 border-b border-white/5 mb-1">
              <span className="text-[11px] text-[#444] text-center">#</span>
              <span className="text-[11px] text-[#444]">Title</span>
              <span className="hidden sm:block text-[11px] text-[#444] text-right">Duration</span>
              <span className="hidden sm:block" />
              <span />
              <span />
            </div>
            <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
              {albumSongs.map((song, i) => (
                <SongRow
                  key={song._id}
                  song={song}
                  index={i}
                  queue={albumSongs}
                  locked={!isPremium && i >= FREE_PREVIEW_LIMIT}
                />
              ))}

              {/* Premium upsell at bottom when gated */}
              {isGated && (
                <div className="flex items-center justify-center gap-3 p-[20px_16px] bg-gradient-to-b from-transparent to-[#FFB900]/5 border-t border-[#FFB900]/10">
                  <Crown size={16} color="#FFB900" />
                  <span className="text-[13px] text-[#888]">
                    {albumSongs.length - FREE_PREVIEW_LIMIT} more songs locked
                  </span>
                  <button
                    onClick={() => openModal('Full Album Access', `Listen to all ${albumSongs.length} songs with Premium.`)}
                    className="flex items-center gap-1.5 bg-gradient-to-br from-[#FFB900] to-[#FF8C00] border-none rounded-lg text-black text-xs font-extrabold px-3.5 py-[7px] cursor-pointer"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
