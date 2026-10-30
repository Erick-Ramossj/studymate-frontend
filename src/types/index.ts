// ─── Enums ────────────────────────────────────────────────────────────────────
export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'
export type EducationLevel = 'PRIMARY' | 'SECONDARY' | 'TECHNICAL' | 'UNIVERSITY' | 'FREE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED'
export type RiskLevel = 'low' | 'medium' | 'high'
export type ResourceType = 'video' | 'article' | 'pdf' | 'book'
export type MessageRole = 'USER' | 'ASSISTANT'

// ─── API Response wrapper ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: Role
  educationLevel: EducationLevel
  field: string
  age?: number
  avatarUrl?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface Profile {
  id: string
  userId: string
  bio?: string
  learningStyle: string
  weeklyHours: number
  strengths: string[]
  weaknesses: string[]
  riskScore: number
  diagnosticDone: boolean
  lastDiagnosticAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// ─── Subjects ─────────────────────────────────────────────────────────────────
export interface Subject {
  id: string
  name: string
  description?: string
  level: EducationLevel
  category: string
  iconName: string
  color: string
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string
  unitId: string
  title: string
  content: string
  videoUrl?: string
  duration: number
  order: number
  completed?: boolean
}

export interface Unit {
  id: string
  courseId: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  subjectId: string
  subject?: Subject
  teacherId: string
  level: EducationLevel
  thumbnail?: string
  isPublished: boolean
  duration: number
  createdAt: string
  units?: Unit[]
  updatedAt?: string
  enrollmentCount?: number
  isEnrolled?: boolean
  enrollmentProgress?: number
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  course?: Course
  status: EnrollmentStatus
  progress: number
  enrolledAt: string
  completedAt?: string
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export interface Task {
  id: string
  userId: string
  subjectId?: string
  subject?: Subject
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  status: TaskStatus
  reminder: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  subjectId?: string
  dueDate?: string
  priority?: Priority
  reminder?: boolean
}

// ─── Assessments ──────────────────────────────────────────────────────────────
export interface Question {
  id: string
  text: string
  options: string[]
  difficulty: string
}

export interface AssessmentItem {
  id: string
  question: string
  options: string[]
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  feedback?: string
}

export interface Assessment {
  id: string
  userId: string
  subjectId: string
  subject?: Subject
  title: string
  score: number
  maxScore: number
  timeSpentMin: number
  completedAt: string
  items?: AssessmentItem[]
}

export interface AssessmentStart {
  assessmentId: string
  questions: Question[]
}

export interface AssessmentResult {
  assessmentId: string
  score: number
  maxScore: number
  percentage: number
  correct: number
  total: number
  items: AssessmentItem[]
}

export interface AssessmentStats {
  averageScore: number
  bestScore: number
  totalCompleted: number
  scoresBySubject: { subject: string; average: number }[]
}

// ─── AI Tutor ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  userId: string
  subject?: string
  startedAt: string
  endedAt?: string
  messageCount: number
  messages?: ChatMessage[]
}

// ─── Progress & Dashboard ─────────────────────────────────────────────────────
export interface WeeklyDay {
  date: string
  tasksCompleted: number
  lessonsCompleted: number
  assessmentsTaken: number
  minutesStudied: number
}

export interface ProgressOverview {
  totalCourses: number
  completedCourses: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  totalAssessments: number
  averageScore: number
  studyStreak: number
  riskScore: number
  riskLevel: RiskLevel
}

export interface RiskScore {
  score: number
  level: RiskLevel
  factors: {
    daysSinceLastActivity: number
    overdueTasksCount: number
    averageAssessmentScore: number
    chatSessionsLastWeek: number
    daysSinceRegistration: number
    diagnosticDone: boolean
  }
  alerts: AbandonmentAlert[]
}

export interface AbandonmentAlert {
  id: string
  riskScore: number
  triggerReason: string
  resolved: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  action: string
  metadata: Record<string, unknown>
  timestamp: string
}

export interface StudentDashboard {
  user: {
    name: string
    educationLevel: EducationLevel
    riskScore: number
    riskLevel: RiskLevel
  }
  stats: {
    enrolledCourses: number
    completedTasks: number
    pendingTasks: number
    averageScore: number
  }
  recentActivity: ActivityLog[]
  upcomingTasks: Task[]
  enrolledCourses: (Enrollment & { course: Course })[]
  recentAssessments: Assessment[]
  weeklyProgress: WeeklyDay[]
  riskAlert?: string
}

export interface TeacherDashboard {
  stats: {
    totalCourses: number
    totalStudents: number
    totalActiveCourses: number
  }
  myCourses: (Course & { studentCount: number })[]
  recentEnrollments: Enrollment[]
}

export interface AdminDashboard {
  stats: {
    totalUsers: number
    totalStudents: number
    totalTeachers: number
    totalCourses: number
    totalAssessments: number
  }
  usersByLevel: { level: EducationLevel; count: number }[]
  recentUsers: User[]
  highRiskStudents: (User & { riskScore: number })[]
}

// ─── Library ──────────────────────────────────────────────────────────────────
export interface Resource {
  id: string
  subjectId?: string
  subject?: Subject
  title: string
  description?: string
  url?: string
  type: ResourceType
  level: EducationLevel
  tags: string[]
  isPublic: boolean
  createdAt: string
}
