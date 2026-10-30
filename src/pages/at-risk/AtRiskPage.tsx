import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { progressApi } from '@/api/progress.api'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { ShieldAlert, Mail, CheckCircle2, GraduationCap } from 'lucide-react'
import { RISK_LEVEL_LABELS, getRiskColor, formatRelative } from '@/utils/format'
import type { AtRiskStudent } from '@/types'
import toast from 'react-hot-toast'

export function AtRiskPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const [scope, setScope] = useState<'advisees' | 'all'>(isAdmin ? 'all' : 'advisees')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['at-risk-students', scope],
    queryFn: () => progressApi.atRiskStudents(isAdmin ? scope : 'advisees'),
    retry: false,
  })

  const students: AtRiskStudent[] = data?.data?.data ?? []

  const resolveMutation = useMutation({
    mutationFn: ({ alertId, note }: { alertId: string; note: string }) =>
      progressApi.resolveAlert(alertId, note),
    onSuccess: () => {
      toast.success('Alerta resuelta')
      queryClient.invalidateQueries({ queryKey: ['at-risk-students'] })
    },
    onError: () => toast.error('No se pudo resolver la alerta'),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={22} className="text-red-400" />
            Estudiantes en riesgo de abandono
          </h1>
          <p className="text-slate-400 mt-1">
            {isAdmin
              ? 'Supervisa y atiende a los estudiantes con mayor riesgo de deserción.'
              : 'Becarios a tu cargo que necesitan seguimiento para evitar la deserción.'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 bg-[#1a1d27] border border-[#2e3245] rounded-xl p-1">
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                scope === 'all' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setScope('advisees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                scope === 'advisees' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mis asesorados
            </button>
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center gap-3 py-12">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 size={26} className="text-green-400" />
          </div>
          <p className="text-white font-semibold">Ningún estudiante en riesgo</p>
          <p className="text-slate-400 text-sm max-w-md">
            No hay estudiantes que requieran tu atención en este momento. Buen trabajo.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {students.map((s) => (
            <StudentRiskCard
              key={s.userId}
              student={s}
              resolving={resolveMutation.isPending}
              onResolve={(alertId, note) => resolveMutation.mutate({ alertId, note })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StudentRiskCard({
  student,
  resolving,
  onResolve,
}: {
  student: AtRiskStudent
  resolving: boolean
  onResolve: (alertId: string, note: string) => void
}) {
  const [note, setNote] = useState('')
  const [showResolve, setShowResolve] = useState(false)
  const color = getRiskColor(student.riskScore)

  function submit() {
    if (!student.openAlertId) {
      toast.error('No hay alerta abierta para resolver')
      return
    }
    onResolve(student.openAlertId, note.trim())
    setShowResolve(false)
    setNote('')
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2e3245" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={color} strokeWidth="3"
                strokeDasharray={`${student.riskScore} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{student.riskScore}</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-medium truncate">{student.name}</p>
              {student.isScholarship && (
                <span title="Becario">
                  <GraduationCap size={14} className="text-indigo-400 flex-shrink-0" />
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs truncate flex items-center gap-1">
              <Mail size={11} /> {student.email}
            </p>
            {student.lastAlertAt && (
              <p className="text-slate-600 text-[11px] mt-0.5">
                Última alerta {formatRelative(student.lastAlertAt)}
              </p>
            )}
          </div>
        </div>
        <Badge
          variant={student.riskLevel === 'low' ? 'success' : student.riskLevel === 'medium' ? 'warning' : 'danger'}
        >
          {RISK_LEVEL_LABELS[student.riskLevel]}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs">
          {student.openAlerts > 0
            ? `${student.openAlerts} alerta(s) abierta(s)`
            : 'Sin alertas abiertas'}
        </span>
        {student.openAlertId && (
          <Button variant="outline" size="sm" onClick={() => setShowResolve((v) => !v)}>
            Registrar intervención
          </Button>
        )}
      </div>

      {showResolve && student.openAlertId && (
        <div className="space-y-2 border-t border-[#2e3245] pt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota de intervención (ej. contacté al estudiante y acordamos un nuevo horario)…"
            rows={2}
            className="w-full bg-[#242736] border border-[#2e3245] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500/50"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowResolve(false)
                setNote('')
              }}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={submit} loading={resolving}>
              <CheckCircle2 size={14} />
              Resolver alerta
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
