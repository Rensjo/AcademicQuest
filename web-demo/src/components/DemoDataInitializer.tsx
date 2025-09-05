// Demo data initializer - ensures demo data is loaded properly
import { useEffect } from 'react'

// This component ensures that demo data is properly initialized
export function DemoDataInitializer() {
  useEffect(() => {
    const DEMO_VERSION = '2.2' // Increment this to force data refresh
    const currentVersion = localStorage.getItem('aq:demo-version')
    
    if (currentVersion !== DEMO_VERSION) {
      // Clear any existing data and set demo flag
      localStorage.setItem('aq:demo-mode', 'true')
      localStorage.setItem('aq:demo-version', DEMO_VERSION)
      
      // Clear specific store data to force reload with demo data
      localStorage.removeItem('aq:schedule')
      localStorage.removeItem('aq:academic-plan')
      localStorage.removeItem('aq:tasks')
      localStorage.removeItem('aq:attendance')
      localStorage.removeItem('aq:study-sessions')
      localStorage.removeItem('aq:gamification')
      
      // Force reload of stores to ensure demo data is loaded
      console.log('🎯 Academic Quest Demo Mode Activated (v' + DEMO_VERSION + ')')
      console.log('📊 Sample data for 3 academic terms + current Fall 2025 loaded')
      console.log('🎮 Gamification features: Level 45, 15 badges unlocked')
      console.log('📝 Tasks: 42 total (29 completed, 9 pending, 4 overdue)')
      console.log('📚 Courses: 17 courses across 4 terms (Fall 2024, Spring 2025, Summer 2025, Fall 2025)')
      console.log('📖 Study Sessions: 330+ sessions across all terms (285.5 total hours)')
      console.log('🎯 Attendance: 312 classes attended with 94.2% overall rate')
      console.log('🔥 Streaks: 112-day current streak, 135-day longest streak')
      console.log('⏰ Current week tasks: 8 tasks due September 6-13, 2025')
      
      // Force a page reload to ensure all stores are re-initialized
      window.location.reload()
    }
  }, [])

  return null // This component doesn't render anything
}

export const isDemoMode = () => localStorage.getItem('aq:demo-mode') === 'true'

export const enableDemoMode = () => {
  localStorage.setItem('aq:demo-mode', 'true')
  window.location.reload()
}

export const disableDemoMode = () => {
  localStorage.removeItem('aq:demo-mode')
  // Optionally clear demo data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('aq:')) {
      localStorage.removeItem(key)
    }
  })
  window.location.reload()
}
