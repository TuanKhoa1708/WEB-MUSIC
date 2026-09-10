import { Outlet } from 'react-router-dom'
import { ListenerSidebar } from '@/components/listener/Sidebar'
import { ListenerHeader } from '@/components/listener/Header'
import { GlobalMusicPlayer } from '@/components/listener/GlobalMusicPlayer'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'

export function ListenerLayout() {
  const { currentSong } = useMusicPlayer()

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#090909',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <ListenerSidebar />

      {/* Main column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Sticky header */}
        <ListenerHeader />

        {/* Scrollable page content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: currentSong ? 96 : 32,
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Global player — persists across all pages */}
      <GlobalMusicPlayer />
    </div>
  )
}
