import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import { PlaylistDetailPage as ArtistPlaylistDetailPage } from '@/pages/artist/PlaylistDetail'
import { ArtistProfilePage } from '@/pages/artist/Profile'

// Listener pages
import { ListenerLayout } from '@/layouts/ListenerLayout'
import { HomePage } from '@/pages/listener/Home'
import { SearchPage } from '@/pages/listener/Search'
import { LibraryPage } from '@/pages/listener/Library'
import { FavoriteSongsPage } from '@/pages/listener/FavoriteSongs'
import { AlbumDetailPage } from '@/pages/listener/AlbumDetail'
import { ArtistDetailPage } from '@/pages/listener/ArtistDetail'
import { PlaylistDetailPage as ListenerPlaylistDetailPage } from '@/pages/listener/PlaylistDetail'
import { RecentlyPlayedPage } from '@/pages/listener/RecentlyPlayed'

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

          {/* Legacy redirect */}
          <Route path="/home" element={<Navigate to="/listener/home" replace />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/become-artist" element={<BecomeArtistPage />} />

            {/* Listener / User routes */}
            <Route element={<ListenerLayout />}>
              <Route path="/listener/home" element={<HomePage />} />
              <Route path="/listener/search" element={<SearchPage />} />
              <Route path="/listener/library" element={<LibraryPage />} />
              <Route path="/listener/favorites" element={<FavoriteSongsPage />} />
              <Route path="/listener/history" element={<RecentlyPlayedPage />} />
              <Route path="/listener/albums/:id" element={<AlbumDetailPage />} />
              <Route path="/listener/artists/:id" element={<ArtistDetailPage />} />
              <Route path="/listener/playlists/:id" element={<ListenerPlaylistDetailPage />} />
              {/* Default listener redirect */}
              <Route path="/listener" element={<Navigate to="/listener/home" replace />} />
            </Route>
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
              <Route path="/artist/playlists/:id" element={<ArtistPlaylistDetailPage />} />
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
