import axiosInstance from '@/api/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArtistRequestRecord {
  _id: string
  userId: string | { _id: string; fullName: string; email: string; avatarUrl?: string }
  type: 'become_artist' | 'revoke_artist'
  stageName: string
  bio?: string
  status: 'pending' | 'approved' | 'rejected' | 'revoke_pending' | 'revoke_approved'
  adminMessage?: string
  revokeReason?: string
  createdAt: string
  updatedAt: string
}

// ─── APIs ─────────────────────────────────────────────────────────────────────

/**
 * GET /artist-requests — Admin: get all requests (supports ?status= filter)
 */
export async function getArtistRequestsApi(status?: string): Promise<ArtistRequestRecord[]> {
  const { data } = await axiosInstance.get<ArtistRequestRecord[]>('/artist-requests', {
    params: status ? { status } : undefined,
  })
  return data
}

/**
 * PUT /artist-requests/:id/approve — Admin approves become_artist request
 */
export async function approveArtistRequestApi(id: string): Promise<void> {
  await axiosInstance.put(`/artist-requests/${id}/approve`)
}

/**
 * PUT /artist-requests/:id/reject — Admin rejects become_artist request
 */
export async function rejectArtistRequestApi(id: string, adminMessage?: string): Promise<void> {
  await axiosInstance.put(`/artist-requests/${id}/reject`, { adminMessage })
}

/**
 * POST /artist-requests/revoke — Artist submits self-revocation request
 */
export async function requestRevokeRoleApi(revokeReason: string): Promise<ArtistRequestRecord> {
  const { data } = await axiosInstance.post<{ request: ArtistRequestRecord }>('/artist-requests/revoke', {
    revokeReason,
  })
  return data.request
}

/**
 * PUT /artist-requests/:id/revoke-approve — Admin approves revocation (cascades song delete + role reset)
 */
export async function approveRevokeRequestApi(id: string): Promise<void> {
  await axiosInstance.put(`/artist-requests/${id}/revoke-approve`)
}

/**
 * GET /artist-requests/my-request — Artist gets their own latest request
 */
export async function getMyArtistRequestApi(): Promise<ArtistRequestRecord | null> {
  try {
    const { data } = await axiosInstance.get<ArtistRequestRecord>('/artist-requests/my-request')
    return data
  } catch {
    return null
  }
}
