// ===========================
// PLAYLIST
// ===========================

export interface Playlist {
  _id: string
  title: string
  description: string
  artistId: ArtistRef | string
  coverUrl: string
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

// ===========================
// PLAYLIST SONG
// ===========================

export interface PlaylistSong {
  _id: string
  playlistId: string
  songId: SongPopulated | string
  order: number
  addedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SongPopulated {
  _id: string
  title: string
  artistId?: {
    _id: string
    stageName: string
  } | string
  albumId?: {
    _id: string
    title: string
  } | string | null
  audioUrl: string
  coverUrl?: string
  duration: number
  genre?: string
  playCount: number
}

// ===========================
// CREATE / UPDATE PLAYLIST
// ===========================

export interface CreatePlaylistInput {
  title: string
  description?: string
  artistId: string
  coverUrl?: string
  isPublic?: boolean
}

export type UpdatePlaylistInput =
  Partial<CreatePlaylistInput> & {
    _id: string
  }

// ===========================
// PLAYLIST SONG INPUT
// ===========================

export interface AddSongToPlaylistInput {
  playlistId: string
  songId: string
  order?: number
}

export interface UpdatePlaylistSongInput {
  _id: string
  order?: number
}

// ===========================
// STATS
// ===========================

export interface PlaylistStats {
  totalPlaylists: number
}

// ===========================
// QUERY
// ===========================

export interface PlaylistQueryParams {
  keyword?: string
  artistId?: string
  page?: number
  limit?: number
}

// ===========================
// PAGINATION
// ===========================

export interface PaginatedPlaylists {
  success: boolean
  data: Playlist[]
  total: number
  page: number
  limit: number
  totalPages: number
}