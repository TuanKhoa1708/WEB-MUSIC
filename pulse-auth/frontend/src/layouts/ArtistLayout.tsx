import { Outlet } from 'react-router-dom'
import { ArtistSidebar } from '@/components/artist/Sidebar'
import { ArtistHeader } from '@/components/artist/ArtistHeader'

export function ArtistLayout() {
  return (
    <div className="flex min-h-screen bg-[#090909] font-sans">
      {/* Sidebar always visible, handles its own mobile collapse */}
      <ArtistSidebar />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative h-screen">
        <ArtistHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}