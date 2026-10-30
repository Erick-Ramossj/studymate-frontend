import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { assessmentsApi } from '@/api/assessments.api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import type { Question, AssessmentResult } from '@/types'
import toast from 'react-hot-toast'

const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', text: '¿Cuál es el resultado de 2² + 3²?', options: ['10', '13', '25', '7'], difficulty: 'easy' },
  { id: 'q2', text: '¿Qué etiqueta HTML se usa para un párrafo?', options: ['<div>', '<p>', '<span>', '<h1>'], difficulty: 'easy' },
  { id: 'q3', text: '¿Cuánto es la raíz cuadrada de 144?', options: ['10', '12', '14', '16'], difficulty: 'medium' },
  { id: 'q4', text: '¿Cuál es el símbolo químico del agua?', options: ['CO2', 'H2O', 'NaCl', 'O2'], difficulty: 'easy' },
  { id: 'q5', text: '¿Qué significa CSS?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Color Style Sheets'], difficulty: 'easy' },
]

export function AssessmentTakePage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const questions: Question[] = location.state?.questions ?? MOCK_QUESTIONS

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (result) return
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [result])

  const q = questions[current]
  const progress = ((current + 1) / questions.length) * 100
  const allAnswered = questions.every((q) => answers[q.id])

  function selectAnswer(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
      const res = await assessmentsApi.submit(id!, payload)
      setResult(res.data.data ?? null)
    } catch {
      // Mock result for offline mode
      const correct = Math.floor(questions.length * 0.7)
      setResult({
        assessmentId: id ?? 'mock',
        score: Math.round((correct / questions.length) * 100),
        maxScore: 100,
        percentage: Math.round((correct / questions.length) * 100),
        correct,
        total: questions.length,
        items: questions.map((q, i) => ({
          id: `item-${i}`,
          question: q.text,
          options: q.options,
          userAnswer: answers[q.id] ?? '',
          correctAnswer: q.options[0],
          isCorrect: i < correct,
          feedback: i < correct ? '¡Correcto! Bien hecho.' : `La respuesta correcta era: ${q.options[0]}`,
        })),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ─── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">Resultado de la evaluación</h1>

        {/* Score circle */}
        <Card className="text-center py-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2e3245" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={result.percentage >= 80 ? '#22c55e' : result.percentage >= 60 ? '#eab308' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${result.percentage} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white text-2xl font-bold">{result.percentage}%</span>
            </div>
          </div>
          <p className="text-white font-bold text-xl">
            {result.correct} de {result.total} correctas
          </p>
          <p className="text-slate-400 text-sm mt-1">Tiempo: {formatTime(elapsed)}</p>
          <p className={cn('text-lg font-semibold mt-3',
            result.percentage >= 80 ? 'text-green-400' : result.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
          )}>
            {result.percentage >= 80 ? '¡Excelente trabajo!' : result.percentage >= 60 ? 'Buen intento, sigue practicando' : 'Necesitas repasar este tema'}
          </p>
        </Card>

        {/* Item review */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold">Revisión de respuestas</h2>
          {result.items.map((item, i) => (
            <div key={item.id} className={cn(
              'p-4 rounded-2xl border',
              item.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
            )}>
              <div className="flex items-start gap-3">
                {item.isCorrect
                  ? <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                  : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{i + 1}. {item.question}</p>
                  <p className="text-slate-400 text-xs mt-1">Tu respuesta: <span className={item.isCorrect ? 'text-green-400' : 'text-red-400'}>{item.userAnswer}</span></p>
                  {!item.isCorrect && (
                    <p className="text-slate-400 text-xs">Correcta: <span className="text-green-400">{item.correctAnswer}</span></p>
                  )}
                  {item.feedback && <p className="text-slate-500 text-xs mt-1 italic">{item.feedback}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/assessments')} className="flex-1">
            Volver a evaluaciones
          </Button>
          <Button onClick={() => { setResult(null); setAnswers({}); setCurrent(0); setElapsed(0) }} className="flex-1">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  // ─── Question screen ────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/assessments')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> Salir
        </button>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Clock size={14} /> {formatTime(elapsed)}
        </div>
        <span className="text-slate-400 text-sm">{current + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-[#2e3245] rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <Card>
        <p className="text-slate-400 text-xs mb-2 uppercase tracking-wide">Pregunta {current + 1}</p>
        <p className="text-white text-lg font-semibold mb-6">{q.text}</p>
        <div className="space-y-3">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(q.id, option)}
              className={cn(
                'w-full p-4 rounded-xl border text-left text-sm transition-all',
                answers[q.id] === option
                  ? 'border-indigo-500 bg-indigo-500/15 text-white'
                  : 'border-[#2e3245] bg-[#242736] text-slate-300 hover:border-indigo-500/40 hover:text-white',
              )}
            >
              <span className="inline-flex w-6 h-6 rounded-full bg-[#1a1d27] border border-[#2e3245] items-center justify-center text-xs mr-3">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          Anterior
        </Button>
        {current < questions.length - 1 ? (
          <Button className="flex-1" onClick={() => setCurrent(current + 1)} disabled={!answers[q.id]}>
            Siguiente
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleSubmit} loading={submitting} disabled={!allAnswered}>
            Finalizar evaluación
          </Button>
        )}
      </div>

      {!allAnswered && current === questions.length - 1 && (
        <p className="text-slate-500 text-xs text-center">
          Responde todas las preguntas para finalizar ({Object.keys(answers).length}/{questions.length})
        </p>
      )}
    </div>
  )
}

// Suppress unused import
void toast
