// ─── Playlist Domain Types ────────────────────────────────────────────────────
// Mirrors backend Playlist and PlaylistSong schemas exactly.

export interface Playlist {
  _id: string
  title: string
  description?: string
  artistId: ArtistRef | string
  coverUrl?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface ArtistRef {
  _id: string
  stageName: string
  avatarUrl?: string
}
export interface UserRef {
  _id: string
  fullName: string
  username: string
}

// ─── PlaylistSong ─────────────────────────────────────────────────────────────

export interface PlaylistSong {
  _id: string
  playlistId: string
  songId: SongPopulated | string
  addedAt: string
  createdAt: string
  updatedAt: string
}

export interface SongPopulated {
  _id: string
  title: string
  artistId?: { _id: string; stageName: string } | string
  albumId?: { _id: string; title: string } | string | null
  audioUrl: string
  coverUrl?: string
  duration: number
  genre?: string
  playCount: number
}

// ─── Create / Update ──────────────────────────────────────────────────────────
export interface CreatePlaylistInput {
  title: string
  description?: string
  artistId: string
  coverUrl?: string
  isPublic?: boolean
}
export type UpdatePlaylistInput =
  Partial<Omit<CreatePlaylistInput, 'artistId'>> & { _id: string }

// ─── PlaylistSong CRUD ────────────────────────────────────────────────────────

export interface AddSongToPlaylistInput {
  playlistId: string
  songId: string
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface PlaylistStats {
  totalPlaylists: number
}

// ─── Filter / Query ───────────────────────────────────────────────────────────

export interface PlaylistQueryParams {
  keyword?: string
  page?: number
  limit?: number
}

export interface PaginatedPlaylists {
  success: boolean
  data: Playlist[]
  total: number
  page: number
  totalPages: number
}
