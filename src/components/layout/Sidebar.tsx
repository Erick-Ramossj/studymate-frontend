import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CheckSquare, ClipboardList,
  TrendingUp, Bot, Library, Users, Settings, LogOut,
  GraduationCap, Shield, Menu,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Cursos', to: '/courses', icon: <BookOpen size={18} /> },
  { label: 'Tareas', to: '/tasks', icon: <CheckSquare size={18} /> },
  { label: 'Evaluaciones', to: '/assessments', icon: <ClipboardList size={18} /> },
  { label: 'Mi Progreso', to: '/progress', icon: <TrendingUp size={18} /> },
  { label: 'Tutor IA', to: '/ai-tutor', icon: <Bot size={18} /> },
  { label: 'Biblioteca', to: '/library', icon: <Library size={18} /> },
  { label: 'Comunidad', to: '/community', icon: <Users size={18} /> },
  { label: 'Administración', to: '/admin', icon: <Shield size={18} />, roles: ['ADMIN'] },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300',
          'bg-[#1a1d27] border-r border-[#2e3245]',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[#2e3245]">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold text-lg tracking-tight">StudyMate</span>
          )}
          <button
            onClick={toggleSidebar}
            className="ml-auto text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      'text-slate-400 hover:text-white hover:bg-[#242736]',
                      isActive && 'text-white bg-indigo-500/20 border border-indigo-500/30',
                    )
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="border-t border-[#2e3245] p-3">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-slate-500 text-xs capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm',
              'text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all',
            )}
            title={!sidebarOpen ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
