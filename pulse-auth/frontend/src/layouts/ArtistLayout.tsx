import { Outlet } from 'react-router-dom'
import { ArtistSidebar } from '@/components/artist/Sidebar'
import { ArtistHeader } from '@/components/artist/ArtistHeader'

export function ArtistLayout() {
  return (
    <div className="flex min-h-screen bg-[#090909] font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Ẩn sidebar trên màn hình nhỏ, hiển thị từ tablet (md) trở lên */}
      <div className="hidden md:block">
        <ArtistSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative">
        <ArtistHeader />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
