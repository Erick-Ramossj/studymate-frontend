import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EducationLevel, Priority, TaskStatus, RiskLevel } from '@/types'

export function formatDate(date: string | Date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy', { locale: es })
}

export function formatDateTime(date: string | Date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy, HH:mm', { locale: es })
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, {
    addSuffix: true,
    locale: es,
  })
}

export function isOverdue(date: string | Date) {
  return isAfter(new Date(), typeof date === 'string' ? parseISO(date) : date)
}

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  PRIMARY: 'Primaria',
  SECONDARY: 'Secundaria',
  TECHNICAL: 'Instituto Técnico',
  UNIVERSITY: 'Universidad',
  FREE: 'Curso Libre',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'text-green-400 bg-green-400/10',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10',
  HIGH: 'text-red-400 bg-red-400/10',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completada',
  OVERDUE: 'Vencida',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: 'text-slate-400 bg-slate-400/10',
  IN_PROGRESS: 'text-blue-400 bg-blue-400/10',
  DONE: 'text-green-400 bg-green-400/10',
  OVERDUE: 'text-red-400 bg-red-400/10',
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

export function getRiskColor(score: number): string {
  if (score < 30) return '#22c55e'
  if (score < 60) return '#eab308'
  return '#ef4444'
}

export function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '…' : text
}
