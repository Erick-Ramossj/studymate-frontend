import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, CheckCircle, Clock, AlertCircle, Circle, CalendarDays } from 'lucide-react'
import { tasksApi } from '@/api/tasks.api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import {
  TASK_STATUS_LABELS, TASK_STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_COLORS, formatDate
} from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Task, TaskStatus, Priority } from '@/types'
import toast from 'react-hot-toast'

const MOCK_TASKS: Task[] = [
  { id: '1', userId: 'u1', title: 'Entrega de proyecto final', description: 'Subir el proyecto al aula virtual', priority: 'HIGH', status: 'PENDING', reminder: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: new Date(Date.now() + 2 * 86400000).toISOString() },
  { id: '2', userId: 'u1', title: 'Estudiar para parcial de Álgebra', description: 'Capítulos 3, 4 y 5 del libro', priority: 'HIGH', status: 'IN_PROGRESS', reminder: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: new Date(Date.now() + 4 * 86400000).toISOString() },
  { id: '3', userId: 'u1', title: 'Leer capítulo 5 de Anatomía', description: '', priority: 'MEDIUM', status: 'PENDING', reminder: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', userId: 'u1', title: 'Ejercicios de programación', description: 'Resolver los 10 ejercicios de arrays', priority: 'MEDIUM', status: 'DONE', reminder: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', userId: 'u1', title: 'Tarea de Historia', description: 'Resumen Segunda Guerra Mundial', priority: 'LOW', status: 'OVERDUE', reminder: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: new Date(Date.now() - 2 * 86400000).toISOString() },
]

const STATUS_COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'PENDING', label: 'Pendiente', icon: <Circle size={14} />, color: 'text-slate-400' },
  { status: 'IN_PROGRESS', label: 'En progreso', icon: <Clock size={14} />, color: 'text-blue-400' },
  { status: 'DONE', label: 'Completada', icon: <CheckCircle size={14} />, color: 'text-green-400' },
  { status: 'OVERDUE', label: 'Vencida', icon: <AlertCircle size={14} />, color: 'text-red-400' },
]

export function TasksPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      toast.success('Tarea eliminada')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => tasksApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const tasks: Task[] = data?.data?.data ?? MOCK_TASKS
  const filtered = filterStatus ? tasks.filter((t) => t.status === filterStatus) : tasks

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Tareas</h1>
          <p className="text-slate-400 mt-1">{tasks.length} tareas en total</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Nueva tarea
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.status).length
          return (
            <button
              key={col.status}
              onClick={() => setFilterStatus(filterStatus === col.status ? '' : col.status)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all',
                filterStatus === col.status
                  ? 'bg-[#242736] border-indigo-500/40'
                  : 'bg-[#1a1d27] border-[#2e3245] hover:border-[#3e4255]',
              )}
            >
              <div className={cn('flex items-center gap-2 mb-1', col.color)}>
                {col.icon}
                <span className="text-xs font-medium">{col.label}</span>
              </div>
              <p className="text-white text-2xl font-bold">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-medium">¡Sin tareas pendientes!</p>
            <p className="text-slate-400 text-sm mt-1">Agrega una nueva tarea para comenzar.</p>
          </Card>
        )}
        {filtered.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={() => deleteMutation.mutate(task.id)}
            onStatusChange={(status) => statusMutation.mutate({ id: task.id, status })}
          />
        ))}
      </div>

      {/* Create modal */}
      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function TaskItem({ task, onDelete, onStatusChange }: {
  task: Task
  onDelete: () => void
  onStatusChange: (s: TaskStatus) => void
}) {
  const nextStatus: Record<TaskStatus, TaskStatus> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'PENDING',
    OVERDUE: 'IN_PROGRESS',
  }

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-2xl border transition-all',
      'bg-[#1a1d27] border-[#2e3245] hover:border-[#3e4255]',
      task.status === 'DONE' && 'opacity-60',
    )}>
      {/* Status toggle */}
      <button
        onClick={() => onStatusChange(nextStatus[task.status])}
        className="flex-shrink-0"
        title="Cambiar estado"
      >
        {task.status === 'DONE' ? (
          <CheckCircle size={20} className="text-green-400" />
        ) : task.status === 'OVERDUE' ? (
          <AlertCircle size={20} className="text-red-400" />
        ) : task.status === 'IN_PROGRESS' ? (
          <Clock size={20} className="text-blue-400" />
        ) : (
          <Circle size={20} className="text-slate-600 hover:text-slate-400" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-white')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-slate-500 text-xs mt-0.5 truncate">{task.description}</p>
        )}
        {task.dueDate && (
          <p className={cn('text-xs mt-1 flex items-center gap-1',
            task.status === 'OVERDUE' ? 'text-red-400' : 'text-slate-500'
          )}>
            <CalendarDays size={11} /> {formatDate(task.dueDate)}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn('text-xs px-2 py-0.5 rounded-md font-medium hidden sm:inline-flex', PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <span className={cn('text-xs px-2 py-0.5 rounded-md font-medium', TASK_STATUS_COLORS[task.status])}>
          {TASK_STATUS_LABELS[task.status]}
        </span>
        <button
          onClick={onDelete}
          className="text-slate-600 hover:text-red-400 transition-colors ml-1"
          title="Eliminar"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function CreateTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' as Priority, dueDate: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es requerido'); return }
    setLoading(true)
    try {
      await tasksApi.create({
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      })
      toast.success('Tarea creada')
      onCreated()
    } catch {
      toast.error('Error al crear la tarea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1d27] border border-[#2e3245] rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-white font-bold text-lg mb-5">Nueva tarea</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            placeholder="Nombre de la tarea"
            value={form.title}
            onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setError('') }}
            error={error}
          />
          <Input
            label="Descripción (opcional)"
            placeholder="Detalles adicionales"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Prioridad"
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
              options={[
                { value: 'LOW', label: 'Baja' },
                { value: 'MEDIUM', label: 'Media' },
                { value: 'HIGH', label: 'Alta' },
              ]}
            />
            <Input
              label="Fecha límite"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" loading={loading} className="flex-1">Crear tarea</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Suppress unused import
void Badge
