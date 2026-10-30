import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Users, Clock, ChevronRight, Plus, Filter } from 'lucide-react'
import { coursesApi } from '@/api/courses.api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth.store'
import { EDUCATION_LEVEL_LABELS } from '@/utils/format'
import type { Course, EducationLevel } from '@/types'
import toast from 'react-hot-toast'

const LEVELS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los niveles' },
  { value: 'PRIMARY', label: 'Primaria' },
  { value: 'SECONDARY', label: 'Secundaria' },
  { value: 'TECHNICAL', label: 'Técnico' },
  { value: 'UNIVERSITY', label: 'Universidad' },
  { value: 'FREE', label: 'Libre' },
]

// Mock data for offline mode
const MOCK_COURSES: Course[] = [
  { id: '1', title: 'Matemáticas desde cero', description: 'Aprende los fundamentos de matemáticas paso a paso con ejercicios prácticos.', subjectId: 's1', teacherId: 't1', level: 'SECONDARY', isPublished: true, duration: 120, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enrollmentCount: 45, isEnrolled: false },
  { id: '2', title: 'Introducción a la Programación Web', description: 'HTML, CSS y JavaScript desde cero hasta crear tu primer sitio web completo.', subjectId: 's2', teacherId: 't1', level: 'UNIVERSITY', isPublished: true, duration: 200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enrollmentCount: 89, isEnrolled: true, enrollmentProgress: 42 },
  { id: '3', title: 'Inglés para principiantes', description: 'Vocabulario, gramática básica y conversación para comenzar desde cero.', subjectId: 's3', teacherId: 't2', level: 'PRIMARY', isPublished: true, duration: 90, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enrollmentCount: 120, isEnrolled: false },
  { id: '4', title: 'Álgebra Lineal aplicada', description: 'Matrices, vectores y transformaciones lineales con aplicaciones en ingeniería.', subjectId: 's4', teacherId: 't1', level: 'UNIVERSITY', isPublished: true, duration: 180, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enrollmentCount: 34, isEnrolled: true, enrollmentProgress: 75 },
  { id: '5', title: 'Química General', description: 'Fundamentos de química: átomos, moléculas, reacciones y laboratorio.', subjectId: 's5', teacherId: 't2', level: 'TECHNICAL', isPublished: true, duration: 150, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enrollmentCount: 67, isEnrolled: false },
  { id: '6', title: 'Historia Universal', description: 'Desde las civilizaciones antiguas hasta el mundo contemporáneo.', subjectId: 's6', teacherId: 't2', level: 'PRIMARY', isPublished: true, duration: 100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enrollmentCount: 55, isEnrolled: false },
]

export function CoursesPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['courses', { search, level }],
    queryFn: () => coursesApi.list({ search: search || undefined, level: level || undefined, limit: 20 }),
    retry: false,
  })

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.enroll(courseId),
    onSuccess: () => {
      toast.success('Te inscribiste exitosamente')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: () => toast.error('Error al inscribirse'),
  })

  const courses: Course[] = data?.data?.data ?? MOCK_COURSES

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase())
    const matchLevel = !level || c.level === level
    return matchSearch && matchLevel
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cursos</h1>
          <p className="text-slate-400 mt-1">Explora y accede a todo el contenido educativo</p>
        </div>
        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
          <Button size="sm">
            <Plus size={14} /> Crear curso
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-[#1a1d27] border border-[#2e3245] rounded-xl px-3 py-2 flex-1">
          <Search size={15} className="text-slate-500" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  level === l.value
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                    : 'bg-[#1a1d27] border-[#2e3245] text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* My enrolled courses */}
      {filtered.some((c) => c.isEnrolled) && (
        <div>
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" /> Mis cursos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter((c) => c.isEnrolled).map((c) => (
              <CourseCard key={c.id} course={c} onEnroll={enrollMutation.mutate} loading={enrollMutation.isPending} />
            ))}
          </div>
        </div>
      )}

      {/* All courses */}
      {isLoading ? (
        <PageLoader />
      ) : (
        <div>
          <h2 className="text-white font-semibold mb-3">
            {filtered.some((c) => c.isEnrolled) ? 'Explorar más cursos' : 'Todos los cursos'}
            <span className="text-slate-500 font-normal text-sm ml-2">({filtered.filter((c) => !c.isEnrolled).length})</span>
          </h2>
          {filtered.filter((c) => !c.isEnrolled).length === 0 && (
            <p className="text-slate-500 text-sm">No se encontraron cursos con esos filtros.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter((c) => !c.isEnrolled).map((c) => (
              <CourseCard key={c.id} course={c} onEnroll={enrollMutation.mutate} loading={enrollMutation.isPending} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, onEnroll, loading }: {
  course: Course
  onEnroll: (id: string) => void
  loading: boolean
}) {
  const levelColors: Record<EducationLevel, string> = {
    PRIMARY: 'bg-green-500/10 text-green-400',
    SECONDARY: 'bg-blue-500/10 text-blue-400',
    TECHNICAL: 'bg-orange-500/10 text-orange-400',
    UNIVERSITY: 'bg-indigo-500/10 text-indigo-400',
    FREE: 'bg-purple-500/10 text-purple-400',
  }

  return (
    <Card className="flex flex-col gap-4 hover:border-indigo-500/30 transition-colors group">
      {/* Thumbnail placeholder */}
      <div className="h-36 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/20 flex items-center justify-center border border-[#2e3245]">
        <BookOpen size={32} className="text-indigo-400/60" />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-indigo-300 transition-colors">
            {course.title}
          </h3>
          <Badge className={levelColors[course.level]}>
            {EDUCATION_LEVEL_LABELS[course.level]}
          </Badge>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
          <span className="flex items-center gap-1"><Users size={11} /> {course.enrollmentCount ?? 0}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {course.duration} min</span>
        </div>

        {/* Progress bar if enrolled */}
        {course.isEnrolled && course.enrollmentProgress !== undefined && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progreso</span>
              <span>{course.enrollmentProgress}%</span>
            </div>
            <div className="h-1.5 bg-[#242736] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${course.enrollmentProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/courses/${course.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            Ver curso <ChevronRight size={13} />
          </Button>
        </Link>
        {!course.isEnrolled && (
          <Button size="sm" onClick={() => onEnroll(course.id)} loading={loading}>
            Inscribirse
          </Button>
        )}
      </div>
    </Card>
  )
}
