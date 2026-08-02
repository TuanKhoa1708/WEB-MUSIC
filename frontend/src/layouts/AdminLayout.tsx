import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'

/**
 * AdminLayout — the shell for every admin page.
 *
 * Structure:
 *   ┌──────────────────────────────────────────────┐
 *   │  <AdminSidebar />  │  <AdminHeader />         │
 *   │   sticky, full-h   │  sticky top              │
 *   │                    ├──────────────────────────│
 *   │                    │  <Outlet />              │
 *   │                    │  scrollable content area │
 *   └──────────────────────────────────────────────┘
 */
export function AdminLayout() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#090909',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <AdminSidebar />

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
        <AdminHeader />

        {/* Page content */}
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
