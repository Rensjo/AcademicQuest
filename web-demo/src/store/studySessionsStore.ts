import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_STUDY_SESSIONS } from './demoData'

export type StudySource = 'pomodoro' | 'manual' | 'schedule' | 'task' | 'import'

export interface StudySession {
  id: string
  yearId?: string
  termId?: string
  courseId?: string
  source: StudySource
  start: string // ISO string
  end?: string  // ISO string
  durationMin: number
  note?: string
}

type StudyState = {
  sessions: StudySession[]
  add: (s: StudySession) => void
  update: (id: string, patch: Partial<StudySession>) => void
  remove: (id: string) => void
  clearAll: () => void
}

// Helper function to convert demo study sessions to store format
const convertDemoStudySessions = (): StudySession[] => {
  return DEMO_STUDY_SESSIONS.map((session, index) => ({
    id: session.id || `demo-session-${index}`,
    yearId: session.yearId,
    termId: session.termId,
    courseId: session.subject?.toLowerCase().replace(' ', '-'),
    source: 'manual' as StudySource,
    start: `${session.date}T08:00:00.000Z`,
    end: `${session.date}T${String(8 + Math.floor(session.duration / 60)).padStart(2, '0')}:${String(session.duration % 60).padStart(2, '0')}:00.000Z`,
    durationMin: session.duration,
    note: `${session.type} for ${session.subject}`
  }))
}

export const useStudySessions = create<StudyState>()(
  persist(
    (set) => ({
      sessions: convertDemoStudySessions(),
      add: (s) => {
        // Reward XP for study session
        if (s.durationMin > 0) {
          import('./gamificationHelpers').then(({ rewardStudySession }) => {
            rewardStudySession(s.durationMin)
          })
        }
        set((st) => ({ sessions: [s, ...st.sessions] }))
      },
      update: (id, patch) => set((st) => ({
        sessions: st.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })),
      remove: (id) => set((st) => ({ sessions: st.sessions.filter((s) => s.id !== id) })),
      clearAll: () => set({ sessions: [] }),
    }),
    { name: 'aq:study-sessions' }
  )
)

// Helper to compute total minutes per day for a range (inclusive)
export function minutesByDay(sessions: StudySession[], startDate: Date, endDate: Date) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
  const map = new Map<string, number>()
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    map.set(d.toISOString().slice(0, 10), 0)
  }
  sessions.forEach((s) => {
    const day = new Date(s.start).toISOString().slice(0, 10)
    if (map.has(day)) map.set(day, (map.get(day) || 0) + (s.durationMin || 0))
  })
  return Array.from(map.entries()).map(([date, minutes]) => ({ date, minutes }))
}
