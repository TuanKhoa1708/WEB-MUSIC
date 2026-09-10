import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Disc3 } from 'lucide-react'
import type { Album } from '@/types/album.types'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

interface AlbumCardProps {
  album: Album & { songs?: any[] }
  delay?: number
  onClick?: () => void
}

function getArtistName(album: Album): string {
  if (!album.artistId) return 'Unknown Artist'
  if (typeof album.artistId === 'object') return album.artistId.stageName
  return 'Unknown Artist'
}

export function AlbumCard({ album, delay = 0, onClick }: AlbumCardProps) {
  const navigate = useNavigate()
  const { playSong } = useMusicPlayer()

  const handleClick = () => {
    if (onClick) onClick()
    else navigate(`/listener/albums/${album._id}`)
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    // If album has songs loaded, play first one
    if (album.songs && album.songs.length > 0) {
      playSong(album.songs[0], album.songs)
    } else {
      navigate(`/listener/albums/${album._id}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={handleClick}
      className="group relative bg-[#111] border border-white/5 rounded-[14px] overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-[3px]"
    >
      {/* Cover */}
      <div className="relative pt-[100%] bg-[#181818]">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#333]">
            <Disc3 size={40} />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
          <button
            onClick={handlePlay}
            className="w-9 h-9 rounded-full bg-[#3FD6FF] border-none flex items-center justify-center cursor-pointer shadow-[0_4px_16px_rgba(63,214,255,0.4)]"
          >
            <Play size={16} fill="#000" color="#000" className="ml-0.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-[12px_12px_10px]">
        <p className="text-[13px] font-bold text-white m-0 whitespace-nowrap overflow-hidden text-ellipsis">
          {album.title}
        </p>
        <p className="text-xs text-[#666] mt-[3px] mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
          {getArtistName(album)}{album.releaseYear ? ` • ${album.releaseYear}` : ''}
        </p>
      </div>
    </motion.div>
  )
}
