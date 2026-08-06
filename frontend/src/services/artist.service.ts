import type {
  Artist,
  ArtistQueryParams,
  ArtistStats,
  PaginatedArtists,
} from '@/types/artist.types'

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with real API calls once backend is ready:
//   import { getArtistsApi, getArtistStatsApi, deleteArtistApi } from '@/api/artist.api'

const MOCK_ARTISTS: Artist[] = [
  {
    _id: '1',
    userId: '60d0fe4f5311236168a109ca',
    stageName: 'Luna Eclipse',
    bio: 'Rising indie pop sensation with ethereal vocals.',
    followers: 482300,
    socialLinks: {
      instagram: 'https://instagram.com/lunaeclipse',
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: '2',
    userId: '60d0fe4f5311236168a109cb',
    stageName: 'Neon Drift',
    bio: 'Electronic producer known for synthwave hits.',
    followers: 1240800,
    socialLinks: {
      youtube: 'https://youtube.com/neondrift',
    },
    createdAt: '2023-09-22T08:00:00Z',
    updatedAt: '2023-09-22T08:00:00Z',
  },
]

const MOCK_STATS: ArtistStats = {
  totalArtists: 2,
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getArtistsService(
  params?: ArtistQueryParams
): Promise<PaginatedArtists> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600))

  let filtered = [...MOCK_ARTISTS]

  // Search
  if (params?.keyword) {
    const q = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.stageName.toLowerCase().includes(q)
    )
  }

  // Pagination
  const page = params?.page ?? 1
  const pageSize = params?.limit ?? 10
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data, total, page, totalPages }
}

export async function getArtistStatsService(): Promise<ArtistStats> {
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_STATS
}

export async function deleteArtistService(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400))
  const idx = MOCK_ARTISTS.findIndex((a) => a._id === id)
  if (idx !== -1) MOCK_ARTISTS.splice(idx, 1)
}

export async function createArtistService(data: import('@/types/artist.types').CreateArtistInput): Promise<Artist> {
  await new Promise((r) => setTimeout(r, 500))
  const newArtist: Artist = {
    _id: String(Date.now()),
    ...data,
    followers: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  MOCK_ARTISTS.unshift(newArtist) // Add to top
  return newArtist
}

export async function updateArtistService(data: import('@/types/artist.types').UpdateArtistInput): Promise<Artist> {
  await new Promise((r) => setTimeout(r, 500))
  const idx = MOCK_ARTISTS.findIndex((a) => a._id === data._id)
  if (idx === -1) throw new Error('Artist not found')
  
  MOCK_ARTISTS[idx] = { ...MOCK_ARTISTS[idx], ...data, updatedAt: new Date().toISOString() }
  return MOCK_ARTISTS[idx]
}
