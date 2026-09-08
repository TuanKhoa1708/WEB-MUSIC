import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar, AdminMobileDrawer, MobileSidebarContext } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'

/**
 * AdminLayout — the shell for every admin page.
 *
 * Desktop (≥ 768px):
 *   ┌──────────────────────────────────────────────┐
 *   │  <AdminSidebar />  │  <AdminHeader />         │
 *   │   sticky, full-h   │  sticky top              │
 *   │                    ├──────────────────────────│
 *   │                    │  <Outlet />              │
 *   │                    │  scrollable content area │
 *   └──────────────────────────────────────────────┘
 *
 * Mobile (< 768px):
 *   ┌──────────────────────────────────────────────┐
 *   │  <AdminHeader />  (hamburger btn)            │
 *   ├──────────────────────────────────────────────┤
 *   │  <Outlet />  (full width)                    │
 *   └──────────────────────────────────────────────┘
 *   + <AdminMobileDrawer /> slides in from left on toggle
 */
export function AdminLayout() {
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
        {/* Desktop sidebar — hidden on mobile via CSS */}
        <div className="admin-sidebar-wrapper">
          <AdminSidebar />
        </div>

        {/* Mobile drawer */}
        <AdminMobileDrawer
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

      {/* Responsive admin sidebar styles */}
      <style>{`
        .admin-sidebar-wrapper {
          display: flex;
        }
        @media (max-width: 767px) {
          .admin-sidebar-wrapper {
            display: none;
          }
        }
      `}</style>
    </MobileSidebarContext.Provider>
  )
}
