// ─────────────────────────────────────────────────────────────────────────────
// Offline mock resolver for StudyMate.
//
// Maps an axios request (method + path under /api) to a mock response so the
// deployed demo works with no backend. Returns `undefined` when there is no
// matching mock, letting the caller surface a normal error.
// ─────────────────────────────────────────────────────────────────────────────
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  DEMO_USERS,
  STUDENT,
  PROFILE,
  SUBJECTS,
  COURSES,
  TASKS,
  ASSESSMENTS,
  ASSESSMENT_STATS,
  WEEKLY,
  PROGRESS_OVERVIEW,
  RISK_SCORE,
  ENROLLMENTS,
  AT_RISK_STUDENTS,
  NOTIFICATIONS,
  STUDY_PLAN,
  RESOURCES,
  STUDENT_DASHBOARD,
  TEACHER_DASHBOARD,
  ADMIN_DASHBOARD,
} from './data'
import type { Role, User } from '@/types'

type Body = Record<string, unknown>

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  } as AxiosResponse<T>
}

function wrap<T>(data: T) {
  return { success: true, data }
}

function paginated<T>(items: T[]) {
  return {
    success: true,
    data: items,
    total: items.length,
    page: 1,
    limit: items.length || 10,
    totalPages: 1,
  }
}

function currentUser(): User {
  try {
    const raw = localStorage.getItem('studymate-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      const u = parsed?.state?.user as User | undefined
      if (u) return u
    }
  } catch {
    // ignore
  }
  return STUDENT
}

function dashboardForRole(role: Role) {
  if (role === 'TEACHER') return TEACHER_DASHBOARD
  if (role === 'ADMIN') return ADMIN_DASHBOARD
  return STUDENT_DASHBOARD
}

function parseBody(config: InternalAxiosRequestConfig): Body {
  if (!config.data) return {}
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data) as Body
    } catch {
      return {}
    }
  }
  return config.data as Body
}

// ─── AI tutor canned responses (GenAI feature, offline) ──────────────────────
const AI_RESPONSES: { match: RegExp; reply: string }[] = [
  { match: /(matemat|ecuaci|algebra|derivad|límit|limit)/i, reply: 'Vamos paso a paso. Para una derivada usamos la definición f\'(x)=lim(h→0) [f(x+h)-f(x)]/h. Por ejemplo, la derivada de x² es 2x. ¿Quieres que practiquemos con otro ejemplo?' },
  { match: /(program|javascript|código|codigo|funcion|bucle)/i, reply: 'En JavaScript una función se define así:\n\n```js\nfunction suma(a, b) {\n  return a + b\n}\n```\n\nRecibe parámetros y devuelve un valor. ¿Quieres un ejercicio para practicar bucles?' },
  { match: /(ingl[eé]s|english|gram[aá]tica)/i, reply: 'Usa el Present Perfect para experiencias: Subject + have/has + past participle. Ej: "I have finished my homework." ¿Te genero más ejemplos?' },
  { match: /(plan|organiz|tiempo|estudi|abandon)/i, reply: 'Para no abandonar, divide tu semana en bloques cortos de 25 min (técnica Pomodoro), prioriza las tareas vencidas y celebra los avances. ¿Quieres que arme un plan semanal contigo?' },
]

function aiReply(message: string): string {
  const found = AI_RESPONSES.find((r) => r.match.test(message))
  if (found) return found.reply
  return `Buena pregunta sobre "${message}". Te lo explico paso a paso:\n\n1. Partimos de los conceptos base.\n2. Vemos un ejemplo concreto.\n3. Practicas con un ejercicio corto.\n\n¿Empezamos por los fundamentos?`
}

/**
 * Resolve a mock response for the given request, or `undefined` if unmatched.
 */
export function resolveMock(
  config: InternalAxiosRequestConfig,
): AxiosResponse | undefined {
  const method = (config.method ?? 'get').toLowerCase()
  // Normalize path: strip baseURL and query string.
  const rawUrl = config.url ?? ''
  const path = rawUrl.replace(/^.*\/api/, '').split('?')[0].replace(/\/$/, '') || '/'
  const body = parseBody(config)

  // ── Auth ───────────────────────────────────────────────────────────────────
  if (method === 'post' && path === '/auth/login') {
    const email = String(body.email ?? '').toLowerCase()
    const password = String(body.password ?? '')
    const entry = DEMO_USERS[email]
    if (entry && entry.password === password) {
      return ok(
        wrap({
          user: { ...entry.user, lastLoginAt: new Date().toISOString() },
          accessToken: `mock-access-${entry.user.id}`,
          refreshToken: `mock-refresh-${entry.user.id}`,
        }),
        config,
      )
    }
    return ok({ success: false, error: 'Credenciales incorrectas' }, config, 401)
  }

  if (method === 'post' && path === '/auth/register') {
    const user: User = {
      id: `u-${Date.now()}`,
      name: String(body.name ?? 'Nuevo Usuario'),
      email: String(body.email ?? 'nuevo@studymate.com'),
      role: 'STUDENT',
      educationLevel: 'UNIVERSITY',
      field: String(body.field ?? 'General'),
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    return ok(
      wrap({ user, accessToken: `mock-access-${user.id}`, refreshToken: `mock-refresh-${user.id}` }),
      config,
    )
  }

  if (method === 'post' && path === '/auth/refresh') {
    return ok(wrap({ accessToken: `mock-access-${Date.now()}`, refreshToken: `mock-refresh-${Date.now()}` }), config)
  }

  if (method === 'post' && path === '/auth/logout') {
    return ok({ success: true, data: null }, config)
  }

  // ── Users / profile ──────────────────────────────────────────────────────
  if (method === 'get' && path === '/users/me') return ok(wrap(currentUser()), config)
  if (method === 'put' && path === '/users/me') return ok(wrap({ ...currentUser(), ...body }), config)
  if (method === 'get' && path === '/users/me/profile') return ok(wrap(PROFILE), config)
  if (method === 'put' && path === '/users/me/profile') return ok(wrap({ ...PROFILE, ...body }), config)
  if (method === 'get' && path === '/users') {
    const users = Object.values(DEMO_USERS).map((d) => d.user)
    return ok(paginated(users), config)
  }
  if (method === 'put' && /^\/users\/[^/]+\/(status|advisor)$/.test(path)) {
    return ok(wrap({ ...currentUser(), ...body }), config)
  }

  // ── Dashboard ───────────────────────────────────────────────────────────
  if (method === 'get' && path === '/dashboard') {
    return ok(wrap(dashboardForRole(currentUser().role)), config)
  }

  // ── Subjects ──────────────────────────────────────────────────────────────
  if (method === 'get' && path === '/subjects') return ok(wrap(SUBJECTS), config)

  // ── Courses ───────────────────────────────────────────────────────────────
  if (method === 'get' && path === '/courses') return ok(paginated(COURSES), config)
  if (method === 'get' && /^\/courses\/[^/]+$/.test(path)) {
    const id = path.split('/')[2]
    const course = COURSES.find((c) => c.id === id) ?? COURSES[0]
    return ok(wrap(course), config)
  }
  if (method === 'post' && /^\/courses\/[^/]+\/enroll$/.test(path)) return ok({ success: true, data: null }, config)
  if (method === 'delete' && /^\/courses\/[^/]+\/enroll$/.test(path)) return ok({ success: true, data: null }, config)
  if (method === 'post' && /^\/courses\/[^/]+\/lessons\/[^/]+\/complete$/.test(path)) return ok({ success: true, data: null }, config)

  // ── Tasks ─────────────────────────────────────────────────────────────────
  if (method === 'get' && path === '/tasks') return ok(paginated(TASKS), config)
  if (method === 'get' && path === '/tasks/upcoming') return ok(wrap(TASKS.filter((t) => t.status !== 'DONE')), config)
  if (method === 'get' && path === '/tasks/overdue') return ok(wrap(TASKS.filter((t) => t.status === 'OVERDUE')), config)
  if (method === 'post' && path === '/tasks') {
    const task = {
      id: `t-${Date.now()}`, userId: STUDENT.id, title: String(body.title ?? 'Nueva tarea'),
      description: body.description, subjectId: body.subjectId, dueDate: body.dueDate,
      priority: body.priority ?? 'MEDIUM', status: 'PENDING', reminder: Boolean(body.reminder),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    return ok(wrap(task), config)
  }
  if (method === 'put' && /^\/tasks\/[^/]+$/.test(path)) {
    const id = path.split('/')[2]
    const base = TASKS.find((t) => t.id === id) ?? TASKS[0]
    return ok(wrap({ ...base, ...body, updatedAt: new Date().toISOString() }), config)
  }
  if (method === 'delete' && /^\/tasks\/[^/]+$/.test(path)) return ok({ success: true, data: null }, config)
  if (method === 'patch' && /^\/tasks\/[^/]+\/status$/.test(path)) {
    const id = path.split('/')[2]
    const base = TASKS.find((t) => t.id === id) ?? TASKS[0]
    return ok(wrap({ ...base, status: body.status, updatedAt: new Date().toISOString() }), config)
  }

  // ── Assessments ─────────────────────────────────────────────────────────
  if (method === 'get' && path === '/assessments/history') return ok(paginated(ASSESSMENTS), config)
  if (method === 'get' && path === '/assessments/stats') return ok(wrap(ASSESSMENT_STATS), config)
  if (method === 'post' && path === '/assessments/start') {
    const questions = [
      { id: 'q-1', text: '¿Cuál es la derivada de x²?', options: ['x', '2x', 'x²', '2'], difficulty: 'easy' },
      { id: 'q-2', text: 'El límite de 1/x cuando x→∞ es:', options: ['0', '1', '∞', '-1'], difficulty: 'medium' },
      { id: 'q-3', text: '¿Qué palabra clave declara una constante en JS?', options: ['let', 'var', 'const', 'def'], difficulty: 'easy' },
      { id: 'q-4', text: 'Present Perfect se forma con:', options: ['have/has + participio', 'did + verbo', 'will + verbo', 'to be + -ing'], difficulty: 'medium' },
      { id: 'q-5', text: 'El agua (H₂O) tiene enlace:', options: ['iónico', 'metálico', 'covalente', 'ninguno'], difficulty: 'medium' },
    ]
    return ok(wrap({ assessmentId: `a-${Date.now()}`, questions }), config)
  }
  if (method === 'post' && /^\/assessments\/[^/]+\/submit$/.test(path)) {
    const assessmentId = path.split('/')[2]
    const answers = Array.isArray(body.answers) ? (body.answers as { questionId: string; answer: string }[]) : []
    const correctMap: Record<string, string> = { 'q-1': '2x', 'q-2': '0', 'q-3': 'const', 'q-4': 'have/has + participio', 'q-5': 'covalente' }
    const items = answers.map((a) => ({
      id: a.questionId,
      question: a.questionId,
      options: [],
      userAnswer: a.answer,
      correctAnswer: correctMap[a.questionId] ?? a.answer,
      isCorrect: correctMap[a.questionId] === a.answer,
      feedback: correctMap[a.questionId] === a.answer ? '¡Correcto!' : `La respuesta correcta era ${correctMap[a.questionId]}.`,
    }))
    const correct = items.filter((i) => i.isCorrect).length
    const total = items.length || 5
    return ok(
      wrap({ assessmentId, score: correct, maxScore: total, percentage: Math.round((correct / total) * 100), correct, total, items }),
      config,
    )
  }
  if (method === 'get' && /^\/assessments\/[^/]+\/result$/.test(path)) {
    const id = path.split('/')[2]
    const base = ASSESSMENTS.find((a) => a.id === id) ?? ASSESSMENTS[0]
    return ok(wrap(base), config)
  }

  // ── AI tutor (GenAI) ────────────────────────────────────────────────────
  if (method === 'post' && path === '/ai/chat') {
    const message = String(body.message ?? '')
    return ok(
      wrap({
        sessionId: String(body.sessionId ?? `sess-${Date.now()}`),
        message: { id: `m-${Date.now()}`, role: 'ASSISTANT', content: aiReply(message), timestamp: new Date().toISOString() },
      }),
      config,
    )
  }
  if (method === 'get' && path === '/ai/sessions') return ok(wrap([]), config)
  if (method === 'get' && /^\/ai\/sessions\/[^/]+\/messages$/.test(path)) return ok(wrap([]), config)
  if (method === 'post' && path === '/ai/explain') {
    return ok(wrap({ explanation: aiReply(String(body.topic ?? '')) }), config)
  }
  if (method === 'post' && path === '/ai/generate-exercise') {
    return ok(wrap({ exercise: 'Ejercicio: resuelve la derivada de f(x)=3x²+2x. Pista: aplica la regla de la potencia a cada término.' }), config)
  }

  // ── Progress & risk ─────────────────────────────────────────────────────
  if (method === 'get' && path === '/progress/overview') return ok(wrap(PROGRESS_OVERVIEW), config)
  if (method === 'get' && path === '/progress/weekly') return ok(wrap(WEEKLY), config)
  if (method === 'get' && path === '/progress/courses') return ok(wrap(ENROLLMENTS), config)
  if (method === 'get' && path === '/risk/score') return ok(wrap(RISK_SCORE), config)
  if (method === 'post' && path === '/risk/recalculate') return ok(wrap(RISK_SCORE), config)
  if (method === 'get' && path === '/risk/students') return ok(wrap(AT_RISK_STUDENTS), config)
  if (method === 'patch' && /^\/risk\/alerts\/[^/]+\/resolve$/.test(path)) {
    return ok(wrap({ ...RISK_SCORE.alerts[0], resolved: true, resolvedAt: new Date().toISOString(), resolutionNote: body.note ?? null }), config)
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  if (method === 'get' && path === '/notifications') {
    const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length
    return ok(wrap({ items: NOTIFICATIONS, unreadCount }), config)
  }
  if (method === 'patch' && /^\/notifications\/[^/]+\/read$/.test(path)) {
    const id = path.split('/')[2]
    const base = NOTIFICATIONS.find((n) => n.id === id) ?? NOTIFICATIONS[0]
    return ok(wrap({ ...base, read: true }), config)
  }
  if (method === 'patch' && path === '/notifications/read-all') return ok(wrap({ updated: NOTIFICATIONS.length }), config)

  // ── Study plan ────────────────────────────────────────────────────────────
  if (method === 'get' && path === '/study-plan') return ok(wrap(STUDY_PLAN), config)
  if (method === 'post' && path === '/study-plan/generate') {
    return ok(wrap({ ...STUDY_PLAN, generatedAt: new Date().toISOString(), weeklyHours: Number(body.weeklyHours ?? STUDY_PLAN.weeklyHours) }), config)
  }
  if (method === 'patch' && /^\/study-plan\/items\/[^/]+$/.test(path)) {
    const id = path.split('/')[3]
    const items = STUDY_PLAN.items.map((it) => (it.id === id ? { ...it, status: body.status as typeof it.status } : it))
    return ok(wrap({ ...STUDY_PLAN, items }), config)
  }

  // ── Resources / library ───────────────────────────────────────────────────
  if (method === 'get' && (path === '/resources' || path === '/library')) return ok(paginated(RESOURCES), config)

  return undefined
}
