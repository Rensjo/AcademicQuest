/**
 * Optimized task selectors to prevent unnecessary re-renders across multiple pages
 * Strategic resource allocation for Dashboard, CoursePlanner, and Tasks pages
 */

import { useMemo } from 'react'
import { useTasksStore, AQTask } from '@/store/tasksStore'
import { useAcademicPlan } from '@/store/academicPlanStore'

// Memoized selectors for different page contexts
export const useTaskSelectors = () => {
  // Core task data with minimal re-renders
  const allTasks = useTasksStore(state => state.tasks)
  const selectedYearId = useAcademicPlan(state => state.selectedYearId)
  
  // Dashboard-specific optimized selector
  const dashboardTasks = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return []
    
    // Only get upcoming tasks for dashboard (next 7 days)
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return allTasks
      .filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= now && dueDate <= nextWeek && task.status !== 'Completed'
      })
      .slice(0, 10) // Limit to 10 for performance
  }, [allTasks])

  // CoursePlanner-specific optimized selector
  const coursePlannerTasks = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return []
    
    // Filter by current year's terms
    return allTasks
      .filter(task => task.termId && task.termId.includes(selectedYearId || ''))
      .slice(0, 50) // Limit for performance
  }, [allTasks, selectedYearId])

  // Tasks page gets full data but with virtualization
  const tasksPageData = useMemo(() => {
    if (!allTasks) return { tasks: [], stats: { total: 0, completed: 0, pending: 0 } }
    
    const completed = allTasks.filter(task => task.status === 'Completed').length
    const pending = allTasks.filter(task => task.status !== 'Completed').length
    
    return {
      tasks: allTasks,
      stats: {
        total: allTasks.length,
        completed,
        pending
      }
    }
  }, [allTasks])

  return {
    dashboardTasks,
    coursePlannerTasks,
    tasksPageData
  }
}

// Lightweight task actions with debouncing
export const useOptimizedTaskActions = () => {
  const addTask = useTasksStore(state => state.addTask)
  const updateTask = useTasksStore(state => state.updateTask)
  const removeTask = useTasksStore(state => state.removeTask)
  const addTasksBulk = useTasksStore(state => state.addTasksBulk)

  // Debounced update to prevent excessive re-renders during typing
  const debouncedUpdate = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return (id: string, updates: Partial<AQTask>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => updateTask(id, updates), 150)
    }
  }, [updateTask])

  // Batched operations for better performance
  const batchedAdd = useMemo(() => {
    let batch: AQTask[] = []
    let timeoutId: NodeJS.Timeout
    
    return (task: Omit<AQTask, 'id'>) => {
      const taskWithId = { 
        ...task, 
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      } as AQTask
      
      batch.push(taskWithId)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (batch.length > 0) {
          addTasksBulk(batch)
          batch = []
        }
      }, 100)
    }
  }, [addTasksBulk])

  return {
    addTask,
    updateTask,
    removeTask,
    debouncedUpdate,
    batchedAdd
  }
}

// Resource-aware component mounting
export const useResourceAwareMount = (componentName: string) => {
  const mounted = useMemo(() => {
    const now = performance.now()
    
    // Stagger component mounting to prevent frame drops
    if (componentName === 'Dashboard') return true // Always mount first
    if (componentName === 'Tasks') return now > 100 // Delay slightly
    if (componentName === 'CoursePlanner') return now > 200 // Delay more
    
    return true
  }, [componentName])
  
  return mounted
}
