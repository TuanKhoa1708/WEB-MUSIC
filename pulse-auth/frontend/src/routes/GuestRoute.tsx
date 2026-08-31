import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES } from '@/constants/roles'

/**
 * Wraps guest routes (login, signup, etc).
 * - If the user is authenticated: redirects them to their respective dashboard.
 * - Otherwise: renders the child route (<Outlet />).
 */
export function GuestRoute() {
  const { isAuthenticated, user, loading } = useAuth()

  // While checking token presence, render nothing to avoid flicker.
  if (loading) return null

  // If user is authenticated, redirect them away from the guest route
  if (isAuthenticated && user) {
    switch (user.role) {
      case ROLES.ADMIN:
        return <Navigate to="/admin/dashboard" replace />
      case ROLES.ARTIST:
        return <Navigate to="/artist/dashboard" replace />
      default:
        return <Navigate to="/home" replace />
    }
  }

  // Not authenticated, allow access to guest route (like login)
  return <Outlet />
}
