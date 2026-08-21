// ─── Role constants ────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'admin',
  ARTIST: 'artist',
  USER: 'user',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
