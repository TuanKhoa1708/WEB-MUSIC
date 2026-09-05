import axiosInstance from '@/api/axios'
import type {
  Song,
  SongStats,
  SongQueryParams,
  PaginatedSongs,
  CreateSongInput,
  UpdateSongInput,
} from '@/types/song.types'

const BASE = '/songs'

// ─── GET /songs ───────────────────────────────────────────────────────────────
// Supports: page, limit, keyword, artistId, genre
export async function getSongsApi(params?: SongQueryParams): Promise<PaginatedSongs> {
  const { data } = await axiosInstance.get<PaginatedSongs>(BASE, { params })
  return data
}

// ─── GET /songs/stats ─────────────────────────────────────────────────────────
export async function getSongStatsApi(): Promise<{ success: boolean; data: SongStats }> {
  const { data } = await axiosInstance.get<{ success: boolean; data: SongStats }>(`${BASE}/stats`)
  return data
}

// ─── GET /songs/recommendations ────────────────────────────────────────────────
// Get AI recommended songs for current listener
export async function getRecommendationsApi(): Promise<{ success: boolean; data: Song[] }> {
  const { data } = await axiosInstance.get<{ success: boolean; data: Song[] }>(`${BASE}/recommendations`)
  return data
}

// ─── GET /songs/:id ───────────────────────────────────────────────────────────
export async function getSongByIdApi(id: string): Promise<{ success: boolean; data: Song }> {
  const { data } = await axiosInstance.get<{ success: boolean; data: Song }>(`${BASE}/${id}`)
  return data
}

// ─── POST /songs ──────────────────────────────────────────────────────────────
// Requires: auth Bearer token, role artist|admin
// Body: JSON (title, artistId, audioUrl, duration are required)
export async function createSongApi(payload: CreateSongInput): Promise<{ success: boolean; data: Song }> {
  const { data } = await axiosInstance.post<{ success: boolean; data: Song }>(BASE, payload)
  return data
}

// ─── PUT /songs/:id ───────────────────────────────────────────────────────────
// Requires: auth Bearer token, role artist|admin
export async function updateSongApi(id: string, payload: Partial<UpdateSongInput>): Promise<{ success: boolean; data: Song }> {
  const { data } = await axiosInstance.put<{ success: boolean; data: Song }>(`${BASE}/${id}`, payload)
  return data
}

// ─── DELETE /songs/:id ────────────────────────────────────────────────────────
// Requires: auth Bearer token, role artist|admin
export async function deleteSongApi(id: string): Promise<void> {
  await axiosInstance.delete(`${BASE}/${id}`)
}

// ─── POST /upload ─────────────────────────────────────────────────────────────
// Upload audio and/or cover files using multipart/form-data
export async function uploadFilesApi(formData: FormData): Promise<{ success: boolean; data: { audioUrl?: string; coverUrl?: string } }> {
  const { data } = await axiosInstance.post<{ success: boolean; data: { audioUrl?: string; coverUrl?: string } }>('/upload', formData)
  return data
}
