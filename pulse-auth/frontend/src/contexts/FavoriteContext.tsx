import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFavoritesService, addFavoriteService, removeFavoriteService } from '@/services/favorite.service'
import type { Favorite } from '@/types/favorite.types'
import type { Song } from '@/types/song.types'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FavoriteContextValue {
  favorites: Favorite[]
  favoriteIds: Set<string>          // Set of songId strings for O(1) lookup
  favoriteMap: Map<string, string>  // songId -> favoriteDocumentId (for DELETE)
  isFavorite: (songId: string) => boolean
  toggleFavorite: (song: Song) => Promise<void>
  isLoading: boolean
  refetch: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FavoriteContext = createContext<FavoriteContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [favoriteMap, setFavoriteMap] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const buildMaps = (favs: Favorite[]) => {
    const ids = new Set<string>()
    const map = new Map<string, string>()
    favs.forEach((fav) => {
      const songId = typeof fav.songId === 'string' ? fav.songId : fav.songId._id
      ids.add(songId)
      map.set(songId, fav._id)
    })
    setFavoriteIds(ids)
    setFavoriteMap(map)
  }

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return
    setIsLoading(true)
    try {
      const data = await getFavoritesService(user.id)
      setFavorites(data)
      buildMaps(data)
    } catch {
      // Silently fail — not critical to block UI
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = useCallback(
    (songId: string) => favoriteIds.has(songId),
    [favoriteIds]
  )

  const toggleFavorite = useCallback(
    async (song: Song) => {
      if (!user?.id) {
        toast.error('Please log in to add favorites.')
        return
      }

      const songId = song._id
      const alreadyFavorited = favoriteIds.has(songId)

      // Optimistic update
      if (alreadyFavorited) {
        const favId = favoriteMap.get(songId)!
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(songId)
          return next
        })
        setFavoriteMap((prev) => {
          const next = new Map(prev)
          next.delete(songId)
          return next
        })
        setFavorites((prev) => prev.filter((f) => {
          const sid = typeof f.songId === 'string' ? f.songId : f.songId._id
          return sid !== songId
        }))

        try {
          await removeFavoriteService(favId)
          toast.success(`Removed "${song.title}" from favorites.`)
        } catch {
          // Revert on failure
          await fetchFavorites()
          toast.error('Failed to remove from favorites.')
        }
      } else {
        // Optimistic add — we'll fill the real _id after response
        setFavoriteIds((prev) => new Set(prev).add(songId))

        try {
          const newFav = await addFavoriteService(user.id, songId)
          // Manually populate songId so that it correctly renders in the FavoriteSongs page
          const populatedFav = { ...newFav, songId: song as any }
          setFavoriteMap((prev) => new Map(prev).set(songId, newFav._id))
          setFavorites((prev) => [populatedFav, ...prev])
          toast.success(`Added "${song.title}" to favorites.`)
        } catch (err: any) {
          // Revert
          setFavoriteIds((prev) => {
            const next = new Set(prev)
            next.delete(songId)
            return next
          })
          if (err.message?.includes('already')) {
            await fetchFavorites()
          } else {
            toast.error('Failed to add to favorites.')
          }
        }
      }
    },
    [user?.id, favoriteIds, favoriteMap, fetchFavorites]
  )

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        favoriteIds,
        favoriteMap,
        isFavorite,
        toggleFavorite,
        isLoading,
        refetch: fetchFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFavoriteContext(): FavoriteContextValue {
  const ctx = useContext(FavoriteContext)
  if (!ctx) throw new Error('useFavoriteContext must be used inside <FavoriteProvider>')
  return ctx
}
