import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ListenerSidebar, ListenerMobileDrawer, MobileSidebarContext } from '@/components/listener/Sidebar'
import { ListenerHeader } from '@/components/listener/Header'
import { GlobalMusicPlayer } from '@/components/listener/GlobalMusicPlayer'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

export function ListenerLayout() {
  const { currentSong } = useMusicPlayer()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <MobileSidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      <div className="flex min-h-screen bg-[#090909] font-sans overflow-hidden">
        
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block shrink-0">
          <ListenerSidebar />
        </div>

        {/* Mobile Drawer */}
        <ListenerMobileDrawer
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Sticky Header */}
          <ListenerHeader />

          {/* Scrollable Page Content */}
          <main 
            className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300"
            style={{ paddingBottom: currentSong ? 96 : 32 }}
          >
            <Outlet />
          </main>
        </div>

        {/* Global Player */}
        <GlobalMusicPlayer />
      </div>
    </MobileSidebarContext.Provider>
  )
}
