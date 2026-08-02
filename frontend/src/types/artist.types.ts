// ─── Artist Domain Types ──────────────────────────────────────────────────────

export type ArtistStatus = 'verified' | 'pending' | 'suspended'

export interface Artist {
  id: string
  stageName: string
  email: string
  genre: string
  followers: number
  albums: number
  songs: number
  status: ArtistStatus
  avatarUrl?: string
  createdAt: string
}

export type CreateArtistInput = Omit<Artist, 'id' | 'createdAt' | 'followers' | 'albums' | 'songs'>
export type UpdateArtistInput = Partial<CreateArtistInput> & { id: string }

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface ArtistStats {
  totalArtists: number
  verifiedArtists: number
  newThisMonth: number
  totalFollowers: number
}

// ─── Filter / Query ───────────────────────────────────────────────────────────

export interface ArtistQueryParams {
  search?: string
  genre?: string
  status?: ArtistStatus | ''
  sortBy?: 'stageName' | 'followers' | 'createdAt' | 'albums'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PaginatedArtists {
  data: Artist[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
