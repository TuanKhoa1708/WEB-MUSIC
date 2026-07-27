import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Wraps protected routes.
 * - If the user is authenticated: renders the child route (<Outlet />).
 * - Otherwise: redirects to the login page ("/").
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // While checking token presence, render nothing to avoid flicker.
  if (loading) return null

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
