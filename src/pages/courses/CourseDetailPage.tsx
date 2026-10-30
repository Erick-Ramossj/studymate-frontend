import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Clock, Users, CheckCircle, Circle, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { coursesApi } from '@/api/courses.api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { EDUCATION_LEVEL_LABELS } from '@/utils/format'
import type { Course, Unit } from '@/types'
import toast from 'react-hot-toast'

const MOCK_COURSE: Course = {
  id: '2', title: 'Introducción a la Programación Web', description: 'Aprende HTML, CSS y JavaScript desde cero. Este curso está diseñado para personas sin experiencia previa en programación. Al finalizarlo podrás crear sitios web completos y funcionales.',
  subjectId: 's2', teacherId: 't1', level: 'UNIVERSITY', isPublished: true, duration: 200,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  enrollmentCount: 89, isEnrolled: true, enrollmentProgress: 42,
  units: [
    { id: 'u1', courseId: '2', title: 'Fundamentos de HTML', order: 1, lessons: [
      { id: 'l1', unitId: 'u1', title: 'Estructura básica de una página web', content: 'En esta lección aprenderás la estructura básica del HTML...', duration: 15, order: 1, completed: true },
      { id: 'l2', unitId: 'u1', title: 'Etiquetas y elementos', content: 'Las etiquetas son los bloques fundamentales de HTML...', duration: 20, order: 2, completed: true },
      { id: 'l3', unitId: 'u1', title: 'Formularios en HTML', content: 'Los formularios permiten capturar datos del usuario...', duration: 25, order: 3, completed: false },
    ]},
    { id: 'u2', courseId: '2', title: 'CSS y Diseño Visual', order: 2, lessons: [
      { id: 'l4', unitId: 'u2', title: 'Selectores y propiedades CSS', content: 'CSS controla la apariencia visual de los elementos HTML...', duration: 20, order: 1, completed: false },
      { id: 'l5', unitId: 'u2', title: 'Flexbox y Grid', content: 'Flexbox y CSS Grid son los sistemas de layout modernos...', duration: 30, order: 2, completed: false },
      { id: 'l6', unitId: 'u2', title: 'Diseño responsive', content: 'El diseño responsive adapta el sitio a cualquier pantalla...', duration: 25, order: 3, completed: false },
    ]},
  ],
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(['u1']))

  const { data, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(id!),
    retry: false,
  })

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(id!),
    onSuccess: () => {
      toast.success('Inscripción exitosa')
      queryClient.invalidateQueries({ queryKey: ['course', id] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (lessonId: string) => coursesApi.completeLesson(id!, lessonId),
    onSuccess: () => {
      toast.success('Lección completada')
      queryClient.invalidateQueries({ queryKey: ['course', id] })
    },
  })

  if (isLoading) return <PageLoader />

  const course: Course = data?.data?.data ?? MOCK_COURSE

  const totalLessons = course.units?.reduce((acc, u) => acc + u.lessons.length, 0) ?? 0
  const completedLessons = course.units?.reduce(
    (acc, u) => acc + u.lessons.filter((l) => l.completed).length, 0
  ) ?? 0

  function toggleUnit(unitId: string) {
    setExpandedUnits((prev) => {
      const next = new Set(prev)
      next.has(unitId) ? next.delete(unitId) : next.add(unitId)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <Link to="/courses" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-fit">
        <ArrowLeft size={16} /> Volver a cursos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <Badge className="bg-indigo-500/10 text-indigo-400">{EDUCATION_LEVEL_LABELS[course.level]}</Badge>
              {course.isEnrolled && <Badge variant="success">Inscrito</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{course.title}</h1>
            <p className="text-slate-400 leading-relaxed">{course.description}</p>
          </div>

          {/* Progress bar */}
          {course.isEnrolled && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium text-sm">Tu progreso</p>
                <span className="text-indigo-400 font-bold">{course.enrollmentProgress ?? 0}%</span>
              </div>
              <div className="h-2 bg-[#242736] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${course.enrollmentProgress ?? 0}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-2">{completedLessons} de {totalLessons} lecciones completadas</p>
            </Card>
          )}

          {/* Units and lessons */}
          <div>
            <h2 className="text-white font-semibold mb-4">Contenido del curso</h2>
            <div className="space-y-3">
              {(course.units ?? []).map((unit) => (
                <UnitAccordion
                  key={unit.id}
                  unit={unit}
                  isExpanded={expandedUnits.has(unit.id)}
                  isEnrolled={course.isEnrolled ?? false}
                  onToggle={() => toggleUnit(unit.id)}
                  onComplete={(lessonId) => completeMutation.mutate(lessonId)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} /> <span>{course.duration} minutos de contenido</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={14} /> <span>{totalLessons} lecciones</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={14} /> <span>{course.enrollmentCount ?? 0} estudiantes</span>
                </div>
              </div>

              {!course.isEnrolled ? (
                <Button
                  className="w-full"
                  onClick={() => enrollMutation.mutate()}
                  loading={enrollMutation.isPending}
                >
                  Inscribirse gratis
                </Button>
              ) : (
                <div className="text-center">
                  <Badge variant="success" className="text-sm py-1 px-3">Cursando</Badge>
                  <p className="text-slate-500 text-xs mt-2">Continúa desde donde lo dejaste</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function UnitAccordion({ unit, isExpanded, isEnrolled, onToggle, onComplete }: {
  unit: Unit
  isExpanded: boolean
  isEnrolled: boolean
  onToggle: () => void
  onComplete: (lessonId: string) => void
}) {
  const completed = unit.lessons.filter((l) => l.completed).length

  return (
    <div className="border border-[#2e3245] rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-[#1a1d27] hover:bg-[#242736] transition-colors text-left"
      >
        <div>
          <p className="text-white font-medium">{unit.title}</p>
          <p className="text-slate-500 text-xs mt-0.5">{completed}/{unit.lessons.length} lecciones</p>
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {isExpanded && (
        <div className="divide-y divide-[#2e3245]">
          {unit.lessons.map((lesson, idx) => (
            <div key={lesson.id} className="flex items-center gap-3 p-4 bg-[#1a1d27]/50">
              {lesson.completed ? (
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              ) : isEnrolled ? (
                <Circle size={16} className="text-slate-600 flex-shrink-0" />
              ) : (
                <Lock size={16} className="text-slate-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${lesson.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {idx + 1}. {lesson.title}
                </p>
                <p className="text-slate-600 text-xs">{lesson.duration} min</p>
              </div>
              {isEnrolled && !lesson.completed && (
                <button
                  onClick={() => onComplete(lesson.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Completar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
