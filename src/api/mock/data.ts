// ─────────────────────────────────────────────────────────────────────────────
// Mock dataset for StudyMate offline / no-backend mode.
//
// This powers the deployed demo (e.g. Netlify) when no backend is reachable so
// the whole product can be navigated end-to-end with the demo accounts.
// All data here is simulated. Demo credentials are intentionally public.
// ─────────────────────────────────────────────────────────────────────────────
import type {
  User,
  Profile,
  Subject,
  Course,
  Task,
  Assessment,
  AssessmentStats,
  ProgressOverview,
  WeeklyDay,
  RiskScore,
  Enrollment,
  AtRiskStudent,
  Notification,
  StudyPlan,
  Resource,
  StudentDashboard,
  TeacherDashboard,
  AdminDashboard,
} from '@/types'

const now = Date.now()
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString()
const DAY = 86_400_000

// ─── Demo users (match the login screen demo accounts) ───────────────────────
export const DEMO_USERS: Record<string, { user: User; password: string }> = {
  'estudiante1@studymate.com': {
    password: 'Student123!',
    user: {
      id: 'u-student-1',
      name: 'Ana Estudiante',
      email: 'estudiante1@studymate.com',
      role: 'STUDENT',
      educationLevel: 'UNIVERSITY',
      field: 'Ingeniería de Software',
      age: 20,
      isActive: true,
      createdAt: iso(-120 * DAY),
      lastLoginAt: iso(0),
      isScholarship: true,
    },
  },
  'profesor1@studymate.com': {
    password: 'Teacher123!',
    user: {
      id: 'u-teacher-1',
      name: 'Carlos Docente',
      email: 'profesor1@studymate.com',
      role: 'TEACHER',
      educationLevel: 'UNIVERSITY',
      field: 'Ciencias de la Computación',
      age: 41,
      isActive: true,
      createdAt: iso(-400 * DAY),
      lastLoginAt: iso(0),
    },
  },
  'admin@studymate.com': {
    password: 'Admin123!',
    user: {
      id: 'u-admin-1',
      name: 'Admin StudyMate',
      email: 'admin@studymate.com',
      role: 'ADMIN',
      educationLevel: 'UNIVERSITY',
      field: 'Administración',
      age: 35,
      isActive: true,
      createdAt: iso(-500 * DAY),
      lastLoginAt: iso(0),
    },
  },
}

export const STUDENT = DEMO_USERS['estudiante1@studymate.com'].user

export const PROFILE: Profile = {
  id: 'p-1',
  userId: STUDENT.id,
  bio: 'Estudiante de ingeniería enfocada en no abandonar y mejorar hábitos de estudio.',
  learningStyle: 'Visual',
  weeklyHours: 12,
  strengths: ['Programación', 'Lógica'],
  weaknesses: ['Cálculo', 'Gestión del tiempo'],
  riskScore: 42,
  diagnosticDone: true,
  lastDiagnosticAt: iso(-10 * DAY),
}

export const SUBJECTS: Subject[] = [
  { id: 's-math', name: 'Cálculo I', level: 'UNIVERSITY', category: 'Ciencias', iconName: 'Sigma', color: '#6366f1', description: 'Límites, derivadas e integrales.' },
  { id: 's-prog', name: 'Programación', level: 'UNIVERSITY', category: 'Tecnología', iconName: 'Code', color: '#22c55e', description: 'Fundamentos de programación.' },
  { id: 's-eng', name: 'Inglés', level: 'UNIVERSITY', category: 'Idiomas', iconName: 'Languages', color: '#f59e0b', description: 'Inglés académico.' },
  { id: 's-chem', name: 'Química', level: 'UNIVERSITY', category: 'Ciencias', iconName: 'FlaskConical', color: '#ec4899', description: 'Química general.' },
]

export const COURSES: Course[] = [
  {
    id: 'c-1',
    title: 'Cálculo I: de cero a derivadas',
    description: 'Aprende límites, continuidad y derivadas con ejemplos guiados paso a paso.',
    subjectId: 's-math',
    subject: SUBJECTS[0],
    teacherId: 'u-teacher-1',
    level: 'UNIVERSITY',
    isPublished: true,
    duration: 720,
    createdAt: iso(-60 * DAY),
    enrollmentCount: 320,
    isEnrolled: true,
    enrollmentProgress: 45,
    units: [
      {
        id: 'un-1', courseId: 'c-1', title: 'Límites', order: 1,
        lessons: [
          { id: 'l-1', unitId: 'un-1', title: 'Idea intuitiva de límite', content: 'Introducción a los límites.', duration: 15, order: 1, completed: true },
          { id: 'l-2', unitId: 'un-1', title: 'Límites laterales', content: 'Límites por la izquierda y derecha.', duration: 18, order: 2, completed: true },
          { id: 'l-3', unitId: 'un-1', title: 'Continuidad', content: 'Funciones continuas.', duration: 20, order: 3, completed: false },
        ],
      },
      {
        id: 'un-2', courseId: 'c-1', title: 'Derivadas', order: 2,
        lessons: [
          { id: 'l-4', unitId: 'un-2', title: 'Definición de derivada', content: 'La derivada como límite.', duration: 22, order: 1, completed: false },
          { id: 'l-5', unitId: 'un-2', title: 'Reglas de derivación', content: 'Regla del producto y cociente.', duration: 25, order: 2, completed: false },
        ],
      },
    ],
  },
  {
    id: 'c-2',
    title: 'Programación básica con JavaScript',
    description: 'Variables, funciones, bucles y tu primer proyecto interactivo.',
    subjectId: 's-prog',
    subject: SUBJECTS[1],
    teacherId: 'u-teacher-1',
    level: 'UNIVERSITY',
    isPublished: true,
    duration: 600,
    createdAt: iso(-45 * DAY),
    enrollmentCount: 540,
    isEnrolled: true,
    enrollmentProgress: 70,
    units: [
      {
        id: 'un-3', courseId: 'c-2', title: 'Fundamentos', order: 1,
        lessons: [
          { id: 'l-6', unitId: 'un-3', title: 'Variables y tipos', content: 'let, const y tipos.', duration: 16, order: 1, completed: true },
          { id: 'l-7', unitId: 'un-3', title: 'Funciones', content: 'Declaración y uso de funciones.', duration: 19, order: 2, completed: true },
        ],
      },
    ],
  },
  {
    id: 'c-3',
    title: 'Inglés académico B1',
    description: 'Mejora tu comprensión y expresión con práctica real.',
    subjectId: 's-eng',
    subject: SUBJECTS[2],
    teacherId: 'u-teacher-1',
    level: 'UNIVERSITY',
    isPublished: true,
    duration: 480,
    createdAt: iso(-30 * DAY),
    enrollmentCount: 210,
    isEnrolled: false,
    enrollmentProgress: 0,
    units: [],
  },
  {
    id: 'c-4',
    title: 'Química general',
    description: 'Enlaces, reacciones y estequiometría explicados con claridad.',
    subjectId: 's-chem',
    subject: SUBJECTS[3],
    teacherId: 'u-teacher-1',
    level: 'UNIVERSITY',
    isPublished: true,
    duration: 540,
    createdAt: iso(-20 * DAY),
    enrollmentCount: 180,
    isEnrolled: false,
    enrollmentProgress: 0,
    units: [],
  },
]

export const TASKS: Task[] = [
  {
    id: 't-1', userId: STUDENT.id, subjectId: 's-math', subject: SUBJECTS[0],
    title: 'Entregar práctica de límites', description: 'Ejercicios 1 a 10 del capítulo 2.',
    dueDate: iso(2 * DAY), priority: 'HIGH', status: 'PENDING', reminder: true,
    createdAt: iso(-3 * DAY), updatedAt: iso(-1 * DAY),
  },
  {
    id: 't-2', userId: STUDENT.id, subjectId: 's-prog', subject: SUBJECTS[1],
    title: 'Proyecto: calculadora JS', description: 'Construir una calculadora simple.',
    dueDate: iso(5 * DAY), priority: 'MEDIUM', status: 'IN_PROGRESS', reminder: true,
    createdAt: iso(-5 * DAY), updatedAt: iso(0),
  },
  {
    id: 't-3', userId: STUDENT.id, subjectId: 's-eng', subject: SUBJECTS[2],
    title: 'Leer artículo en inglés', description: 'Resumen de una página.',
    dueDate: iso(-1 * DAY), priority: 'LOW', status: 'OVERDUE', reminder: false,
    createdAt: iso(-7 * DAY), updatedAt: iso(-2 * DAY),
  },
  {
    id: 't-4', userId: STUDENT.id, subjectId: 's-prog', subject: SUBJECTS[1],
    title: 'Repasar funciones', description: 'Ver lección y practicar.',
    dueDate: iso(-4 * DAY), priority: 'MEDIUM', status: 'DONE', reminder: false,
    createdAt: iso(-10 * DAY), updatedAt: iso(-4 * DAY),
  },
]

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'a-1', userId: STUDENT.id, subjectId: 's-math', subject: SUBJECTS[0],
    title: 'Quiz de límites', score: 7, maxScore: 10, timeSpentMin: 12, completedAt: iso(-8 * DAY),
  },
  {
    id: 'a-2', userId: STUDENT.id, subjectId: 's-prog', subject: SUBJECTS[1],
    title: 'Quiz de fundamentos JS', score: 9, maxScore: 10, timeSpentMin: 9, completedAt: iso(-4 * DAY),
  },
  {
    id: 'a-3', userId: STUDENT.id, subjectId: 's-eng', subject: SUBJECTS[2],
    title: 'Quiz de gramática', score: 6, maxScore: 10, timeSpentMin: 15, completedAt: iso(-2 * DAY),
  },
]

export const ASSESSMENT_STATS: AssessmentStats = {
  averageScore: 73,
  bestScore: 90,
  totalCompleted: 3,
  scoresBySubject: [
    { subject: 'Cálculo I', average: 70 },
    { subject: 'Programación', average: 90 },
    { subject: 'Inglés', average: 60 },
  ],
}

export const WEEKLY: WeeklyDay[] = Array.from({ length: 7 }).map((_, i) => {
  const d = 6 - i
  return {
    date: iso(-d * DAY),
    tasksCompleted: [1, 0, 2, 1, 3, 0, 1][i],
    lessonsCompleted: [2, 1, 0, 3, 1, 2, 1][i],
    assessmentsTaken: [0, 1, 0, 0, 1, 0, 1][i],
    minutesStudied: [45, 30, 0, 90, 60, 20, 50][i],
  }
})

export const PROGRESS_OVERVIEW: ProgressOverview = {
  totalCourses: 2,
  completedCourses: 0,
  totalTasks: 4,
  completedTasks: 1,
  pendingTasks: 2,
  overdueTasks: 1,
  totalAssessments: 3,
  averageScore: 73,
  studyStreak: 4,
  riskScore: 42,
  riskLevel: 'medium',
}

export const RISK_SCORE: RiskScore = {
  score: 42,
  level: 'medium',
  factors: {
    daysSinceLastActivity: 1,
    overdueTasksCount: 1,
    averageAssessmentScore: 73,
    chatSessionsLastWeek: 3,
    daysSinceRegistration: 120,
    diagnosticDone: true,
  },
  alerts: [
    {
      id: 'al-1', riskScore: 42, riskLevel: 'medium',
      triggerReason: 'Una tarea vencida y baja actividad el fin de semana.',
      resolved: false, createdAt: iso(-1 * DAY),
    },
  ],
}

export const ENROLLMENTS: Enrollment[] = [
  { id: 'e-1', userId: STUDENT.id, courseId: 'c-1', course: COURSES[0], status: 'ACTIVE', progress: 45, enrolledAt: iso(-50 * DAY) },
  { id: 'e-2', userId: STUDENT.id, courseId: 'c-2', course: COURSES[1], status: 'ACTIVE', progress: 70, enrolledAt: iso(-40 * DAY) },
]

export const AT_RISK_STUDENTS: AtRiskStudent[] = [
  { userId: 'u-student-1', name: 'Ana Estudiante', email: 'estudiante1@studymate.com', educationLevel: 'UNIVERSITY', isScholarship: true, riskScore: 42, riskLevel: 'medium', openAlerts: 1, openAlertId: 'al-1', lastAlertAt: iso(-1 * DAY) },
  { userId: 'u-student-2', name: 'Luis Pérez', email: 'estudiante2@studymate.com', educationLevel: 'TECHNICAL', isScholarship: false, riskScore: 78, riskLevel: 'high', openAlerts: 2, openAlertId: 'al-2', lastAlertAt: iso(-2 * DAY) },
  { userId: 'u-student-3', name: 'María Gómez', email: 'estudiante3@studymate.com', educationLevel: 'SECONDARY', isScholarship: true, riskScore: 25, riskLevel: 'low', openAlerts: 0, openAlertId: null, lastAlertAt: null },
]

export const NOTIFICATIONS: Notification[] = [
  { id: 'n-1', userId: STUDENT.id, type: 'RISK_ALERT', title: 'Riesgo de abandono medio', body: 'Detectamos una tarea vencida. Retoma tu plan hoy.', read: false, createdAt: iso(-1 * DAY) },
  { id: 'n-2', userId: STUDENT.id, type: 'STUDY_PLAN', title: 'Tu plan de estudio está listo', body: 'Generamos un plan semanal de 12 horas.', read: false, createdAt: iso(-2 * DAY) },
  { id: 'n-3', userId: STUDENT.id, type: 'REMINDER', title: 'Recordatorio de tarea', body: 'Entrega de práctica de límites en 2 días.', read: true, createdAt: iso(-3 * DAY) },
]

export const STUDY_PLAN: StudyPlan = {
  id: 'sp-1',
  title: 'Plan semanal anti-abandono',
  summary: 'Enfocado en recuperar la tarea vencida y reforzar Cálculo e Inglés en bloques cortos.',
  weeklyHours: 12,
  status: 'ACTIVE',
  generatedAt: iso(-2 * DAY),
  items: [
    { id: 'spi-1', title: 'Recuperar práctica de límites', description: 'Completar los ejercicios atrasados.', focus: 'Cálculo I', order: 1, status: 'PENDING', taskId: 't-1', subject: { id: 's-math', name: 'Cálculo I', color: '#6366f1' } },
    { id: 'spi-2', title: 'Avanzar proyecto JS', description: 'Terminar la calculadora.', focus: 'Programación', order: 2, status: 'PENDING', taskId: 't-2', subject: { id: 's-prog', name: 'Programación', color: '#22c55e' } },
    { id: 'spi-3', title: 'Lectura en inglés 20 min', description: 'Leer y resumir un artículo corto.', focus: 'Inglés', order: 3, status: 'DONE', taskId: null, subject: { id: 's-eng', name: 'Inglés', color: '#f59e0b' } },
  ],
}

export const RESOURCES: Resource[] = [
  { id: 'r-1', subjectId: 's-math', subject: SUBJECTS[0], title: 'Guía visual de derivadas', description: 'Resumen con gráficas.', url: 'https://example.com/derivadas', type: 'pdf', level: 'UNIVERSITY', tags: ['cálculo', 'derivadas'], isPublic: true, createdAt: iso(-15 * DAY) },
  { id: 'r-2', subjectId: 's-prog', subject: SUBJECTS[1], title: 'Introducción a JavaScript', description: 'Video de 20 minutos.', url: 'https://example.com/js', type: 'video', level: 'UNIVERSITY', tags: ['javascript', 'básico'], isPublic: true, createdAt: iso(-12 * DAY) },
  { id: 'r-3', subjectId: 's-eng', subject: SUBJECTS[2], title: 'Present Perfect explicado', description: 'Artículo con ejemplos.', url: 'https://example.com/english', type: 'article', level: 'UNIVERSITY', tags: ['inglés', 'gramática'], isPublic: true, createdAt: iso(-9 * DAY) },
]

export const STUDENT_DASHBOARD: StudentDashboard = {
  user: { name: STUDENT.name, educationLevel: 'UNIVERSITY', riskScore: 42, riskLevel: 'medium' },
  stats: { enrolledCourses: 2, completedTasks: 1, pendingTasks: 2, averageScore: 73 },
  recentActivity: [
    { id: 'act-1', action: 'LESSON_COMPLETED', metadata: { title: 'Límites laterales' }, timestamp: iso(-1 * DAY) },
    { id: 'act-2', action: 'ASSESSMENT_TAKEN', metadata: { title: 'Quiz de gramática', score: 6 }, timestamp: iso(-2 * DAY) },
    { id: 'act-3', action: 'CHAT_SESSION', metadata: { subject: 'Programación' }, timestamp: iso(-2 * DAY) },
  ],
  upcomingTasks: [TASKS[0], TASKS[1]],
  enrolledCourses: [
    { ...ENROLLMENTS[0], course: COURSES[0] },
    { ...ENROLLMENTS[1], course: COURSES[1] },
  ],
  recentAssessments: ASSESSMENTS,
  weeklyProgress: WEEKLY,
  unreadNotifications: 2,
  studyPlan: { id: 'sp-1', title: 'Plan semanal anti-abandono', totalItems: 3, completedItems: 1 },
  riskAlert: { message: 'Tienes una tarea vencida. Retoma tu plan para bajar tu riesgo.', riskScore: 42, riskLevel: 'medium' },
}

export const TEACHER_DASHBOARD: TeacherDashboard = {
  stats: { totalCourses: 4, totalStudents: 1250, totalActiveCourses: 4, advisees: 3, atRiskAdvisees: 2 },
  myCourses: COURSES.map((c) => ({ ...c, studentCount: c.enrollmentCount ?? 0 })),
  recentEnrollments: ENROLLMENTS,
  atRiskAdvisees: [
    { userId: 'u-student-2', name: 'Luis Pérez', email: 'estudiante2@studymate.com', isScholarship: false, riskScore: 78, riskLevel: 'high', openAlerts: 2 },
    { userId: 'u-student-1', name: 'Ana Estudiante', email: 'estudiante1@studymate.com', isScholarship: true, riskScore: 42, riskLevel: 'medium', openAlerts: 1 },
  ],
}

export const ADMIN_DASHBOARD: AdminDashboard = {
  stats: { totalUsers: 1320, totalStudents: 1250, totalTeachers: 60, totalCourses: 84, totalAssessments: 4200 },
  usersByLevel: [
    { level: 'UNIVERSITY', count: 640 },
    { level: 'TECHNICAL', count: 310 },
    { level: 'SECONDARY', count: 220 },
    { level: 'PRIMARY', count: 90 },
    { level: 'FREE', count: 60 },
  ],
  recentUsers: Object.values(DEMO_USERS).map((d) => d.user),
  highRiskStudents: [
    { ...STUDENT, id: 'u-student-2', name: 'Luis Pérez', email: 'estudiante2@studymate.com', riskScore: 78 },
    { ...STUDENT, riskScore: 42 },
  ],
}
