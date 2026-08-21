// ─── Song Domain Types ────────────────────────────────────────────────────────
// Mirrors backend Song schema exactly — do NOT invent new fields.

export interface Song {
  _id: string
  title: string
  artistId: ArtistRef | string
  albumId?: AlbumRef | string | null
  audioUrl: string
  coverUrl?: string
  duration: number        // seconds (Number in schema)
  genre?: string
  description?: string
  playCount: number
  createdAt: string
  updatedAt: string
}

// Populated references (returned by backend .populate())
export interface ArtistRef {
  _id: string
  stageName: string
}

export interface AlbumRef {
  _id: string
  title: string
}

// ─── Create / Update ──────────────────────────────────────────────────────────

export interface CreateSongInput {
  title: string
  artistId: string
  albumId?: string | null
  audioUrl: string
  coverUrl?: string
  duration?: number
  genre?: string
  description?: string
}

export type UpdateSongInput = Partial<CreateSongInput> & { _id: string }

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface SongStats {
  totalSongs: number
  totalPlays: number
}

// ─── Filter / Query ───────────────────────────────────────────────────────────

export interface SongQueryParams {
  keyword?: string
  artistId?: string
  genre?: string
  page?: number
  limit?: number
}

export interface PaginatedSongs {
  success: boolean
  data: Song[]
  total: number
  page: number
  limit: number
  totalPages: number
}
