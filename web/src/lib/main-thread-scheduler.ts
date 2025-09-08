/**
 * Main Thread Optimization - Addresses the 539ms scripting bottleneck
 * Uses time-slicing and task scheduling to prevent blocking
 */

interface ScheduledTask {
  id: string
  priority: 'high' | 'normal' | 'low'
  task: () => void | Promise<void>
  deadline?: number
}

class MainThreadScheduler {
  private taskQueue: ScheduledTask[] = []
  private isProcessing = false
  public frameDeadline = 16.67 // 60fps = 16.67ms per frame
  private currentFrameStart = 0

  constructor() {
    this.startScheduler()
  }

  private startScheduler() {
    const processFrame = (frameStart: number) => {
      this.currentFrameStart = frameStart
      const frameEnd = frameStart + this.frameDeadline

      while (this.taskQueue.length > 0 && performance.now() < frameEnd - 2) {
        const task = this.taskQueue.shift()
        if (task) {
          try {
            const result = task.task()
            if (result instanceof Promise) {
              // Handle async tasks without blocking
              result.catch(error => console.warn('Async task error:', error))
            }
          } catch (error) {
            console.warn('Task execution error:', error)
          }
        }
      }

      // Continue processing in next frame if tasks remain
      if (this.taskQueue.length > 0) {
        requestAnimationFrame(processFrame)
      } else {
        this.isProcessing = false
      }
    }

    // Start the scheduler
    const startProcessing = () => {
      if (!this.isProcessing && this.taskQueue.length > 0) {
        this.isProcessing = true
        requestAnimationFrame(processFrame)
      }
    }

    // Check for new tasks every 100ms
    setInterval(startProcessing, 100)
  }

  scheduleTask(task: () => void | Promise<void>, priority: 'high' | 'normal' | 'low' = 'normal') {
    const scheduledTask: ScheduledTask = {
      id: Math.random().toString(36).substr(2, 9),
      priority,
      task,
      deadline: priority === 'high' ? performance.now() + 50 : undefined
    }

    // Insert based on priority
    if (priority === 'high') {
      this.taskQueue.unshift(scheduledTask)
    } else {
      this.taskQueue.push(scheduledTask)
    }

    // Sort by priority and deadline
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      const aPriority = priorityOrder[a.priority]
      const bPriority = priorityOrder[b.priority]
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      if (a.deadline && b.deadline) {
        return a.deadline - b.deadline
      }
      
      return 0
    })

    // Start processing if not already running
    if (!this.isProcessing) {
      this.isProcessing = true
      requestAnimationFrame((frameStart) => {
        this.currentFrameStart = frameStart
        const frameEnd = frameStart + this.frameDeadline

        while (this.taskQueue.length > 0 && performance.now() < frameEnd - 2) {
          const task = this.taskQueue.shift()
          if (task) {
            try {
              const result = task.task()
              if (result instanceof Promise) {
                result.catch(error => console.warn('Async task error:', error))
              }
            } catch (error) {
              console.warn('Task execution error:', error)
            }
          }
        }

        if (this.taskQueue.length === 0) {
          this.isProcessing = false
        }
      })
    }
  }

  clearTasks() {
    this.taskQueue = []
    this.isProcessing = false
  }

  getQueueLength(): number {
    return this.taskQueue.length
  }
}

// Create global scheduler instance
const mainThreadScheduler = new MainThreadScheduler()

// Export utility functions
export const scheduleTask = (task: () => void | Promise<void>, priority: 'high' | 'normal' | 'low' = 'normal') => {
  mainThreadScheduler.scheduleTask(task, priority)
}

export const scheduleHighPriorityTask = (task: () => void | Promise<void>) => {
  mainThreadScheduler.scheduleTask(task, 'high')
}

export const scheduleLowPriorityTask = (task: () => void | Promise<void>) => {
  mainThreadScheduler.scheduleTask(task, 'low')
}

export const clearAllTasks = () => {
  mainThreadScheduler.clearTasks()
}

export const getTaskQueueLength = (): number => {
  return mainThreadScheduler.getQueueLength()
}

// Hook for React components
export const useMainThreadScheduler = () => {
  return {
    scheduleTask,
    scheduleHighPriorityTask,
    scheduleLowPriorityTask,
    clearAllTasks,
    getTaskQueueLength
  }
}

// Performance-optimized event handling
export const createOptimizedEventHandler = <T extends Event>(
  handler: (event: T) => void,
  options: { debounce?: number; throttle?: number; priority?: 'high' | 'normal' | 'low' } = {}
) => {
  const { debounce = 0, throttle = 0, priority = 'normal' } = options
  
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecuted = 0

  return (event: T) => {
    const now = performance.now()
    
    // Clear existing timeout for debouncing
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // Check throttling
    if (throttle > 0 && now - lastExecuted < throttle) {
      return
    }
    
    const executeHandler = () => {
      scheduleTask(() => handler(event), priority)
      lastExecuted = performance.now()
    }
    
    if (debounce > 0) {
      timeoutId = setTimeout(executeHandler, debounce)
    } else {
      executeHandler()
    }
  }
}

// Optimized state updater for React
export const createOptimizedStateUpdater = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  options: { batchUpdates?: boolean; priority?: 'high' | 'normal' | 'low' } = {}
) => {
  const { batchUpdates = true, priority = 'normal' } = options
  const pendingUpdates: Array<React.SetStateAction<T>> = []
  let updateScheduled = false

  const flushUpdates = () => {
    if (pendingUpdates.length === 0) return
    
    const updates = [...pendingUpdates]
    pendingUpdates.length = 0
    updateScheduled = false
    
    // Apply all updates in a single setState call
    setState(prevState => {
      let state = prevState
      for (const update of updates) {
        if (typeof update === 'function') {
          state = (update as (prev: T) => T)(state)
        } else {
          state = update
        }
      }
      return state
    })
  }

  return (update: React.SetStateAction<T>) => {
    if (batchUpdates) {
      pendingUpdates.push(update)
      
      if (!updateScheduled) {
        updateScheduled = true
        scheduleTask(flushUpdates, priority)
      }
    } else {
      scheduleTask(() => setState(update), priority)
    }
  }
}

// Auto-initialize for desktop apps
if (typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) {
  console.log('🚀 Main thread scheduler initialized for desktop app')
  
  // Monitor performance and adjust frame deadline
  setInterval(() => {
    const performanceWithMemory = performance as typeof performance & { memory?: { usedJSHeapSize: number } }
    if (performanceWithMemory.memory) {
      const memory = performanceWithMemory.memory
      const memoryPressure = memory.usedJSHeapSize / (50 * 1024 * 1024) // 50MB baseline
      
      // Adjust frame deadline based on memory pressure
      if (memoryPressure > 1) {
        mainThreadScheduler.frameDeadline = Math.max(8, 16.67 - (memoryPressure * 2))
      } else {
        mainThreadScheduler.frameDeadline = 16.67
      }
    }
  }, 5000)
}
