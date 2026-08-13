import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Transition } from 'framer-motion'

import LoginPage from '@/pages/auth/Login/Login'
import SignupPage from '@/pages/auth/Signup/Signup'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'
import { AdminLayout } from '@/layouts/AdminLayout'

// Admin pages
import { ArtistManagementPage } from '@/pages/admin/ArtistManagement'
import { AdminDashboardPage } from '@/pages/admin/Dashboard'
import { SongManagementPage } from '@/pages/admin/SongManagement'

// Other pages
import { UnauthorizedPage } from '@/pages/Unauthorized'

// ─── Placeholder home page ────────────────────────────────────────────────────
function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090909',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.02em',
      }}
    >
      🎵 Welcome to Pulse — Home
    </div>
  )
}

// ─── Page transition config ───────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, filter: 'blur(4px)', scale: 0.99 },
  animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
  exit: { opacity: 0, filter: 'blur(4px)', scale: 1.01 },
}

const pageTransition: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ width: '100%', height: '100%' }}
      >
        <Routes location={location}>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/artists" element={<ArtistManagementPage />} />
              <Route path="/admin/songs" element={<SongManagementPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
