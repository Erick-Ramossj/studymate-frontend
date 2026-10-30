import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Estudiante', email: 'estudiante1@studymate.com', password: 'Student123!', color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
  { label: 'Docente', email: 'profesor1@studymate.com', password: 'Teacher123!', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { label: 'Admin', email: 'admin@studymate.com', password: 'Admin123!', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  function validate() {
    const e: typeof errors = {}
    if (!email) e.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo inválido'
    if (!password) e.password = 'La contraseña es requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const { user, accessToken, refreshToken } = res.data.data!
      setAuth(user, accessToken, refreshToken)
      toast.success(`Bienvenido, ${user.name}`)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Credenciales incorrectas'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(account: typeof DEMO_ACCOUNTS[0]) {
    setEmail(account.email)
    setPassword(account.password)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900/40 to-[#0f1117] items-center justify-center p-12 border-r border-[#2e3245]">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold">StudyMate</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Tu compañero de estudio inteligente
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Aprende a tu ritmo, supera dificultades académicas y alcanza tus metas con ayuda de IA personalizada.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Estudiantes activos', value: '1,200+' },
              { label: 'Cursos disponibles', value: '80+' },
              { label: 'Horas de contenido', value: '500+' },
              { label: 'Tasa de éxito', value: '94%' },
            ].map((s) => (
              <div key={s.label} className="bg-[#1a1d27] border border-[#2e3245] rounded-xl p-4">
                <p className="text-indigo-400 text-2xl font-bold">{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-white text-xl font-bold">StudyMate</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h1>
          <p className="text-slate-400 text-sm mb-6">Accede a tu plataforma educativa</p>

          {/* Demo accounts */}
          <div className="mb-6 p-4 bg-[#1a1d27] border border-[#2e3245] rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-indigo-400" />
              <p className="text-xs font-medium text-slate-300">Acceso rápido con cuenta demo</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 font-medium ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={15} />}
              autoComplete="email"
            />

            <div>
              <Input
                label="Contraseña"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock size={15} />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="mt-1 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPass ? 'Ocultar' : 'Mostrar'} contraseña
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Iniciar sesión
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
