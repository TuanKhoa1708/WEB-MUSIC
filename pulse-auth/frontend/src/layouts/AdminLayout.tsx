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
      <div className="flex min-h-screen bg-[#090909] font-sans">
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
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative h-screen">
          {/* Header */}
          <AdminHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>

    </MobileSidebarContext.Provider>
  )
}
