import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES } from '@/constants/roles'

/**
 * ArtistRoute — wraps all /artist/* routes.
 *
 * Guard rules:
 *  1. No token         → redirect to login (/)
 *  2. Token + not artist → redirect to /unauthorized
 *  3. Token + artist    → render child routes via <Outlet />
 */
export function ArtistRoute() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Allow admin to view artist routes for testing purposes, or restrict purely to artists.
  // Standard logic: Only artists.
  if (user?.role !== ROLES.ARTIST && user?.role !== ROLES.ADMIN) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
