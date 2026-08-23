import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Wraps protected routes.
 * - If the user is authenticated: renders the child route (<Outlet />).
 * - Otherwise: redirects to the login page ("/").
 */
export function ProtectedRoute() {
  const { isAuthenticated, user, loading } = useAuth()

  // While checking token presence, render nothing to avoid flicker.
  if (loading) return null

  // If there's a token but the user object is missing (e.g. lost state), force them to log in again
  if (isAuthenticated && !user) {
    return <Navigate to="/" replace />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
