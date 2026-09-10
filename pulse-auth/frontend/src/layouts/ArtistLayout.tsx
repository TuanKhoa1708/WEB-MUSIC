import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ArtistSidebar, ArtistMobileDrawer, MobileSidebarContext } from '@/components/artist/Sidebar'
import { ArtistHeader } from '@/components/artist/ArtistHeader'

export function ArtistLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <MobileSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="flex min-h-screen bg-[#090909] font-sans">
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
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative h-screen">
          {/* Header */}
          <ArtistHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>

    </MobileSidebarContext.Provider>
  )
}
