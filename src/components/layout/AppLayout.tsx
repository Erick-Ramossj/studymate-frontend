import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store/ui.store'

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Sidebar />
      <Header />
      <main
        className="min-h-screen pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '15rem' : '4rem' }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
