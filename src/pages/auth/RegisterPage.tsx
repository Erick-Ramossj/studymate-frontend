import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, User, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import toast from 'react-hot-toast'

const LEVELS = [
  { value: 'PRIMARY', label: 'Primaria' },
  { value: 'SECONDARY', label: 'Secundaria' },
  { value: 'TECHNICAL', label: 'Instituto Técnico' },
  { value: 'UNIVERSITY', label: 'Universidad' },
  { value: 'FREE', label: 'Curso Libre' },
]

const ROLES = [
  { value: 'STUDENT', label: 'Estudiante' },
  { value: 'TEACHER', label: 'Docente / Tutor' },
]

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    educationLevel: 'UNIVERSITY',
    field: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.email) e.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
    if (!form.password || form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    if (!form.field.trim()) e.field = 'El área de estudio es requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      void confirmPassword
      const res = await authApi.register(payload)
      const { user, accessToken, refreshToken } = res.data.data!
      setAuth(user, accessToken, refreshToken)
      toast.success(`Bienvenido a StudyMate, ${user.name}!`)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Error al registrarse'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold">StudyMate</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
        <p className="text-slate-400 text-sm mb-6">Únete a la plataforma educativa inteligente</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
              leftIcon={<User size={15} />}
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={15} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={15} />}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock size={15} />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Rol"
              options={ROLES}
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            />
            <Select
              label="Nivel educativo"
              options={LEVELS}
              value={form.educationLevel}
              onChange={(e) => set('educationLevel', e.target.value)}
            />
          </div>

          <Input
            label="Área de estudio / Carrera"
            placeholder="Ej: Ingeniería de Sistemas, Matemáticas..."
            value={form.field}
            onChange={(e) => set('field', e.target.value)}
            error={errors.field}
          />

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
