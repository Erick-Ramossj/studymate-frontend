import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { EDUCATION_LEVEL_LABELS } from '@/utils/format'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <header
      className="fixed top-0 right-0 h-16 z-10 flex items-center justify-between px-6 border-b border-[#2e3245] bg-[#0f1117]/80 backdrop-blur-sm transition-all duration-300"
      style={{ left: sidebarOpen ? '15rem' : '4rem' }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 bg-[#1a1d27] border border-[#2e3245] rounded-xl px-3 py-2 w-72 max-w-xs">
        <Search size={15} className="text-slate-500" />
        <input
          type="text"
          placeholder="Buscar cursos, tareas..."
          className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none flex-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-slate-500 text-xs">{EDUCATION_LEVEL_LABELS[user.educationLevel]}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
