import { Outlet } from 'react-router-dom'
import { ArtistSidebar } from '@/components/artist/Sidebar'
import { ArtistHeader } from '@/components/artist/ArtistHeader'
import { useState, createContext } from 'react'

export const MobileSidebarContext = createContext<{ mobileOpen: boolean, setMobileOpen: (v: boolean) => void }>({
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function ArtistLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <MobileSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="flex min-h-screen bg-[#090909] font-sans">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block shrink-0">
          <ArtistSidebar />
        </div>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative h-screen">
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