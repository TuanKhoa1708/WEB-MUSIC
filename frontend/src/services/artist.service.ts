import type {
  Artist,
  ArtistQueryParams,
  ArtistStats,
  ArtistStatus,
  PaginatedArtists,
} from '@/types/artist.types'

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with real API calls once backend is ready:
//   import { getArtistsApi, getArtistStatsApi, deleteArtistApi } from '@/api/artist.api'

const MOCK_ARTISTS: Artist[] = [
  {
    id: '1',
    stageName: 'Luna Eclipse',
    email: 'luna@pulse.io',
    genre: 'Indie Pop',
    followers: 482_300,
    albums: 4,
    songs: 38,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    stageName: 'Neon Drift',
    email: 'neondrift@pulse.io',
    genre: 'Electronic',
    followers: 1_240_800,
    albums: 7,
    songs: 64,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2023-09-22T08:00:00Z',
  },
  {
    id: '3',
    stageName: 'Kairo West',
    email: 'kairo@pulse.io',
    genre: 'Hip-Hop',
    followers: 3_112_500,
    albums: 12,
    songs: 102,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2022-06-01T00:00:00Z',
  },
  {
    id: '4',
    stageName: 'Stella Vox',
    email: 'stellavox@pulse.io',
    genre: 'R&B',
    followers: 654_000,
    albums: 2,
    songs: 18,
    status: 'pending',
    avatarUrl: undefined,
    createdAt: '2025-03-10T14:00:00Z',
  },
  {
    id: '5',
    stageName: 'Prism Sound',
    email: 'prism@pulse.io',
    genre: 'Jazz',
    followers: 89_400,
    albums: 3,
    songs: 31,
    status: 'pending',
    avatarUrl: undefined,
    createdAt: '2025-06-18T09:15:00Z',
  },
  {
    id: '6',
    stageName: 'Axiom',
    email: 'axiom@pulse.io',
    genre: 'Rock',
    followers: 228_700,
    albums: 5,
    songs: 47,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2024-05-20T11:00:00Z',
  },
  {
    id: '7',
    stageName: 'VELO',
    email: 'velo@pulse.io',
    genre: 'Pop',
    followers: 4_820_100,
    albums: 9,
    songs: 84,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2021-11-01T00:00:00Z',
  },
  {
    id: '8',
    stageName: 'Sable',
    email: 'sable@pulse.io',
    genre: 'Classical',
    followers: 44_200,
    albums: 1,
    songs: 12,
    status: 'suspended',
    avatarUrl: undefined,
    createdAt: '2025-01-07T16:30:00Z',
  },
  {
    id: '9',
    stageName: 'Frostwave',
    email: 'frostwave@pulse.io',
    genre: 'Electronic',
    followers: 731_500,
    albums: 6,
    songs: 55,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2023-02-14T12:00:00Z',
  },
  {
    id: '10',
    stageName: 'Echo Lux',
    email: 'echolux@pulse.io',
    genre: 'Indie Rock',
    followers: 318_900,
    albums: 3,
    songs: 27,
    status: 'pending',
    avatarUrl: undefined,
    createdAt: '2025-07-01T08:00:00Z',
  },
  {
    id: '11',
    stageName: 'Mirage Bass',
    email: 'mirage@pulse.io',
    genre: 'Bass',
    followers: 162_000,
    albums: 2,
    songs: 22,
    status: 'verified',
    avatarUrl: undefined,
    createdAt: '2024-08-12T10:00:00Z',
  },
  {
    id: '12',
    stageName: 'Caden Rowe',
    email: 'caden@pulse.io',
    genre: 'Country',
    followers: 94_600,
    albums: 4,
    songs: 36,
    status: 'suspended',
    avatarUrl: undefined,
    createdAt: '2023-12-01T00:00:00Z',
  },
]

const MOCK_STATS: ArtistStats = {
  totalArtists: 12,
  verifiedArtists: 8,
  newThisMonth: 2,
  totalFollowers: 12_078_000,
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getArtistsService(
  params?: ArtistQueryParams
): Promise<PaginatedArtists> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600))

  let filtered = [...MOCK_ARTISTS]

  // Search
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.stageName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q)
    )
  }

  // Status filter
  if (params?.status) {
    filtered = filtered.filter((a) => a.status === (params.status as ArtistStatus))
  }

  // Genre filter
  if (params?.genre) {
    filtered = filtered.filter((a) =>
      a.genre.toLowerCase().includes(params.genre!.toLowerCase())
    )
  }

  // Sort
  if (params?.sortBy) {
    const key = params.sortBy as keyof Artist
    const dir = params.sortOrder === 'desc' ? -1 : 1
    filtered.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }

  // Pagination
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data, total, page, pageSize, totalPages }
}

export async function getArtistStatsService(): Promise<ArtistStats> {
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_STATS
}

export async function deleteArtistService(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400))
  const idx = MOCK_ARTISTS.findIndex((a) => a.id === id)
  if (idx !== -1) MOCK_ARTISTS.splice(idx, 1)
}

export async function createArtistService(data: import('@/types/artist.types').CreateArtistInput): Promise<Artist> {
  await new Promise((r) => setTimeout(r, 500))
  const newArtist: Artist = {
    id: String(Date.now()),
    ...data,
    followers: 0,
    albums: 0,
    songs: 0,
    createdAt: new Date().toISOString(),
  }
  MOCK_ARTISTS.unshift(newArtist) // Add to top
  return newArtist
}

export async function updateArtistService(data: import('@/types/artist.types').UpdateArtistInput): Promise<Artist> {
  await new Promise((r) => setTimeout(r, 500))
  const idx = MOCK_ARTISTS.findIndex((a) => a.id === data.id)
  if (idx === -1) throw new Error('Artist not found')
  
  MOCK_ARTISTS[idx] = { ...MOCK_ARTISTS[idx], ...data }
  return MOCK_ARTISTS[idx]
}
