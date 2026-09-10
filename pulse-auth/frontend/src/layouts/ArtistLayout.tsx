import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ArtistSidebar, ArtistMobileDrawer, MobileSidebarContext } from '@/components/artist/Sidebar'
import { ArtistHeader } from '@/components/artist/ArtistHeader'

export function ArtistLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <MobileSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#090909',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block shrink-0">
          <ArtistSidebar />
        </div>

        {/* Mobile drawer */}
        <ArtistMobileDrawer
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main column */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflowX: 'hidden',
          }}
        >
          {/* Header */}
          <ArtistHeader />

          {/* Page content */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingBottom: '64px', // Extra padding for mobile if needed
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>

    </MobileSidebarContext.Provider>
  )
}
