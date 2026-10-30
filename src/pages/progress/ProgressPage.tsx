import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { progressApi } from '@/api/progress.api'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { BookOpen, CheckSquare, ClipboardList, Flame, RefreshCw, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react'
import { getRiskColor, RISK_LEVEL_LABELS } from '@/utils/format'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProgressOverview, RiskScore, WeeklyDay } from '@/types'
import toast from 'react-hot-toast'

const MOCK_OVERVIEW: ProgressOverview = {
  totalCourses: 3, completedCourses: 1, totalTasks: 18, completedTasks: 12,
  pendingTasks: 4, overdueTasks: 2, totalAssessments: 8, averageScore: 78,
  studyStreak: 7, riskScore: 28, riskLevel: 'low',
}

const MOCK_WEEKLY: WeeklyDay[] = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
  tasksCompleted: Math.floor(Math.random() * 4),
  lessonsCompleted: Math.floor(Math.random() * 3),
  assessmentsTaken: i % 3 === 0 ? 1 : 0,
  minutesStudied: Math.floor(Math.random() * 90) + 20,
}))

const MOCK_RISK: RiskScore = {
  score: 28, level: 'low',
  factors: { daysSinceLastActivity: 1, overdueTasksCount: 2, averageAssessmentScore: 78, chatSessionsLastWeek: 3, daysSinceRegistration: 30, diagnosticDone: true },
  alerts: [],
}

export function ProgressPage() {
  const queryClient = useQueryClient()

  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['progress-overview'],
    queryFn: () => progressApi.overview(),
    retry: false,
  })

  const { data: weeklyData } = useQuery({
    queryKey: ['progress-weekly'],
    queryFn: () => progressApi.weekly(),
    retry: false,
  })

  const { data: riskData } = useQuery({
    queryKey: ['risk-score'],
    queryFn: () => progressApi.riskScore(),
    retry: false,
  })

  const recalcMutation = useMutation({
    mutationFn: () => progressApi.recalculateRisk(),
    onSuccess: () => {
      toast.success('Riesgo recalculado')
      queryClient.invalidateQueries({ queryKey: ['risk-score'] })
    },
    onError: () => toast.error('Error al recalcular'),
  })

  const overview: ProgressOverview = overviewData?.data?.data ?? MOCK_OVERVIEW
  const weekly: WeeklyDay[] = weeklyData?.data?.data ?? MOCK_WEEKLY
  const risk: RiskScore = riskData?.data?.data ?? MOCK_RISK

  const chartData = weekly.map((d) => ({
    day: format(parseISO(d.date), 'EEE', { locale: es }),
    Tareas: d.tasksCompleted,
    Lecciones: d.lessonsCompleted,
    Minutos: d.minutesStudied,
  }))

  const radarData = [
    { subject: 'Actividad', A: Math.max(0, 100 - risk.factors.daysSinceLastActivity * 10) },
    { subject: 'Tareas', A: Math.max(0, 100 - risk.factors.overdueTasksCount * 20) },
    { subject: 'Evaluaciones', A: risk.factors.averageAssessmentScore },
    { subject: 'Tutor IA', A: Math.min(100, risk.factors.chatSessionsLastWeek * 20) },
    { subject: 'Diagnóstico', A: risk.factors.diagnosticDone ? 100 : 0 },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Progreso</h1>
          <p className="text-slate-400 mt-1">Seguimiento completo de tu avance académico</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1a1d27] border border-[#2e3245] rounded-xl px-4 py-2">
          <Flame size={16} className="text-orange-400" />
          <span className="text-white text-sm font-medium">{overview.studyStreak} días de racha</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Cursos activos" value={overview.totalCourses} icon={<BookOpen size={18} />} iconColor="bg-indigo-500/20 text-indigo-400" />
        <StatCard title="Tareas completadas" value={`${overview.completedTasks}/${overview.totalTasks}`} icon={<CheckSquare size={18} />} iconColor="bg-green-500/20 text-green-400" />
        <StatCard title="Evaluaciones" value={overview.totalAssessments} icon={<ClipboardList size={18} />} iconColor="bg-purple-500/20 text-purple-400" />
        <StatCard title="Promedio notas" value={`${overview.averageScore}%`} icon={<TrendingUp size={18} />} iconColor="bg-yellow-500/20 text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Actividad de los últimos 7 días</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3245" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1d27', border: '1px solid #2e3245', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="Tareas" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Lecciones" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk score card */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle>Riesgo de abandono</CardTitle>
            <Button
              variant="ghost" size="sm"
              onClick={() => recalcMutation.mutate()}
              loading={recalcMutation.isPending}
              title="Recalcular"
            >
              <RefreshCw size={14} />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2e3245" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={getRiskColor(risk.score)} strokeWidth="3"
                  strokeDasharray={`${risk.score} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white text-xl font-bold">{risk.score}</span>
              </div>
            </div>
            <div>
              <Badge
                variant={risk.level === 'low' ? 'success' : risk.level === 'medium' ? 'warning' : 'danger'}
                className="text-sm"
              >
                {RISK_LEVEL_LABELS[risk.level]}
              </Badge>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                {risk.level === 'low' && 'Excelente ritmo de estudio'}
                {risk.level === 'medium' && 'Presta atención a las tareas vencidas'}
                {risk.level === 'high' && 'Busca apoyo en el Tutor IA'}
              </p>
            </div>
          </div>

          {/* Factors */}
          <div className="space-y-2 text-xs">
            <RiskFactor
              label="Días sin actividad"
              value={risk.factors.daysSinceLastActivity}
              good={risk.factors.daysSinceLastActivity <= 1}
            />
            <RiskFactor
              label="Tareas vencidas"
              value={risk.factors.overdueTasksCount}
              good={risk.factors.overdueTasksCount === 0}
            />
            <RiskFactor
              label="Promedio evaluaciones"
              value={`${risk.factors.averageAssessmentScore}%`}
              good={risk.factors.averageAssessmentScore >= 70}
            />
            <RiskFactor
              label="Sesiones tutor (semana)"
              value={risk.factors.chatSessionsLastWeek}
              good={risk.factors.chatSessionsLastWeek >= 2}
            />
          </div>

          {risk.alerts.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{risk.alerts.length} alerta(s) activa(s)</p>
            </div>
          )}
        </Card>
      </div>

      {/* Radar chart */}
      <Card>
        <CardHeader><CardTitle>Perfil de rendimiento</CardTitle></CardHeader>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2e3245" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Radar
                name="Tu perfil" dataKey="A"
                stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Courses progress */}
      <Card>
        <CardHeader><CardTitle>Progreso por curso</CardTitle></CardHeader>
        <div className="space-y-4">
          {[
            { title: 'Introducción a la Programación Web', progress: 42, subject: 'Tecnología' },
            { title: 'Álgebra Lineal aplicada', progress: 75, subject: 'Ciencias' },
            { title: 'Inglés para principiantes', progress: 20, subject: 'Idiomas' },
          ].map((c) => (
            <div key={c.title}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-white text-sm font-medium">{c.title}</p>
                  <p className="text-slate-500 text-xs">{c.subject}</p>
                </div>
                <span className="text-indigo-400 font-bold text-sm">{c.progress}%</span>
              </div>
              <div className="h-2 bg-[#242736] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${c.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function RiskFactor({ label, value, good }: { label: string; value: string | number; good: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-white font-medium">{value}</span>
        {good
          ? <ShieldCheck size={12} className="text-green-400" />
          : <AlertTriangle size={12} className="text-yellow-400" />
        }
      </div>
    </div>
  )
}
