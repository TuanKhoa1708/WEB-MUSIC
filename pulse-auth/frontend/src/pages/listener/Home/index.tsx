import { useAuth } from '@/contexts/AuthContext'
import { useSongs, useRecommendations } from '@/hooks/listener/useSongs'
import { useAlbumsList } from '@/hooks/listener/useAlbums'
import { useArtistsList } from '@/hooks/listener/useArtists'
import { useHistory } from '@/hooks/listener/useHistory'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongCard } from '@/components/listener/SongCard'
import { AlbumCard } from '@/components/listener/AlbumCard'
import { ArtistCard } from '@/components/listener/ArtistCard'
import { SectionHeader } from '@/components/listener/SectionHeader'
import { SkeletonCard } from '@/components/listener/SkeletonCard'
import type { Song } from '@/types/song.types'
import type { History } from '@/types/history.types'
import { Play, Music2 } from 'lucide-react'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// Đã loại bỏ GRID_STYLE vì sẽ dùng trực tiếp class của Tailwind

export function HomePage() {
  const { user } = useAuth()

  // Data fetching
  const { data: recommendations, isLoading: recsLoading } = useRecommendations()
  const { data: newSongs, isLoading: songsLoading } = useSongs({ limit: 6 })
  const { data: albums, isLoading: albumsLoading } = useAlbumsList({ limit: 6 })
  const { data: artists, isLoading: artistsLoading } = useArtistsList({ limit: 6 })
  const { data: history } = useHistory(8)

  const songs = newSongs?.data ?? []
  const recentHistory = history?.data ?? []

  // Get songs from history
  const recentSongs: Song[] = recentHistory
    .map((h: History) => (typeof h.songId === 'object' ? h.songId as unknown as Song : null))
    .filter(Boolean) as Song[]

  return (
    <div
      style={{ padding: "clamp(16px, 3vw, 28px)", minHeight: "100%" }}
    >
      {/* Greeting */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <h1
          className="text-2xl md:text-3xl lg:text-[32px]"
          style={{ fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}
        >
          {getGreeting()}{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
        </h1>
        <p style={{ fontSize: 15, color: '#555', margin: '8px 0 0' }}>
          Discover new music and enjoy your favorites
        </p>
      </div>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section className="mb-8 md:mb-10">
          <SectionHeader
            title="Recently Played"
            seeAllLink="/listener/history"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {recentSongs.slice(0, 6).map((song, i) => (
              <QuickPlayCard key={`${song._id}-${i}`} song={song} queue={recentSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended for You */}
      {(recsLoading || (recommendations?.data?.length ?? 0) > 0) && (
        <section className="mb-8 md:mb-10">
          <SectionHeader
            title="AI Recommended for You"
            subtitle="Based on your listening history"
            seeAllLink="/listener/search"
          />
          {recsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {recommendations!.data.slice(0, 6).map((song, i) => (
                <SongCard key={song._id} song={song} queue={recommendations!.data} delay={i * 0.05} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* New Releases */}
      <section className="mb-8 md:mb-10">
        <SectionHeader
          title="New Releases"
          subtitle="Fresh tracks just added"
          seeAllLink="/listener/search"
        />
        {songsLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {songs.map((song, i) => (
              <SongCard key={song._id} song={song} queue={songs} delay={i * 0.05} />
            ))}
          </div>
        )}
      </section>

      {/* Albums */}
      {(albumsLoading || (albums?.data?.length ?? 0) > 0) && (
        <section className="mb-8 md:mb-10">
          <SectionHeader
            title="Albums"
            seeAllLink="/listener/search"
          />
          {albumsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {albums!.data.map((album, i) => (
                <AlbumCard key={album._id} album={album} delay={i * 0.05} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Artists */}
      {(artistsLoading || (artists?.data?.length ?? 0) > 0) && (
        <section className="mb-8 md:mb-10">
          <SectionHeader
            title="Artists"
            seeAllLink="/listener/search"
          />
          {artistsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {artists!.data.map((artist, i) => (
                <ArtistCard key={artist._id} artist={artist} delay={i * 0.05} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ─── Quick play card ─────────────────────────────────

function QuickPlayCard({ song, queue }: { song: Song; queue: Song[] }) {
  const { playSong, currentSong } = useMusicPlayer()
  const isCurrent = currentSong?._id === song._id

  function getArtistName(song: Song): string {
    if (!song.artistId) return ''
    if (typeof song.artistId === 'object') return song.artistId.stageName
    return ''
  }

  return (
    <div
      onClick={() => playSong(song, queue)}
      className="group flex items-center gap-3 p-2 rounded-[10px] cursor-pointer relative overflow-hidden transition-colors duration-200"
      style={{
        background: isCurrent ? 'rgba(63,214,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: isCurrent ? '1px solid rgba(63,214,255,0.15)' : '1px solid rgba(255,255,255,0.04)',
      }}
      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a' }}>
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
            <Music2 size={18} />
          </div>
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? '#3FD6FF' : '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.title}
        </p>
        <p style={{ fontSize: 11, color: '#555', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {getArtistName(song)}
        </p>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isCurrent ? '#3FD6FF' : 'rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        <Play size={13} fill={isCurrent ? '#000' : '#fff'} color={isCurrent ? '#000' : '#fff'} style={{ marginLeft: 2 }} />
      </div>
    </div>
  )
}