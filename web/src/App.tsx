import React from 'react'
import { MotionConfig } from 'framer-motion'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTheme } from '@/store/theme'
import { useSettings } from '@/store/settingsStore'
import NotificationSystem from '@/components/NotificationSystem'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { soundService } from '@/services/soundService'
import { setupAutomaticCleanup } from '@/lib/storage-cleanup'
import { initializeDesktopOptimizations, isDesktopApp } from '@/lib/desktop-optimizations'
import { initPerformanceMonitor } from '@/lib/performance-monitor'
import { initAdvancedPerformanceSystem } from '@/lib/advanced-performance'
import { ResourceManagerProvider } from '@/lib/resource-manager'

const FONT_STACKS: Record<string, string> = {
  Inter: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  Poppins: "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  Nunito: "'Nunito', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  Outfit: "'Outfit', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  Roboto: "Roboto, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  Lato: "Lato, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
  Montserrat: "Montserrat, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif",
  'Source Sans 3': "'Source Sans 3', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
}

export default function App() {
  const theme = useTheme()
  const settings = useSettings()
  const navigate = useNavigate()

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCtrl = e.ctrlKey || e.metaKey
      if (!isCtrl) return

      switch (e.key) {
        case '1':
          e.preventDefault()
          navigate('/')
          soundService.play('click')
          break
        case '2':
          e.preventDefault()
          navigate('/planner')
          soundService.play('click')
          break
        case '3':
          e.preventDefault()
          navigate('/tasks')
          soundService.play('click')
          break
        case '4':
          e.preventDefault()
          navigate('/schedule')
          soundService.play('click')
          break
        case '5':
          e.preventDefault()
          navigate('/courses')
          soundService.play('click')
          break
        case '6':
          e.preventDefault()
          navigate('/settings')
          soundService.play('click')
          break
        case 'g':
          e.preventDefault()
          // Open gamification panel (we can implement this later)
          soundService.play('click')
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [navigate])

  React.useEffect(() => {
    const stack = FONT_STACKS[theme.font] ?? FONT_STACKS['Inter']
    document.body.style.fontFamily = stack
  }, [theme.font])

  // Auto-evaluate performance heuristics on first mount if in auto mode
  React.useEffect(() => {
    if (settings.performanceMode === 'auto' && settings.evaluateAutoPerformance) {
      settings.evaluateAutoPerformance()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply performance-related data attributes/classes on settings changes
  React.useEffect(() => {
    const root = document.documentElement
    root.dataset.visuals = settings.visualsQuality
    root.dataset.anim = settings.animations
    // Provide coarse classes for easier targeting if desired
    root.classList.toggle('anim-off', settings.animations === 'off')
    root.classList.toggle('anim-reduced', settings.animations === 'reduced')
  }, [settings.visualsQuality, settings.animations])

  // Initialize storage cleanup and desktop optimizations on app start
  React.useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitor()
    
    // Initialize advanced performance system for desktop
    if (isDesktopApp()) {
      console.log('🚀 Initializing advanced performance system for desktop...')
      initAdvancedPerformanceSystem()
    }
    
    // Initialize desktop optimizations first (if running in Electron)
    const desktopOpts = initializeDesktopOptimizations()
    if (desktopOpts) {
      console.log('🖥️ Desktop optimizations initialized')
    } else if (isDesktopApp()) {
      console.warn('⚠️ Running in desktop app but optimizations failed to initialize')
    }
    
    // Then setup storage cleanup
    setupAutomaticCleanup()
  }, [])

  // Apply global text scale by changing root font-size (Tailwind uses rem units)
  React.useEffect(() => {
    const pct = Math.round(theme.textScale * 100)
    document.documentElement.style.fontSize = `${pct}%`
  }, [theme.textScale])

  // Apply global radius to CSS var used by components (shadcn/ui)
  React.useEffect(() => {
    const rem = (theme.radius / 16).toFixed(3)
    document.documentElement.style.setProperty('--radius', `${rem}rem`)
  }, [theme.radius])

  // Reduced motion: toggle a class that disables CSS transitions/animations globally
  React.useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', !!settings.reducedMotion)
  }, [settings.reducedMotion])

  // Initialize sound service (this ensures it's loaded)
  React.useEffect(() => {
    console.log('🔊 App initializing sound service...')
    // Just accessing soundService ensures it's initialized
    const enabled = soundService.isEnabled()
    console.log('🔊 Sound service state:', { enabled })
  }, [])

  const animations = settings.animations; // full | reduced | off
  const reduced = animations === 'reduced' || animations === 'off';
  const shouldDisable = animations === 'off';

  return (
    <ErrorBoundary>
      <ResourceManagerProvider>
        <MotionConfig
          reducedMotion={shouldDisable ? 'always' : reduced ? 'user' : 'never'}
          transition={{
            duration: reduced ? 0.25 : 0.45,
            ease: reduced ? 'linear' : [0.22, 1, 0.36, 1]
          }}
        >
          <div className="app-container">
            <Outlet />
            <NotificationSystem />
          </div>
        </MotionConfig>
      </ResourceManagerProvider>
    </ErrorBoundary>
  )
}