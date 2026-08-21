import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon } from 'lucide-react'
import { useSearch } from '@/hooks/listener/useSearch'
import { SongRow } from '@/components/listener/SongRow'
import { AlbumCard } from '@/components/listener/AlbumCard'
import { ArtistCard } from '@/components/listener/ArtistCard'
import { PlaylistCard } from '@/components/listener/PlaylistCard'
import { SectionHeader } from '@/components/listener/SectionHeader'
import { SkeletonCard, SkeletonRow } from '@/components/listener/SkeletonCard'
import { EmptyState } from '@/components/listener/EmptyState'
import { useSongs } from '@/hooks/listener/useSongs'

// ─── Genre Chips ─────────────────────────────────────────────────────────────

const GENRES = ['Pop', 'R&B', 'Hip-Hop', 'Electronic', 'Rock', 'Jazz', 'Classical', 'Indie', 'Lo-fi', 'K-Pop']

const GRID_4: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }
const GRID_6: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(urlQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [urlQuery])

  const { songs, albums, artists, playlists, isLoading, hasResults } = useSearch(debouncedQuery)

  // Suggested genres (no query)
  const { data: genreSongs } = useSongs({ limit: 4 })
  const allSongs = songs.data?.data ?? []

  return (
    <div style={{ padding: '32px 32px 0', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
          Search
        </h1>
      </div>

      {/* No query — genre browse */}
      {!debouncedQuery && (
        <>
          <section style={{ marginBottom: 40 }}>
            <SectionHeader title="Browse by Genre" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {GENRES.map((genre, i) => (
                <GenreChip
                  key={genre}
                  genre={genre}
                  index={i}
                  onClick={() => setSearchParams({ q: genre })}
                />
              ))}
            </div>
          </section>

          {genreSongs?.data && genreSongs.data.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHeader title="Trending Now" />
              <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                {genreSongs.data.map((song, i) => (
                  <SongRow key={song._id} song={song} index={i} queue={genreSongs.data} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Loading */}
      {debouncedQuery && isLoading && (
        <div>
          <SkeletonSection rows={4} />
          <SkeletonSection cols={4} />
        </div>
      )}

      {/* No results */}
      {debouncedQuery && !isLoading && !hasResults && (
        <EmptyState
          icon={<SearchIcon size={48} />}
          title={`No results for "${debouncedQuery}"`}
          description="Try different keywords or check the spelling."
        />
      )}

      {/* Results */}
      {debouncedQuery && !isLoading && hasResults && (
        <>
          {/* Songs */}
          {allSongs.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHeader title="Songs" subtitle={`${songs.data?.total ?? 0} results`} />
              <div style={{ background: '#0d0d0d', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                {allSongs.map((song, i) => (
                  <SongRow key={song._id} song={song} index={i} queue={allSongs} showAlbum />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(artists.data?.data?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHeader title="Artists" />
              <div style={GRID_6}>
                {artists.data!.data.map((artist, i) => (
                  <ArtistCard key={artist._id} artist={artist} delay={i * 0.04} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(albums.data?.data?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHeader title="Albums" />
              <div style={GRID_4}>
                {albums.data!.data.map((album, i) => (
                  <AlbumCard key={album._id} album={album} delay={i * 0.04} />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(playlists.data?.data?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 40 }}>
              <SectionHeader title="Playlists" />
              <div style={GRID_4}>
                {playlists.data!.data.map((pl, i) => (
                  <PlaylistCard key={pl._id} playlist={pl} delay={i * 0.04} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

// ─── Genre Chip ──────────────────────────────────────────────────────────────

const GENRE_COLORS = [
  ['#1a3a1a', '#3FD6FF'],
  ['#1a1a3a', '#8B5CF6'],
  ['#3a1a1a', '#f87171'],
  ['#3a2a1a', '#fb923c'],
  ['#1a2a3a', '#60a5fa'],
  ['#2a1a3a', '#c084fc'],
  ['#1a3a2a', '#34d399'],
  ['#3a3a1a', '#facc15'],
  ['#2a2a2a', '#94a3b8'],
  ['#3a1a2a', '#f472b6'],
]

function GenreChip({ genre, index, onClick }: { genre: string; index: number; onClick: () => void }) {
  const [bg, accent] = GENRE_COLORS[index % GENRE_COLORS.length]
  return (
    <div
      onClick={onClick}
      style={{
        height: 72,
        borderRadius: 12,
        background: bg,
        border: `1px solid ${accent}22`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        color: accent,
        cursor: 'pointer',
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)'
        e.currentTarget.style.borderColor = `${accent}55`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.borderColor = `${accent}22`
      }}
    >
      {genre}
    </div>
  )
}

// ─── Skeleton sections ────────────────────────────────────────────────────────

function SkeletonSection({ rows, cols }: { rows?: number; cols?: number }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ width: 80, height: 14, borderRadius: 4, background: '#1e1e1e', marginBottom: 16 }} />
      {rows && (
        <div style={{ background: '#0d0d0d', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}
      {cols && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {Array.from({ length: cols }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
    </section>
  )
}
