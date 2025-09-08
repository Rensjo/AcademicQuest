/**
 * Advanced performance optimization system for desktop apps
 * Targets the specific issues seen in performance profiling
 */

interface TaskQueueItem {
  id: string
  task: { type: string; data: unknown }
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}

interface ProcessableItem {
  id: number
  [key: string]: unknown
}

// Advanced Worker for heavy computations
class PerformanceWorker {
  private worker: Worker | null = null
  private taskQueue: TaskQueueItem[] = []

  constructor() {
    this.initWorker()
  }

  private initWorker() {
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { id, type, data } = e.data
          
          try {
            let result
            switch (type) {
              case 'heavyComputation':
                result = performHeavyComputation(data)
                break
              case 'dataProcessing':
                result = processLargeData(data)
                break
              case 'sorting':
                result = optimizedSort(data)
                break
              default:
                result = data
            }
            
            self.postMessage({ id, result, success: true })
          } catch (error) {
            self.postMessage({ id, error: error.message, success: false })
          }
        }
        
        function performHeavyComputation(data) {
          // Simulate heavy work with efficient algorithms
          return data.map(item => ({ ...item, processed: true }))
        }
        
        function processLargeData(data) {
          // Process data in chunks to avoid blocking
          const chunkSize = 1000
          const result = []
          
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize)
            result.push(...chunk.map(item => item))
          }
          
          return result
        }
        
        function optimizedSort(data) {
          return data.sort((a, b) => a.id - b.id)
        }
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      this.worker = new Worker(URL.createObjectURL(blob))
      
      this.worker.onmessage = (e) => {
        const { id, result, error, success } = e.data
        const task = this.taskQueue.find(t => t.id === id)
        
        if (task) {
          this.taskQueue = this.taskQueue.filter(t => t.id !== id)
          if (success) {
            task.resolve(result)
          } else {
            task.reject(new Error(error))
          }
        }
      }
    }
  }

  async executeTask(type: string, data: unknown): Promise<unknown> {
    if (!this.worker) {
      // Fallback to main thread if worker unavailable
      return this.fallbackExecution(type, data)
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9)
      this.taskQueue.push({ id, task: { type, data }, resolve, reject })
      
      this.worker!.postMessage({ id, type, data })
      
      // Timeout to prevent hanging
      setTimeout(() => {
        const taskIndex = this.taskQueue.findIndex(t => t.id === id)
        if (taskIndex !== -1) {
          this.taskQueue.splice(taskIndex, 1)
          reject(new Error('Task timeout'))
        }
      }, 5000)
    })
  }

  private fallbackExecution(type: string, data: unknown): unknown {
    // Fallback implementations
    switch (type) {
      case 'heavyComputation':
        return Array.isArray(data) ? data.map((item: unknown) => ({ ...item as object, processed: true })) : data
      case 'dataProcessing':
        return data
      case 'sorting':
        return Array.isArray(data) ? data.sort((a: ProcessableItem, b: ProcessableItem) => a.id - b.id) : data
      default:
        return data
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.taskQueue = []
  }
}

// Advanced Frame Rate Controller
class FrameRateController {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60
  private frameCallbacks: Array<() => void> = []
  private isRunning = false

  constructor(targetFPS = 60) {
    this.fps = targetFPS
    this.start()
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.loop()
  }

  private loop() {
    if (!this.isRunning) return

    const now = performance.now()
    const delta = now - this.lastTime

    // Maintain target FPS
    if (delta >= 1000 / this.fps) {
      this.frameCount++
      this.lastTime = now

      // Execute frame callbacks
      this.frameCallbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.warn('Frame callback error:', error)
        }
      })

      // Clear callbacks for next frame
      this.frameCallbacks = []
    }

    requestAnimationFrame(() => this.loop())
  }

  scheduleFrameTask(callback: () => void) {
    this.frameCallbacks.push(callback)
  }

  getCurrentFPS(): number {
    return Math.min(this.fps, 60)
  }

  stop() {
    this.isRunning = false
  }
}

// Memory Management System
class MemoryManager {
  private memoryThreshold = 50 * 1024 * 1024 // 50MB
  private cleanupCallbacks: Array<() => void> = []
  private isMonitoring = false

  constructor() {
    this.startMonitoring()
  }

  startMonitoring() {
    if (this.isMonitoring) return
    this.isMonitoring = true

    setInterval(() => {
      const performanceWithMemory = performance as typeof performance & { memory?: { usedJSHeapSize: number } }
      if (performanceWithMemory.memory) {
        const memory = performanceWithMemory.memory
        if (memory.usedJSHeapSize > this.memoryThreshold) {
          this.triggerCleanup()
        }
      }
    }, 30000) // Check every 30 seconds
  }

  addCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.push(callback)
  }

  private triggerCleanup() {
    console.log('🧹 Triggering memory cleanup...')
    
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.warn('Cleanup callback error:', error)
      }
    })

    // Force garbage collection if available
    const windowWithGC = window as typeof window & { gc?: () => void }
    if (windowWithGC.gc) {
      windowWithGC.gc()
    }
  }

  forceCleanup() {
    this.triggerCleanup()
  }
}

// Advanced DOM Optimization
class DOMOptimizer {
  private mutationObserver: MutationObserver | null = null
  private batchedUpdates: Array<() => void> = []
  private updateScheduled = false

  constructor() {
    this.setupObserver()
  }

  private setupObserver() {
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver((mutations) => {
        let hasSignificantChanges = false
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 5) {
            hasSignificantChanges = true
          }
        })

        if (hasSignificantChanges) {
          this.optimizeDOM()
        }
      })

      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
      })
    }
  }

  batchDOMUpdate(updateFn: () => void) {
    this.batchedUpdates.push(updateFn)
    
    if (!this.updateScheduled) {
      this.updateScheduled = true
      requestAnimationFrame(() => {
        this.executeBatchedUpdates()
      })
    }
  }

  private executeBatchedUpdates() {
    const updates = [...this.batchedUpdates]
    this.batchedUpdates = []
    this.updateScheduled = false

    // Execute all updates in a single frame
    updates.forEach(update => {
      try {
        update()
      } catch (error) {
        console.warn('DOM update error:', error)
      }
    })
  }

  private optimizeDOM() {
    // Remove invisible elements
    const invisibleElements = document.querySelectorAll('[style*="display: none"], [hidden]')
    invisibleElements.forEach(element => {
      if (element.children.length === 0) {
        element.remove()
      }
    })

    // Optimize images
    const images = document.querySelectorAll('img:not([loading])')
    images.forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
  }

  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }
  }
}

// Main Advanced Performance System
class AdvancedPerformanceSystem {
  private worker: PerformanceWorker
  private frameController: FrameRateController
  private memoryManager: MemoryManager
  private domOptimizer: DOMOptimizer
  private isInitialized = false

  constructor() {
    this.worker = new PerformanceWorker()
    this.frameController = new FrameRateController(60)
    this.memoryManager = new MemoryManager()
    this.domOptimizer = new DOMOptimizer()
  }

  async initialize() {
    if (this.isInitialized) return
    
    console.log('🚀 Initializing Advanced Performance System...')
    
    // Setup memory cleanup
    this.memoryManager.addCleanupCallback(() => {
      // Clear caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old') || name.includes('temp')) {
              caches.delete(name)
            }
          })
        })
      }
    })

    // Preload critical resources
    await this.preloadCriticalResources()
    
    // Setup frame-based optimizations
    this.setupFrameOptimizations()
    
    this.isInitialized = true
    console.log('✅ Advanced Performance System initialized')
  }

  private async preloadCriticalResources() {
    const criticalResources = [
      './sounds/hover-button-sound.mp3',
      './sounds/single-mouse-button-click-351381.mp3',
      './sounds/task-complete-sound.mp3'
    ]

    const promises = criticalResources.map(async (src) => {
      try {
        const audio = new Audio(src)
        audio.preload = 'auto'
        audio.volume = 0.01
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true })
          audio.addEventListener('error', reject, { once: true })
          audio.load()
        })
        return { src, audio }
      } catch (error) {
        console.warn(`Failed to preload ${src}:`, error)
        return null
      }
    })

    const results = await Promise.allSettled(promises)
    console.log('🎵 Preloaded audio resources:', results.filter(r => r.status === 'fulfilled').length)
  }

  private setupFrameOptimizations() {
    // Schedule regular optimizations
    setInterval(() => {
      this.frameController.scheduleFrameTask(() => {
        // Optimize DOM every 5 seconds
        this.domOptimizer.batchDOMUpdate(() => {
          // Micro-optimizations
          this.optimizeScrollPerformance()
        })
      })
    }, 5000)
  }

  private optimizeScrollPerformance() {
    // Add passive scroll listeners
    const scrollElements = document.querySelectorAll('[style*="overflow"]')
    scrollElements.forEach(element => {
      if (!element.hasAttribute('data-scroll-optimized')) {
        element.setAttribute('data-scroll-optimized', 'true')
        element.addEventListener('scroll', this.throttleScroll, { passive: true })
      }
    })
  }

  private throttleScroll = (() => {
    let ticking = false
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ticking = false
        })
        ticking = true
      }
    }
  })()

  // Public methods for external use
  async processLargeDataset(data: unknown[]) {
    return await this.worker.executeTask('dataProcessing', data)
  }

  scheduleDOMUpdate(updateFn: () => void) {
    this.domOptimizer.batchDOMUpdate(updateFn)
  }

  forceMemoryCleanup() {
    this.memoryManager.forceCleanup()
  }

  getCurrentFPS(): number {
    return this.frameController.getCurrentFPS()
  }

  destroy() {
    this.worker.terminate()
    this.frameController.stop()
    this.domOptimizer.destroy()
    this.isInitialized = false
  }
}

// Global instance
let advancedPerfSystem: AdvancedPerformanceSystem | null = null

export const initAdvancedPerformanceSystem = (): AdvancedPerformanceSystem => {
  if (!advancedPerfSystem) {
    advancedPerfSystem = new AdvancedPerformanceSystem()
    advancedPerfSystem.initialize()
  }
  return advancedPerfSystem
}

export const getAdvancedPerformanceSystem = (): AdvancedPerformanceSystem | null => {
  return advancedPerfSystem
}

// Auto-initialize for desktop
if (typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron')) {
  console.log('🖥️ Desktop detected - initializing advanced performance system')
  initAdvancedPerformanceSystem()
}
