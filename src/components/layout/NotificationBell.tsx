import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, AlertTriangle, Sparkles, Info, Clock, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '@/api/notifications.api'
import { formatRelative } from '@/utils/format'
import type { Notification, NotificationType, NotificationList } from '@/types'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  RISK_ALERT: <AlertTriangle size={15} className="text-red-400" />,
  STUDY_PLAN: <Sparkles size={15} className="text-indigo-400" />,
  REMINDER: <Clock size={15} className="text-yellow-400" />,
  INFO: <Info size={15} className="text-slate-400" />,
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    retry: false,
    refetchInterval: 60_000,
  })

  const list: NotificationList = data?.data?.data ?? { items: [], unreadCount: 0 }

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function handleClick(n: Notification) {
    if (!n.read) markRead.mutate(n.id)
    if (n.type === 'STUDY_PLAN') {
      setOpen(false)
      navigate('/study-plan')
    } else if (n.type === 'RISK_ALERT') {
      setOpen(false)
      navigate('/progress')
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-400 hover:text-white transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={18} />
        {list.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-indigo-500 rounded-full text-[10px] text-white flex items-center justify-center">
            {list.unreadCount > 9 ? '9+' : list.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[26rem] overflow-y-auto bg-[#1a1d27] border border-[#2e3245] rounded-2xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e3245] sticky top-0 bg-[#1a1d27]">
            <p className="text-white text-sm font-semibold">Notificaciones</p>
            {list.unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1"
              >
                <CheckCheck size={13} />
                Marcar todas
              </button>
            )}
          </div>

          {list.items.length === 0 ? (
            <div className="py-10 text-center">
              <Bell size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <ul>
              {list.items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[#2e3245] hover:bg-[#242736] transition-colors ${
                      n.read ? '' : 'bg-indigo-500/5'
                    }`}
                  >
                    <span className="mt-0.5 flex-shrink-0">{TYPE_ICON[n.type]}</span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${n.read ? 'text-slate-300' : 'text-white'}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      </span>
                      <span className="block text-slate-400 text-xs mt-0.5 leading-relaxed">{n.body}</span>
                      <span className="block text-slate-600 text-[11px] mt-1">{formatRelative(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
