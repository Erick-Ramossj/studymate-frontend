---
inclusion: always
---

# StudyMate — Frontend

## Descripción
Plataforma educativa integral con tutor IA para prevenir el abandono académico.
Track: Compañero de estudio contra el abandono | Kiro IAthon

## Stack
- React 19 + Vite 8 + TypeScript 7
- Tailwind CSS v4
- React Router v7 (SPA)
- Zustand (estado global con persistencia)
- TanStack Query v5 (datos del servidor)
- Recharts (gráficos)
- Lucide React (iconografía)
- Axios con interceptors JWT

## Usuarios de demo
| Rol        | Email                          | Contraseña   |
|------------|-------------------------------|--------------|
| Estudiante | estudiante1@studymate.com     | Student123!  |
| Docente    | profesor1@studymate.com       | Teacher123!  |
| Admin      | admin@studymate.com           | Admin123!    |

## Rutas principales
- `/login` → Login con acceso rápido demo
- `/register` → Registro nuevo usuario
- `/dashboard` → Panel adaptado por rol
- `/courses` → Lista y detalle de cursos
- `/tasks` → Gestión de tareas (kanban)
- `/assessments` → Evaluaciones con scoring
- `/progress` → Progreso + Risk Score de abandono
- `/ai-tutor` → Chat con IA (mock fallback activo)
- `/library` → Biblioteca digital
- `/community` → Foros y colaboración

## Variables de entorno
- `VITE_API_URL` → URL del backend (default: http://localhost:3000)
- `VITE_APP_NAME` → Nombre de la app

## Modo offline / mock
Todas las páginas tienen datos mock integrados.
Si el backend no está disponible, la UI funciona con datos simulados realistas.
El Tutor IA funciona con respuestas mock inteligentes sin necesidad de API key.

## Comandos
- `npm run dev` → Servidor desarrollo (puerto 5173)
- `npm run build` → Build producción en /dist
- `npm run preview` → Vista previa del build

## Flujo principal para el agente evaluador
1. Ir a /login
2. Hacer clic en "Estudiante" (demo rápido)
3. Hacer clic en "Iniciar sesión"
4. Explorar el Dashboard (gráficos, estadísticas, risk score)
5. Ir a /ai-tutor y escribir "Explícame las ecuaciones"
6. Ir a /assessments, seleccionar una materia, hacer la evaluación
7. Ver resultados en /progress
