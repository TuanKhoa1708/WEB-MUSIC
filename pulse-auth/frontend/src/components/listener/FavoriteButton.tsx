import { Heart } from 'lucide-react'
import { useFavoriteContext } from '@/contexts/FavoriteContext'
import type { Song } from '@/types/song.types'

interface FavoriteButtonProps {
  song: Song
  size?: number
}

export function FavoriteButton({ song, size = 16 }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoriteContext()
  const favored = isFavorite(song._id)

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite(song)
      }}
      title={favored ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favored ? 'Remove from favorites' : 'Add to favorites'}
      style={{
        background: 'none',
        border: 'none',
        color: favored ? '#3FD6FF' : '#555',
        cursor: 'pointer',
        padding: 4,
        borderRadius: 6,
        transition: 'color 0.2s, transform 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#3FD6FF'
        e.currentTarget.style.transform = 'scale(1.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = favored ? '#3FD6FF' : '#555'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <Heart size={size} fill={favored ? '#3FD6FF' : 'none'} />
    </button>
  )
}
