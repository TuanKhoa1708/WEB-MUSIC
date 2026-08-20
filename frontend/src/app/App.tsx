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
import { ArtistRequestsPage } from '@/pages/admin/ArtistRequests'
import { AdminDashboardPage } from '@/pages/admin/Dashboard'
import { SongManagementPage } from '@/pages/admin/SongManagement'
import { ListenerManagementPage } from '@/pages/admin/ListenerManagement'

import { UnauthorizedPage } from '@/pages/Unauthorized'
import { BecomeArtistPage } from '@/pages/user/BecomeArtist'

// Artist pages
import { ArtistRoute } from '@/routes/ArtistRoute'
import { ArtistLayout } from '@/layouts/ArtistLayout'
import { AlbumManagementPage } from '@/pages/artist/AlbumManagement'
import { ArtistDashboardPage } from '@/pages/artist/Dashboard'
import { ArtistSongManagementPage } from '@/pages/artist/SongManagement'
import { ArtistPlaylistsPage } from '@/pages/artist/Playlists'
import { PlaylistDetailPage } from '@/pages/artist/PlaylistDetail'
import { ArtistProfilePage } from '@/pages/artist/Profile'

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div>🎵 Welcome to Pulse — Home</div>
        <a 
          href="/become-artist"
          style={{
            background: 'linear-gradient(135deg, #3FD6FF, #2094ff)',
            color: '#000',
            padding: '12px 24px',
            borderRadius: 12,
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: 700
          }}
        >
          Apply to become an Artist
        </a>
      </div>
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
            <Route path="/become-artist" element={<BecomeArtistPage />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/artist-requests" element={<ArtistRequestsPage />} />
              <Route path="/admin/artists" element={<ArtistManagementPage />} />
              <Route path="/admin/listeners" element={<ListenerManagementPage />} />
              <Route path="/admin/songs" element={<SongManagementPage />} />
              <Route path="/admin/albums" element={<AlbumManagementPage />} />
            </Route>
          </Route>

          {/* Protected artist routes */}
          <Route element={<ArtistRoute />}>
            <Route element={<ArtistLayout />}>
              <Route path="/artist/dashboard" element={<ArtistDashboardPage />} />
              <Route path="/artist/songs" element={<ArtistSongManagementPage />} />
              <Route path="/artist/albums" element={<AlbumManagementPage />} />
              <Route path="/artist/playlists" element={<ArtistPlaylistsPage />} />
              <Route path="/artist/playlists/:id" element={<PlaylistDetailPage />} />
              <Route path="/artist/profile" element={<ArtistProfilePage />} />
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
