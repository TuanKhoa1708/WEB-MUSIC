import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES } from '@/constants/roles'

/**
 * AdminRoute — wraps all /admin/* routes.
 *
 * Guard rules:
 *  1. No token         → redirect to login (/)
 *  2. Token + not admin → redirect to /unauthorized
 *  3. Token + admin    → render child routes via <Outlet />
 *
 * Note: While `loading` is true (hydrating auth state) we render nothing
 * to prevent a flash of the unauthorized screen.
 */
export function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
