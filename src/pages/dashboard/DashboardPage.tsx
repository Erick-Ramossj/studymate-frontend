import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckSquare, TrendingUp, Star, AlertTriangle, Clock, ChevronRight, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/api/dashboard.api'
import { useAuthStore } from '@/store/auth.store'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import {
  TASK_STATUS_COLORS, TASK_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
  RISK_LEVEL_COLORS, RISK_LEVEL_LABELS, formatRelative, formatDate, getRiskColor
} from '@/utils/format'
import type { StudentDashboard, TeacherDashboard, AdminDashboard, Task } from '@/types'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Mock fallback when backend is unavailable ────────────────────────────────
const MOCK_STUDENT: StudentDashboard = {
  user: { name: 'Estudiante Demo', educationLevel: 'UNIVERSITY', riskScore: 28, riskLevel: 'low' },
  stats: { enrolledCourses: 3, completedTasks: 12, pendingTasks: 4, averageScore: 78 },
  recentActivity: [],
  upcomingTasks: [
    { id: '1', userId: 'u1', title: 'Entrega de proyecto final', description: '', priority: 'HIGH', status: 'PENDING', reminder: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: new Date(Date.now() + 2 * 86400000).toISOString() },
    { id: '2', userId: 'u1', title: 'Estudiar para parcial de Álgebra', description: '', priority: 'MEDIUM', status: 'IN_PROGRESS', reminder: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: new Date(Date.now() + 4 * 86400000).toISOString() },
    { id: '3', userId: 'u1', title: 'Leer capítulo 5 de Anatomía', description: '', priority: 'LOW', status: 'PENDING', reminder: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  enrolledCourses: [],
  recentAssessments: [],
  weeklyProgress: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
    tasksCompleted: Math.floor(Math.random() * 4),
    lessonsCompleted: Math.floor(Math.random() * 3),
    assessmentsTaken: Math.floor(Math.random() * 2),
    minutesStudied: Math.floor(Math.random() * 90) + 10,
  })),
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
    retry: false,
  })

  if (isLoading) return <PageLoader />

  if (user?.role === 'ADMIN') {
    const d = (data?.data?.data as AdminDashboard) ?? null
    return <AdminDashboard data={d} />
  }
  if (user?.role === 'TEACHER') {
    const d = (data?.data?.data as TeacherDashboard) ?? null
    return <TeacherDashboard data={d} />
  }

  const d = (data?.data?.data as StudentDashboard) ?? MOCK_STUDENT
  return <StudentDashboard data={d} userName={user?.name ?? 'Estudiante'} />
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ data, userName }: { data: StudentDashboard; userName: string }) {
  const chartData = data.weeklyProgress.map((d) => ({
    day: format(parseISO(d.date), 'EEE', { locale: es }),
    Tareas: d.tasksCompleted,
    Lecciones: d.lessonsCompleted,
    Minutos: d.minutesStudied,
  }))

  const riskColor = getRiskColor(data.user.riskScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hola, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">Aquí está tu resumen de hoy</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1a1d27] border border-[#2e3245] rounded-xl px-4 py-2">
          <Flame size={16} className="text-orange-400" />
          <span className="text-white text-sm font-medium">Racha: 7 días</span>
        </div>
      </div>

      {/* Risk alert */}
      {data.user.riskScore >= 60 && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium text-sm">Alerta de riesgo académico</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Tu nivel de riesgo es alto. Habla con el Tutor IA para retomar el ritmo.
            </p>
          </div>
          <Link to="/ai-tutor" className="ml-auto">
            <Button variant="danger" size="sm">Ir al tutor</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cursos activos"
          value={data.stats.enrolledCourses}
          icon={<BookOpen size={18} />}
          iconColor="bg-indigo-500/20 text-indigo-400"
        />
        <StatCard
          title="Tareas completadas"
          value={data.stats.completedTasks}
          icon={<CheckSquare size={18} />}
          iconColor="bg-green-500/20 text-green-400"
        />
        <StatCard
          title="Tareas pendientes"
          value={data.stats.pendingTasks}
          subtitle={data.stats.pendingTasks > 3 ? '¡Atención!' : 'Al día'}
          icon={<Clock size={18} />}
          iconColor="bg-yellow-500/20 text-yellow-400"
        />
        <StatCard
          title="Promedio notas"
          value={`${data.stats.averageScore}%`}
          icon={<Star size={18} />}
          iconColor="bg-purple-500/20 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad semanal</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTareas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLecciones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e3245" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1d27', border: '1px solid #2e3245', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="Tareas" stroke="#6366f1" fill="url(#colorTareas)" strokeWidth={2} />
              <Area type="monotone" dataKey="Lecciones" stroke="#22c55e" fill="url(#colorLecciones)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk score */}
        <Card className="flex flex-col items-center justify-center text-center gap-4">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Riesgo de abandono</p>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2e3245" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={riskColor} strokeWidth="3"
                strokeDasharray={`${data.user.riskScore} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white text-2xl font-bold">{data.user.riskScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div>
            <Badge
              variant={data.user.riskLevel === 'low' ? 'success' : data.user.riskLevel === 'medium' ? 'warning' : 'danger'}
            >
              Nivel {RISK_LEVEL_LABELS[data.user.riskLevel]}
            </Badge>
            <p className="text-slate-500 text-xs mt-2">
              {data.user.riskLevel === 'low' && 'Vas muy bien, sigue así'}
              {data.user.riskLevel === 'medium' && 'Presta atención a tus tareas'}
              {data.user.riskLevel === 'high' && 'Necesitas apoyo inmediato'}
            </p>
          </div>
          <Link to="/progress" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
            Ver detalles <ChevronRight size={12} />
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming tasks */}
        <Card>
          <CardHeader className="flex items-center justify-between mb-4">
            <CardTitle>Próximas tareas</CardTitle>
            <Link to="/tasks" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
              Ver todas <ChevronRight size={12} />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {data.upcomingTasks.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">Sin tareas pendientes 🎉</p>
            )}
            {data.upcomingTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader><CardTitle>Acceso rápido</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nueva tarea', to: '/tasks', icon: <CheckSquare size={18} />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
              { label: 'Hacer evaluación', to: '/assessments', icon: <TrendingUp size={18} />, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
              { label: 'Tutor IA', to: '/ai-tutor', icon: <Star size={18} />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
              { label: 'Ver cursos', to: '/courses', icon: <BookOpen size={18} />, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105 ${item.color}`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#242736] rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{task.title}</p>
        {task.dueDate && (
          <p className="text-slate-500 text-xs mt-0.5">{formatDate(task.dueDate)}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${TASK_STATUS_COLORS[task.status]}`}>
          {TASK_STATUS_LABELS[task.status]}
        </span>
      </div>
    </div>
  )
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
function TeacherDashboard({ data }: { data: TeacherDashboard | null }) {
  const user = useAuthStore((s) => s.user)
  const d = data ?? {
    stats: { totalCourses: 2, totalStudents: 34, totalActiveCourses: 2 },
    myCourses: [],
    recentEnrollments: [],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel del Docente</h1>
        <p className="text-slate-400 mt-1">Hola, {user?.name}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Mis cursos" value={d.stats.totalCourses} icon={<BookOpen size={18} />} iconColor="bg-indigo-500/20 text-indigo-400" />
        <StatCard title="Estudiantes" value={d.stats.totalStudents} icon={<TrendingUp size={18} />} iconColor="bg-green-500/20 text-green-400" />
        <StatCard title="Cursos activos" value={d.stats.totalActiveCourses} icon={<Star size={18} />} iconColor="bg-purple-500/20 text-purple-400" />
      </div>
      <Card>
        <CardHeader><CardTitle>Mis cursos</CardTitle></CardHeader>
        {d.myCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No tienes cursos creados aún.</p>
            <Link to="/courses">
              <Button className="mt-4" size="sm">Crear primer curso</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {d.myCourses.map((c) => (
              <Link key={c.id} to={`/courses/${c.id}`}>
                <div className="flex items-center justify-between p-3 bg-[#242736] rounded-xl hover:bg-[#2e3245] transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{c.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{c.studentCount ?? 0} estudiantes</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ data }: { data: AdminDashboard | null }) {
  const d = data ?? {
    stats: { totalUsers: 127, totalStudents: 110, totalTeachers: 15, totalCourses: 24, totalAssessments: 342 },
    usersByLevel: [],
    recentUsers: [],
    highRiskStudents: [],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-slate-400 mt-1">Resumen global de la plataforma</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Usuarios" value={d.stats.totalUsers} icon={<Star size={18} />} iconColor="bg-indigo-500/20 text-indigo-400" />
        <StatCard title="Estudiantes" value={d.stats.totalStudents} icon={<BookOpen size={18} />} iconColor="bg-green-500/20 text-green-400" />
        <StatCard title="Docentes" value={d.stats.totalTeachers} icon={<TrendingUp size={18} />} iconColor="bg-blue-500/20 text-blue-400" />
        <StatCard title="Cursos" value={d.stats.totalCourses} icon={<CheckSquare size={18} />} iconColor="bg-purple-500/20 text-purple-400" />
        <StatCard title="Evaluaciones" value={d.stats.totalAssessments} icon={<Star size={18} />} iconColor="bg-yellow-500/20 text-yellow-400" />
      </div>
      {d.highRiskStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              Estudiantes en riesgo alto
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {d.highRiskStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-[#242736] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-slate-500 text-xs">{s.email}</p>
                  </div>
                </div>
                <Badge variant="danger">Riesgo: {s.riskScore}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// Suppress unused import warning
void formatRelative
