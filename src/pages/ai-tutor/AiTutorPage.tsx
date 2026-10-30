import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Bot, User, Sparkles, BookOpen, Lightbulb, RefreshCw, Dumbbell, AlertTriangle } from 'lucide-react'
import { aiApi } from '@/api/ai.api'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils/cn'
import { EDUCATION_LEVEL_LABELS } from '@/utils/format'


// ─── Mock responses fallback when backend is offline ─────────────────────────
const MOCK_RESPONSES: Record<string, string> = {
  default: 'Hola! Soy StudyMate, tu tutor inteligente. Puedo explicarte cualquier tema, generar ejercicios y ayudarte a estudiar mejor. ¿Qué quieres aprender hoy?',
  matematicas: 'Para resolver ecuaciones de segundo grado, usamos la fórmula cuadrática:\n\n**x = (-b ± √(b²-4ac)) / 2a**\n\nDonde *a*, *b* y *c* son los coeficientes de la ecuación ax² + bx + c = 0.\n\n¿Quieres que resolvamos un ejemplo juntos?',
  programacion: 'Una función en JavaScript se define así:\n\n```js\nfunction saludar(nombre) {\n  return `Hola, ${nombre}!`\n}\n```\n\nLas funciones reciben parámetros y retornan un valor. ¿Te gustaría practicar con ejercicios?',
  ingles: 'In English, we use the Present Perfect tense to talk about experiences or actions that have an effect on the present:\n\n**"I have studied for the exam."**\n\nFormula: Subject + have/has + past participle\n\nWould you like more examples?',
  historia: 'La Segunda Guerra Mundial (1939-1945) fue el conflicto armado más devastador de la historia. Comenzó con la invasión de Polonia por parte de la Alemania Nazi.\n\nLos principales bloques fueron:\n- **Aliados**: EEUU, Reino Unido, URSS, Francia\n- **Eje**: Alemania, Italia, Japón\n\n¿Quieres profundizar en algún aspecto específico?',
  quimica: 'Los enlaces químicos son las fuerzas que mantienen unidos a los átomos en una molécula:\n\n1. **Enlace covalente**: Compartición de electrones (ej: H₂O)\n2. **Enlace iónico**: Transferencia de electrones (ej: NaCl)\n3. **Enlace metálico**: En metales puros\n\n¿Cuál quieres estudiar más a fondo?',
  ayuda: 'Puedo ayudarte con:\n\n📚 **Explicar temas** de cualquier materia\n✏️ **Generar ejercicios** de práctica\n🧩 **Resolver dudas** paso a paso\n📅 **Organizar** tu tiempo de estudio\n\nCuéntame qué materia o tema necesitas repasar.',
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('matemat') || lower.includes('ecuaci') || lower.includes('algebra')) return MOCK_RESPONSES.matematicas
  if (lower.includes('program') || lower.includes('javascript') || lower.includes('código') || lower.includes('funcion')) return MOCK_RESPONSES.programacion
  if (lower.includes('ingles') || lower.includes('english') || lower.includes('idioma')) return MOCK_RESPONSES.ingles
  if (lower.includes('histor') || lower.includes('guerra') || lower.includes('civiliz')) return MOCK_RESPONSES.historia
  if (lower.includes('quimic') || lower.includes('enlace') || lower.includes('átomo')) return MOCK_RESPONSES.quimica
  if (lower.includes('ayuda') || lower.includes('hola') || lower.includes('puedes')) return MOCK_RESPONSES.ayuda
  return `Entiendo que tienes dudas sobre "${message}". Déjame explicarte paso a paso:\n\nEste es un tema importante en tu área de estudio. Para comprenderlo mejor, te recomiendo:\n\n1. Primero revisar los conceptos básicos relacionados\n2. Practicar con ejemplos simples\n3. Progresar a casos más complejos\n\n¿Quieres que empecemos con los fundamentos?`
}

const SUGGESTED_TOPICS = [
  { icon: <BookOpen size={14} />, text: 'Explícame las ecuaciones de segundo grado' },
  { icon: <Lightbulb size={14} />, text: 'Cómo funciona el Present Perfect en inglés' },
  { icon: <Dumbbell size={14} />, text: 'Genera ejercicios de programación básica' },
  { icon: <Sparkles size={14} />, text: 'Ayúdame a organizar mi plan de estudio' },
]

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: string
}

export function AiTutorPage() {
  const user = useAuthStore((s) => s.user)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content: `¡Hola${user ? `, ${user.name.split(' ')[0]}` : ''}! Soy **StudyMate AI**, tu tutor personal. Estoy aquí para ayudarte con cualquier tema académico, explicarte conceptos, generar ejercicios y apoyarte en tu aprendizaje.\n\n¿Con qué quieres comenzar hoy?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [subject, setSubject] = useState('')
  // Mensaje de estado para errores de la IA (throttling de Bedrock, caída, etc.)
  const [notice, setNotice] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'USER',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setNotice(null)

    try {
      const res = await aiApi.chat({ message: text, sessionId, subject: subject || undefined })
      const { sessionId: newSessionId, message } = res.data.data!
      setSessionId(newSessionId)

      const assistantMsg: Message = {
        id: message.id,
        role: 'ASSISTANT',
        content: message.content,
        timestamp: message.timestamp,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      // Mostrar un aviso claro según el tipo de error de la IA (Bedrock).
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      if (status === 429) {
        setNotice(
          'El tutor IA está recibiendo muchas solicitudes (throttling). Te respondemos con una guía mientras tanto; reintenta en unos segundos.',
        )
      } else if (status === 401) {
        setNotice('Tu sesión expiró. Vuelve a iniciar sesión para usar el tutor IA.')
      } else {
        setNotice(
          'No pudimos conectar con el tutor IA en este momento. Te mostramos una respuesta orientativa sin conexión.',
        )
      }

      // Respuesta de respaldo para no dejar al estudiante sin ayuda.
      await new Promise((r) => setTimeout(r, 400))
      const mockMsg: Message = {
        id: `mock-${Date.now()}`,
        role: 'ASSISTANT',
        content: getMockResponse(text),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, mockMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function clearChat() {
    setMessages([{
      id: 'welcome-new',
      role: 'ASSISTANT',
      content: '¡Chat reiniciado! ¿En qué puedo ayudarte ahora?',
      timestamp: new Date().toISOString(),
    }])
    setSessionId(undefined)
    setNotice(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <Bot size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-white font-bold">Tutor IA</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-slate-500 text-xs hidden sm:block">
              {EDUCATION_LEVEL_LABELS[user.educationLevel]} · {user.field}
            </span>
          )}
          <input
            type="text"
            placeholder="Materia (opcional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-[#1a1d27] border border-[#2e3245] rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 w-36"
          />
          <Button variant="ghost" size="sm" onClick={clearChat} title="Nuevo chat">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Aviso de estado de la IA (throttling / error / offline) */}
      {notice && (
        <div className="flex items-start gap-2 mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-300 text-xs leading-relaxed flex-1">{notice}</p>
          <button
            onClick={() => setNotice(null)}
            className="text-yellow-400/70 hover:text-yellow-300 text-xs"
            aria-label="Descartar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} userName={user?.name ?? 'Tú'} />
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-indigo-400" />
            </div>
            <div className="bg-[#1a1d27] border border-[#2e3245] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested topics — only when few messages */}
      {messages.length <= 1 && (
        <div className="py-3">
          <p className="text-slate-500 text-xs mb-2 text-center">Sugerencias para comenzar</p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_TOPICS.map((t) => (
              <button
                key={t.text}
                onClick={() => sendMessage(t.text)}
                className="flex items-center gap-2 p-3 bg-[#1a1d27] border border-[#2e3245] rounded-xl text-slate-400 hover:text-white hover:border-indigo-500/30 text-xs text-left transition-all"
              >
                <span className="text-indigo-400 flex-shrink-0">{t.icon}</span>
                {t.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 pt-3 border-t border-[#2e3245]">
        <div className="flex-1 flex items-end bg-[#1a1d27] border border-[#2e3245] rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none resize-none max-h-32"
            style={{ lineHeight: '1.5' }}
          />
        </div>
        <Button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="self-end w-11 h-11 p-0 flex items-center justify-center rounded-xl"
        >
          <Send size={16} />
        </Button>
      </div>
      <p className="text-slate-600 text-xs text-center mt-2">
        <Sparkles size={10} className="inline mr-1" />
        Potenciado por IA · Las respuestas son orientativas
      </p>
    </div>
  )
}

function MessageBubble({ message, userName }: { message: Message; userName: string }) {
  const isUser = message.role === 'USER'

  // Simple markdown-like rendering
  function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      const italicLine = boldLine.replace(/\*(.*?)\*/g, '<em>$1</em>')
      const codeLine = italicLine.replace(/`([^`]+)`/g, '<code class="bg-[#0f1117] px-1 py-0.5 rounded text-indigo-300 text-xs">$1</code>')
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: codeLine + (i < text.split('\n').length - 1 ? '<br/>' : '') }}
        />
      )
    })
  }

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-indigo-600' : 'bg-indigo-500/20',
      )}>
        {isUser
          ? <User size={15} className="text-white" />
          : <Bot size={15} className="text-indigo-400" />
        }
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[80%] px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
          : 'bg-[#1a1d27] border border-[#2e3245] text-slate-300 rounded-2xl rounded-tl-sm',
      )}>
        <div className="space-y-1">
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  )
}


