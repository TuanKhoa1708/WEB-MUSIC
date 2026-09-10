import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User2 } from 'lucide-react'
import type { Artist } from '@/types/artist.types'

interface ArtistCardProps {
  artist: Artist
  delay?: number
}

export function ArtistCard({ artist, delay = 0 }: ArtistCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group flex flex-col items-center gap-2.5 p-[20px_12px_16px] bg-[#111] border border-white/5 rounded-[16px] cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:border-[#3FD6FF]/20"
    >
      {/* Avatar */}
      <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gradient-to-br from-[#3FD6FF]/10 to-[#2094ff]/10 border-2 border-[#3FD6FF]/15 flex items-center justify-center shrink-0">
        {artist.avatarUrl ? (
          <img src={artist.avatarUrl} alt={artist.stageName} className="w-full h-full object-cover" />
        ) : (
          <User2 size={32} color="#3FD6FF44" />
        )}
      </div>

      {/* Info */}
      <div className="text-center min-w-0 w-full">
        <p className="text-[13px] font-bold text-white m-0 whitespace-nowrap overflow-hidden text-ellipsis">
          {artist.stageName}
        </p>
        <p className="text-[11px] text-[#555] mt-1 mb-0">
          Artist
        </p>
      </div>
    </motion.div>
  )
}
