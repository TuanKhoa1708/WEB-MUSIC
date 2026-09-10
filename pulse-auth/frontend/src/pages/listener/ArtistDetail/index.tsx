import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, User2 } from 'lucide-react'
import { useArtistDetail } from '@/hooks/listener/useArtists'
import { useSongs } from '@/hooks/listener/useSongs'
import { useAlbumsList } from '@/hooks/listener/useAlbums'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { SongRow } from '@/components/listener/SongRow'
import { AlbumCard } from '@/components/listener/AlbumCard'
import { SectionHeader } from '@/components/listener/SectionHeader'

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()

  const { data: artist, isLoading: artistLoading } = useArtistDetail(id!)
  const { data: allSongs } = useSongs({ limit: 100, artistId: id })
  const { data: allAlbums } = useAlbumsList({ limit: 50 })

  const artistSongs = allSongs?.data ?? []
  const artistAlbums = (allAlbums?.data ?? []).filter((album) => {
    const aid = typeof album.artistId === 'object' ? (album.artistId as any)._id : album.artistId
    return aid === id
  })

  if (artistLoading) {
    return (
      <div className="px-6 md:px-8 lg:px-10 pt-8 md:pt-10 max-w-[1000px] mx-auto">
        <div className="h-60 bg-[#111] rounded-2xl mb-6" />
      </div>
    )
  }

  if (!artist) return null

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Hero banner */}
      <div 
        className="relative h-[260px] md:h-[300px] rounded-b-3xl overflow-hidden"
        style={{
          background: artist.coverImage
            ? `url(${artist.coverImage}) center/cover no-repeat`
            : 'linear-gradient(135deg, #0d1a2e 0%, #0a0a0a 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/90 to-black" />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 border-none rounded-lg text-[#ddd] text-xs cursor-pointer px-3 py-1.5 backdrop-blur-md transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Artist info */}
        <div className="absolute bottom-6 left-6 flex items-end gap-5">
          {/* Avatar */}
          <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden bg-gradient-to-br from-[#1a2a3a] to-[#0a0a1a] border-[3px] border-[#3FD6FF]/20 flex items-center justify-center shrink-0">
            {artist.avatarUrl ? (
              <img src={artist.avatarUrl} alt={artist.stageName} className="w-full h-full object-cover" />
            ) : (
              <User2 size={40} className="text-[#3FD6FF]/20" />
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#3FD6FF] uppercase tracking-widest mb-1">Artist</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
              {artist.stageName}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#888] m-0">
              {artistSongs.length} songs • {artistAlbums.length} albums
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 pt-8">
        {/* Bio */}
        {artist.bio && (
          <p className="text-sm text-[#777] leading-relaxed mb-8 max-w-[600px]">
            {artist.bio}
          </p>
        )}

        {/* Play button */}
        {artistSongs.length > 0 && (
          <div className="flex gap-2.5 mb-9">
            <button
              onClick={() => playSong(artistSongs[0], artistSongs)}
              className="flex items-center gap-2 bg-[#3FD6FF] hover:bg-[#2094ff] border-none rounded-[10px] text-black text-sm font-bold px-[22px] py-2.5 cursor-pointer transition-colors"
            >
              <Play size={16} fill="#000" /> Play All
            </button>
          </div>
        )}

        {/* Songs */}
        {artistSongs.length > 0 && (
          <section className="mb-10">
            <SectionHeader title="Popular Songs" />
            <div className="bg-[#0d0d0d] rounded-2xl border border-white/5 overflow-hidden">
              {artistSongs.map((song, i) => (
                <SongRow key={song._id} song={song} index={i} queue={artistSongs} showAlbum />
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {artistAlbums.length > 0 && (
          <section className="mb-10">
            <SectionHeader title="Albums" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {artistAlbums.map((album, i) => (
                <AlbumCard key={album._id} album={album} delay={i * 0.05} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
