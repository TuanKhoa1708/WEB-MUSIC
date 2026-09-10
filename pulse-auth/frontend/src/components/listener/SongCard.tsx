import { motion } from 'framer-motion'
import { Play, Music2, Radio } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { useListenRoom } from '@/contexts/ListenRoomContext'
import toast from 'react-hot-toast'
import type { Song } from '@/types/song.types'

interface SongCardProps {
  song: Song
  queue?: Song[]
  delay?: number
}

function getArtistName(song: Song): string {
  if (!song.artistId) return 'Unknown Artist'
  if (typeof song.artistId === 'object') return song.artistId.stageName
  return 'Unknown Artist'
}

export function SongCard({ song, queue, delay = 0 }: SongCardProps) {
  const { playSong, currentSong, isPlaying } = useMusicPlayer()
  const { isInRoom, isHost } = useListenRoom()
  const isGuestLocked = isInRoom && !isHost
  const isCurrent = currentSong?._id === song._id

  const handleClick = () => {
    if (isGuestLocked) {
      toast('🎵 Host controls playback in this session', { icon: <Radio size={14} /> })
      return
    }
    playSong(song, queue ?? [song])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={handleClick}
      className={cn(
        "group relative rounded-[14px] overflow-hidden transition-all duration-200",
        isGuestLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer",
        isCurrent ? "bg-[rgba(63,214,255,0.06)] border border-[rgba(63,214,255,0.2)]" : "bg-[#111] border border-white/5 hover:-translate-y-[3px]"
      )}
    >
      {/* Cover */}
      <div className="relative pt-[100%] bg-[#181818]">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#333]">
            <Music2 size={36} />
          </div>
        )}

        {/* Play overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-100",
            (isCurrent && isPlaying) ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-[#3FD6FF] flex items-center justify-center">
            <Play size={16} fill="#000" color="#000" className="ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 md:p-3">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <p className={cn("text-[13px] font-bold m-0 whitespace-nowrap overflow-hidden text-ellipsis", isCurrent ? "text-[#3FD6FF]" : "text-white")}>
              {song.title}
            </p>
            <p className="text-xs text-[#666] m-0 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {getArtistName(song)}
            </p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton song={song} size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}