import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ClipboardList, Star, TrendingUp, Play, ChevronRight } from 'lucide-react'
import { assessmentsApi } from '@/api/assessments.api'
import { coursesApi } from '@/api/courses.api'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/format'
import type { Assessment, Subject } from '@/types'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: 'a1', userId: 'u1', subjectId: 's1', title: 'Evaluación de Matemáticas', score: 85, maxScore: 100, timeSpentMin: 12, completedAt: new Date(Date.now() - 86400000).toISOString(), subject: { id: 's1', name: 'Matemáticas', level: 'SECONDARY', category: 'Ciencias', iconName: 'Calculator', color: '#6366f1' } },
  { id: 'a2', userId: 'u1', subjectId: 's2', title: 'Quiz de Programación', score: 70, maxScore: 100, timeSpentMin: 8, completedAt: new Date(Date.now() - 3 * 86400000).toISOString(), subject: { id: 's2', name: 'Programación Web', level: 'UNIVERSITY', category: 'Tecnología', iconName: 'Code', color: '#22c55e' } },
  { id: 'a3', userId: 'u1', subjectId: 's3', title: 'Test de Inglés', score: 90, maxScore: 100, timeSpentMin: 15, completedAt: new Date(Date.now() - 7 * 86400000).toISOString(), subject: { id: 's3', name: 'Inglés', level: 'SECONDARY', category: 'Idiomas', iconName: 'Globe', color: '#f59e0b' } },
]

const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', name: 'Matemáticas', level: 'SECONDARY', category: 'Ciencias', iconName: 'Calculator', color: '#6366f1' },
  { id: 's2', name: 'Programación Web', level: 'UNIVERSITY', category: 'Tecnología', iconName: 'Code', color: '#22c55e' },
  { id: 's3', name: 'Inglés Básico', level: 'PRIMARY', category: 'Idiomas', iconName: 'Globe', color: '#f59e0b' },
  { id: 's4', name: 'Álgebra Lineal', level: 'UNIVERSITY', category: 'Ciencias', iconName: 'Function', color: '#8b5cf6' },
  { id: 's5', name: 'Química General', level: 'TECHNICAL', category: 'Ciencias', iconName: 'Flask', color: '#ef4444' },
  { id: 's6', name: 'Historia Universal', level: 'PRIMARY', category: 'Humanidades', iconName: 'BookOpen', color: '#06b6d4' },
]

export function AssessmentsPage() {
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const { data: histData, isLoading: histLoading } = useQuery({
    queryKey: ['assessments-history'],
    queryFn: () => assessmentsApi.history(),
    retry: false,
  })

  const { data: statsData } = useQuery({
    queryKey: ['assessments-stats'],
    queryFn: () => assessmentsApi.stats(),
    retry: false,
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => coursesApi.getSubjects(),
    retry: false,
  })

  const startMutation = useMutation({
    mutationFn: (subjectId: string) => assessmentsApi.start(subjectId, 5),
    onSuccess: (res) => {
      const id = res.data.data?.assessmentId
      if (id) navigate(`/assessments/${id}/take`, { state: { questions: res.data.data?.questions } })
    },
    onError: () => toast.error('No hay preguntas disponibles para esta materia'),
  })

  const assessments: Assessment[] = histData?.data?.data ?? MOCK_ASSESSMENTS
  const subjects: Subject[] = subjectsData?.data?.data ?? MOCK_SUBJECTS
  const stats = statsData?.data?.data ?? { averageScore: 82, bestScore: 95, totalCompleted: 12, scoresBySubject: [] }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (histLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Evaluaciones</h1>
        <p className="text-slate-400 mt-1">Pon a prueba tus conocimientos y recibe retroalimentación inmediata</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Promedio general" value={`${stats.averageScore}%`} icon={<Star size={18} />} iconColor="bg-yellow-500/20 text-yellow-400" />
        <StatCard title="Mejor nota" value={`${stats.bestScore}%`} icon={<TrendingUp size={18} />} iconColor="bg-green-500/20 text-green-400" />
        <StatCard title="Completadas" value={stats.totalCompleted} icon={<ClipboardList size={18} />} iconColor="bg-indigo-500/20 text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start new evaluation */}
        <Card>
          <CardHeader><CardTitle>Iniciar evaluación</CardTitle></CardHeader>
          <p className="text-slate-400 text-sm mb-4">Selecciona una materia y responde 5 preguntas</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id === selectedSubject ? null : s.id)}
                className={`p-3 rounded-xl border text-left transition-all text-sm ${
                  selectedSubject === s.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-[#2e3245] bg-[#242736] hover:border-[#3e4255]'
                }`}
              >
                <p className="text-white font-medium text-xs truncate">{s.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.category}</p>
              </button>
            ))}
          </div>
          <Button
            className="w-full"
            disabled={!selectedSubject}
            loading={startMutation.isPending}
            onClick={() => selectedSubject && startMutation.mutate(selectedSubject)}
          >
            <Play size={14} /> Comenzar evaluación
          </Button>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="flex items-center justify-between mb-4">
            <CardTitle>Historial reciente</CardTitle>
            <Badge variant="default">{assessments.length} total</Badge>
          </CardHeader>
          <div className="space-y-3">
            {assessments.slice(0, 5).map((a) => (
              <Link key={a.id} to={`/assessments/${a.id}/result`}>
                <div className="flex items-center gap-3 p-3 bg-[#242736] rounded-xl hover:bg-[#2e3245] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (a.subject?.color ?? '#6366f1') + '20' }}>
                    <ClipboardList size={16} style={{ color: a.subject?.color ?? '#6366f1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{a.title}</p>
                    <p className="text-slate-500 text-xs">{a.subject?.name} · {formatDate(a.completedAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${getScoreColor(a.score)}`}>{a.score}%</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
