import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// ─── Placeholder home page (replace with real page later) ────────────────────
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

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
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
