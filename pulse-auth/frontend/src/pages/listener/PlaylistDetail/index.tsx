import { useState } from 'react'
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

// Free users can preview this many songs before being gated
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
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ height: 180, background: '#111', borderRadius: 16, marginBottom: 24 }} />
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    )
  }

  if (!playlist) return null

  const isGated = !isPremium && songs.length > FREE_PREVIEW_LIMIT
  const lockedFrom = FREE_PREVIEW_LIMIT // index from which songs are locked

  return (
    <>
      <PremiumUpgradeModal
        isOpen={modalOpen}
        onClose={closeModal}
        feature={modalConfig.feature}
        description={modalConfig.description}
      />

      <div style={{ padding: '32px 32px 0', maxWidth: 1000, margin: '0 auto' }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 36 }}>
          {/* Cover */}
          <div style={{
            width: 160, height: 160, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(63,214,255,0.08), rgba(32,148,255,0.04))',
            border: '1px solid rgba(63,214,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <ListMusic size={52} color="#3FD6FF22" />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Playlist</p>

            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.04em' }}>
              {playlist.title}
            </h1>

            <p style={{ fontSize: 13, color: '#555', margin: '0 0 4px' }}>
              {songs.length} songs
            </p>

            {/* Free tier notice */}
            {isGated && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 8, marginBottom: 12,
                background: 'rgba(255,185,0,0.08)',
                border: '1px solid rgba(255,185,0,0.2)',
              }}>
                <Lock size={11} color="#FFB900" />
                <span style={{ fontSize: 11, color: '#FFB900', fontWeight: 600 }}>
                  Preview: {FREE_PREVIEW_LIMIT} of {songs.length} songs · Upgrade to unlock all
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {songs.length > 0 && (
                <>
                  <button
                    onClick={handlePlayAll}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: '#3FD6FF', border: 'none', borderRadius: 10,
                      color: '#000', fontSize: 13, fontWeight: 700, padding: '9px 18px', cursor: 'pointer',
                    }}
                  >
                    <Play size={15} fill="#000" /> Play
                  </button>
                  <button
                    onClick={handleShuffle}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, color: '#ddd', fontSize: 13, fontWeight: 600,
                      padding: '9px 18px', cursor: 'pointer',
                    }}
                  >
                    <Shuffle size={14} /> Shuffle
                  </button>

                  {/* Upgrade CTA for free users */}
                  {isGated && (
                    <button
                      onClick={() => openModal('Full Playlist Access', `Listen to all ${songs.length} songs with Premium.`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'linear-gradient(135deg, rgba(255,185,0,0.12), rgba(255,140,0,0.06))',
                        border: '1px solid rgba(255,185,0,0.3)',
                        borderRadius: 10, color: '#FFB900', fontSize: 12, fontWeight: 700,
                        padding: '9px 16px', cursor: 'pointer',
                      }}
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
          <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : songs.length === 0 ? (
          <EmptyState icon={<ListMusic size={48} />} title="This playlist is empty" description="Search for songs and add them to this playlist." />
        ) : (
          <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            {(playlistSongs ?? []).map((ps: PlaylistSong, i: number) => {
              const song = typeof ps.songId === 'object' ? ps.songId as unknown as Song : null
              if (!song) return null
              const isLocked = !isPremium && i >= lockedFrom
              return (
                <div key={ps._id} style={{ display: 'grid', gridTemplateColumns: '1fr 32px', alignItems: 'center' }}>
                  <SongRow song={song} index={i} queue={songs} locked={isLocked} />
                </div>
              )
            })}

            {/* Premium upsell at bottom when gated */}
            {isGated && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '20px 16px',
                background: 'linear-gradient(180deg, transparent, rgba(255,185,0,0.04))',
                borderTop: '1px solid rgba(255,185,0,0.1)',
              }}>
                <Crown size={16} color="#FFB900" />
                <span style={{ fontSize: 13, color: '#888' }}>
                  {songs.length - FREE_PREVIEW_LIMIT} more songs locked
                </span>
                <button
                  onClick={() => openModal('Full Playlist Access', `Listen to all ${songs.length} songs with Premium.`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(135deg, #FFB900, #FF8C00)',
                    border: 'none', borderRadius: 8,
                    color: '#000', fontSize: 12, fontWeight: 800,
                    padding: '7px 14px', cursor: 'pointer',
                  }}
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
