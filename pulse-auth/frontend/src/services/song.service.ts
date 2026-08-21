import {
  getSongsApi,
  getSongStatsApi,
  getSongByIdApi,
  createSongApi,
  updateSongApi,
  deleteSongApi,
} from '@/api/song.api'
import type {
  Song,
  SongQueryParams,
  SongStats,
  PaginatedSongs,
  CreateSongInput,
  UpdateSongInput,
} from '@/types/song.types'

// ─── List songs ───────────────────────────────────────────────────────────────

export async function getSongsService(params?: SongQueryParams): Promise<PaginatedSongs> {
  return getSongsApi(params)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getSongStatsService(): Promise<SongStats> {
  const res = await getSongStatsApi()
  return res.data
}

// ─── Get single song ──────────────────────────────────────────────────────────

export async function getSongByIdService(id: string): Promise<Song> {
  const res = await getSongByIdApi(id)
  return res.data
}

// ─── Create song ──────────────────────────────────────────────────────────────

export async function createSongService(input: CreateSongInput): Promise<Song> {
  const res = await createSongApi(input)
  return res.data
}

// ─── Update song ──────────────────────────────────────────────────────────────

export async function updateSongService(input: UpdateSongInput): Promise<Song> {
  const { _id, ...payload } = input
  const res = await updateSongApi(_id, payload)
  return res.data
}

// ─── Delete song ──────────────────────────────────────────────────────────────

export async function deleteSongService(id: string): Promise<void> {
  return deleteSongApi(id)
}
