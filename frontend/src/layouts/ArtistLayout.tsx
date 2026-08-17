import { Outlet } from 'react-router-dom'
import { ArtistSidebar } from '@/components/artist/Sidebar'
// Reusing AdminHeader for now as it provides a generic header with user info
import { AdminHeader } from '@/components/admin/Header'

export function ArtistLayout() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#090909',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <ArtistSidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <AdminHeader />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
