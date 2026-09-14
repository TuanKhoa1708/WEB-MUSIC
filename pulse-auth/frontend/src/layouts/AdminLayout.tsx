import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'

/**
 * AdminLayout — the shell for every admin page.
 */
export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#090909] font-sans">
      {/* Sidebar always visible, handles its own mobile collapse */}
      <AdminSidebar />

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
  )
}
