import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studyPlanApi } from '@/api/studyPlan.api'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import {
  Sparkles, RefreshCw, CheckCircle2, Circle, SkipForward, Target,
  BookOpen, Clock, AlertCircle,
} from 'lucide-react'
import { formatRelative } from '@/utils/format'
import type { StudyPlan, StudyPlanItem, PlanItemStatus } from '@/types'
import toast from 'react-hot-toast'

const FOCUS_META: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  refuerzo: { label: 'Refuerzo', className: 'bg-indigo-500/15 text-indigo-400', icon: <Target size={14} /> },
  diagnóstico: { label: 'Diagnóstico', className: 'bg-blue-500/15 text-blue-400', icon: <BookOpen size={14} /> },
  recuperación: { label: 'Recuperación', className: 'bg-red-500/15 text-red-400', icon: <AlertCircle size={14} /> },
  hábito: { label: 'Hábito', className: 'bg-green-500/15 text-green-400', icon: <Clock size={14} /> },
}

export function StudyPlanPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['study-plan'],
    queryFn: () => studyPlanApi.get(),
    retry: false,
  })

  const plan: StudyPlan | null = data?.data?.data ?? null

  const generateMutation = useMutation({
    mutationFn: () => studyPlanApi.generate(),
    onSuccess: () => {
      toast.success('Plan de estudio generado')
      queryClient.invalidateQueries({ queryKey: ['study-plan'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('No se pudo generar el plan'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: PlanItemStatus }) =>
      studyPlanApi.updateItem(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast.error('No se pudo actualizar la actividad'),
  })

  if (isLoading) return <PageLoader />

  const completed = plan?.items.filter((i) => i.status === 'DONE').length ?? 0
  const total = plan?.items.length ?? 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={22} className="text-indigo-400" />
            Plan de estudio personalizado
          </h1>
          <p className="text-slate-400 mt-1">
            Actividades priorizadas según tu desempeño, tus materias y tu tiempo disponible.
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          loading={generateMutation.isPending}
        >
          {plan ? <RefreshCw size={16} /> : <Sparkles size={16} />}
          {plan ? 'Regenerar plan' : 'Generar mi plan'}
        </Button>
      </div>

      {!plan ? (
        <Card className="flex flex-col items-center justify-center text-center gap-4 py-12">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
            <Sparkles size={26} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Aún no tienes un plan de estudio</p>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              Genera un plan personalizado para organizar tu avance, reforzar tus puntos débiles
              y evitar quedarte atrás en tus cursos.
            </p>
          </div>
          <Button
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
          >
            <Sparkles size={16} />
            Generar mi plan
          </Button>
        </Card>
      ) : (
        <>
          {/* Plan summary */}
          <Card>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>{plan.title}</CardTitle>
                <p className="text-slate-400 text-sm mt-1">{plan.summary}</p>
                <p className="text-slate-500 text-xs mt-2">
                  Generado {formatRelative(plan.generatedAt)} · {plan.weeklyHours} h/semana
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{pct}%</p>
                <p className="text-slate-500 text-xs">{completed} de {total} completadas</p>
              </div>
            </div>
            <div className="h-2 bg-[#242736] rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </Card>

          {/* Plan items */}
          <Card>
            <CardHeader><CardTitle>Tus actividades</CardTitle></CardHeader>
            <div className="space-y-3">
              {plan.items.map((item) => (
                <PlanItemRow
                  key={item.id}
                  item={item}
                  busy={updateMutation.isPending}
                  onToggle={(status) => updateMutation.mutate({ itemId: item.id, status })}
                />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function PlanItemRow({
  item,
  busy,
  onToggle,
}: {
  item: StudyPlanItem
  busy: boolean
  onToggle: (status: PlanItemStatus) => void
}) {
  const done = item.status === 'DONE'
  const skipped = item.status === 'SKIPPED'
  const focus = FOCUS_META[item.focus] ?? {
    label: item.focus,
    className: 'bg-slate-500/15 text-slate-400',
    icon: <Target size={14} />,
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
        done
          ? 'bg-green-500/5 border-green-500/20'
          : skipped
          ? 'bg-[#1a1d27] border-[#2e3245] opacity-60'
          : 'bg-[#242736] border-[#2e3245]'
      }`}
    >
      <button
        onClick={() => onToggle(done ? 'PENDING' : 'DONE')}
        disabled={busy}
        className="mt-0.5 flex-shrink-0 disabled:opacity-50"
        aria-label={done ? 'Marcar como pendiente' : 'Marcar como completada'}
        title={done ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {done
          ? <CheckCircle2 size={20} className="text-green-400" />
          : <Circle size={20} className="text-slate-500 hover:text-indigo-400 transition-colors" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-white'}`}>
            {item.title}
          </p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${focus.className}`}>
            {focus.icon}
            {focus.label}
          </span>
          {item.subject && (
            <Badge variant="default" className="text-xs">{item.subject.name}</Badge>
          )}
        </div>
        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.description}</p>
      </div>

      {!done && (
        <button
          onClick={() => onToggle(skipped ? 'PENDING' : 'SKIPPED')}
          disabled={busy}
          className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
          aria-label={skipped ? 'Reactivar actividad' : 'Omitir actividad'}
          title={skipped ? 'Reactivar actividad' : 'Omitir actividad'}
        >
          <SkipForward size={16} />
        </button>
      )}
    </div>
  )
}
