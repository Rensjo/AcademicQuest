import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefaultRoute = '/' | '/planner' | '/tasks' | '/schedule' | '/course-planner' | '/scholarships' | '/textbooks' | '/settings'
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'CNY' | 'KRW' | 'NGN' | 'ZAR' | 'PHP'
export type GPAScale = '4-highest' | '1-highest'
export type PomodoroPosition = 'tl' | 'tr' | 'bl' | 'br' | 'draggable'
export type PomodoroSize = 'small' | 'medium' | 'large'

type ChartAnim = 'normal' | 'fast' | 'off'

type SettingsState = {
  defaultRoute: DefaultRoute
  gradientsEnabled: boolean
  reducedMotion: boolean
  chartAnimation: ChartAnim
  confettiEnabled: boolean
  soundsEnabled: boolean
  // performance / quality
  performanceMode: 'auto' | 'manual'
  visualsQuality: 'high' | 'medium' | 'low'
  animations: 'full' | 'reduced' | 'off'

  weekStart: 0 | 1
  time24h: boolean
  dateFormat: 'auto' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'

  autosaveSeconds: 10 | 30 | 60 | 120
  askBeforeLeave: boolean

  notificationsEnabled: boolean
  quietStart: string // HH:mm
  quietEnd: string   // HH:mm

  // formatting
  preferredCurrency: CurrencyCode
  gpaScale: GPAScale

  gamificationEnabled: boolean
  showStreaks: boolean
  achievements: boolean
  challenges: boolean

  // textbook defaults
  textbookDefaultStatus: 'Ordered' | 'Shipped' | 'Received' | 'Returned' | 'Digital'
  textbookDefaultLinkMode: 'url' | 'file'

  // pomodoro settings
  pomodoroPosition: PomodoroPosition
  pomodoroSize: PomodoroSize
  pomodoroAutoHide: boolean

  // actions
  set: (p: Partial<SettingsState>) => void
  evaluateAutoPerformance?: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      defaultRoute: '/',
      gradientsEnabled: true,
      reducedMotion: false,
      chartAnimation: 'normal',
      confettiEnabled: true,
      soundsEnabled: false,
  performanceMode: 'auto',
  visualsQuality: 'high',
  animations: 'full',

      weekStart: 1,
      time24h: true,
      dateFormat: 'auto',

      autosaveSeconds: 30,
      askBeforeLeave: true,

      notificationsEnabled: false,
      quietStart: '22:00',
      quietEnd: '07:00',

  preferredCurrency: 'USD',
  gpaScale: '4-highest',

      gamificationEnabled: false,
      showStreaks: true,
      achievements: true,
      challenges: false,

      textbookDefaultStatus: 'Ordered',
      textbookDefaultLinkMode: 'file',

      // pomodoro defaults
      pomodoroPosition: 'draggable',
      pomodoroSize: 'medium',
      pomodoroAutoHide: false,

      set: (p) => set(p),
      evaluateAutoPerformance: () => set((s) => {
        if (s.performanceMode !== 'auto') return s
        
        // Check for auto-detected mode from main process
        const autoMode = localStorage.getItem('aq:auto-performance-mode')
        
        // Simple heuristics using navigator info
        const cores = (navigator.hardwareConcurrency || 4)
        // deviceMemory is not standard in all browsers
        const navWithMem = navigator as Navigator & { deviceMemory?: number }
        const mem = navWithMem.deviceMemory || 8
        const lowCPU = cores <= 4
        const lowMem = mem <= 4
        const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
        
        const next: Partial<SettingsState> = {}
        
        if (autoMode) {
          // Use auto-detected mode from main process
          next.visualsQuality = autoMode as 'high' | 'medium' | 'low'
          if (autoMode === 'low') {
            next.animations = 'reduced'
            next.chartAnimation = 'fast'
          } else if (autoMode === 'medium') {
            next.chartAnimation = 'fast'
          }
        } else {
          // Fallback to manual detection
          if (lowCPU || lowMem) {
            next.visualsQuality = 'medium'
          }
          if (lowCPU && lowMem) {
            next.visualsQuality = 'low'
            next.chartAnimation = 'fast'
          }
        }
        
        if (prefersReducedMotion) {
          next.animations = 'reduced'
        }
        
        console.log('[perf] Auto performance evaluation:', { cores, mem, autoMode, next })
        return Object.keys(next).length ? { ...s, ...next } : s
      }),
    }),
    { name: 'aq:settings' }
  )
)
