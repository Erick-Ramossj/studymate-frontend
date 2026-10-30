import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users.api'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { GraduationCap, Shield } from 'lucide-react'
import { EDUCATION_LEVEL_LABELS } from '@/utils/format'
import type { User } from '@/types'
import toast from 'react-hot-toast'

export function AdminPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.listUsers(1, 100),
    retry: false,
  })

  const users: User[] = data?.data?.data ?? []
  const advisors = useMemo(
    () => users.filter((u) => u.role === 'TEACHER' || u.role === 'ADMIN'),
    [users],
  )
  const students = useMemo(() => users.filter((u) => u.role === 'STUDENT'), [users])

  const assignMutation = useMutation({
    mutationFn: ({ id, data: payload }: { id: string; data: { isScholarship?: boolean; advisorId?: string | null } }) =>
      usersApi.assignAdvisor(id, payload),
    onSuccess: () => {
      toast.success('Estudiante actualizado')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('No se pudo actualizar'),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={22} className="text-indigo-400" />
          Administración
        </h1>
        <p className="text-slate-400 mt-1">
          Gestiona becas y asigna asesores para el seguimiento contra el abandono.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Estudiantes</CardTitle></CardHeader>
        {students.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No hay estudiantes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs border-b border-[#2e3245]">
                  <th className="py-2 pr-4 font-medium">Estudiante</th>
                  <th className="py-2 pr-4 font-medium">Nivel</th>
                  <th className="py-2 pr-4 font-medium">Beca</th>
                  <th className="py-2 pr-4 font-medium">Asesor</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-[#2e3245]/60">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{s.name}</p>
                          <p className="text-slate-500 text-xs truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {EDUCATION_LEVEL_LABELS[s.educationLevel]}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() =>
                          assignMutation.mutate({ id: s.id, data: { isScholarship: !s.isScholarship } })
                        }
                        disabled={assignMutation.isPending}
                        className="disabled:opacity-50"
                      >
                        {s.isScholarship ? (
                          <Badge variant="info" className="gap-1">
                            <GraduationCap size={12} /> Becario
                          </Badge>
                        ) : (
                          <Badge variant="default">No</Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={s.advisorId ?? ''}
                        onChange={(e) =>
                          assignMutation.mutate({
                            id: s.id,
                            data: { advisorId: e.target.value || null },
                          })
                        }
                        disabled={assignMutation.isPending}
                        className="bg-[#242736] border border-[#2e3245] rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500/50 disabled:opacity-50"
                      >
                        <option value="">Sin asesor</option>
                        {advisors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.role === 'ADMIN' ? 'Admin' : 'Docente'})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
