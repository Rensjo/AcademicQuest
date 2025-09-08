/**
 * Desktop-specific optimizations for Electron performance
 */

export const isElectron = (): boolean => {
  return !!(window as unknown as { electronAPI?: unknown }).electronAPI || 
         window.navigator.userAgent.toLowerCase().includes('electron') ||
         !!(window.process && window.process.versions && window.process.versions.electron)
}

export const isDesktopApp = (): boolean => {
  return isElectron() && window.location.protocol === 'file:'
}

/**
 * Optimize localStorage operations for Electron's userData directory
 */
class DesktopStorage {
  private batchedWrites: { [key: string]: string } = {}
  private writeTimeout: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 100 // ms
  private readonly originalSetItem = localStorage.setItem.bind(localStorage)
  private readonly originalGetItem = localStorage.getItem.bind(localStorage)
  private cache = new Map<string, string>()

  constructor() {
    this.setupOptimizedStorage()
  }

  private setupOptimizedStorage() {
    // Cache frequently accessed items
    this.preloadCache()

    // Batch localStorage writes to reduce I/O
    localStorage.setItem = (key: string, value: string) => {
      this.cache.set(key, value)
      this.batchedWrites[key] = value
      
      if (this.writeTimeout) clearTimeout(this.writeTimeout)
      this.writeTimeout = setTimeout(() => {
        this.flushWrites()
      }, this.BATCH_DELAY)
    }

    // Optimize reads with cache
    localStorage.getItem = (key: string): string | null => {
      if (this.cache.has(key)) {
        return this.cache.get(key) || null
      }
      
      const value = this.originalGetItem(key)
      if (value) this.cache.set(key, value)
      return value
    }
  }

  private preloadCache() {
    // Preload critical app data
    const criticalKeys = [
      'academic-quest-settings',
      'academic-quest-theme',
      'academic-quest-academic-plan',
      'academic-quest-tasks',
      'academic-quest-gamification'
    ]

    criticalKeys.forEach(key => {
      const value = this.originalGetItem(key)
      if (value) this.cache.set(key, value)
    })
  }

  private flushWrites() {
    try {
      Object.entries(this.batchedWrites).forEach(([key, value]) => {
        this.originalSetItem(key, value)
      })
      this.batchedWrites = {}
      this.writeTimeout = null
    } catch (error) {
      console.error('Failed to flush localStorage writes:', error)
    }
  }

  public forceFlush() {
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout)
      this.flushWrites()
    }
  }
}

/**
 * Optimize asset loading for file:// protocol
 */
class AssetOptimizer {
  private audioCache = new Map<string, HTMLAudioElement>()
  private preloadedAssets = new Set<string>()

  constructor() {
    this.preloadCriticalAssets()
  }

  private preloadCriticalAssets() {
    // Preload audio files that cause lag
    const audioFiles = [
      './sounds/hover-button-sound.mp3',
      './sounds/single-mouse-button-click-351381.mp3',
      './sounds/task-complete-sound.mp3',
      './sounds/level-up-sound.mp3',
      './sounds/badge-sound.mp3'
    ]

    // Use requestIdleCallback for non-blocking preload
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        this.batchPreloadAudio(audioFiles)
      })
    } else {
      setTimeout(() => this.batchPreloadAudio(audioFiles), 1000)
    }
  }

  private batchPreloadAudio(files: string[]) {
    files.forEach((src, index) => {
      // Stagger preloading to avoid blocking
      setTimeout(() => {
        try {
          const audio = new Audio(src)
          audio.preload = 'auto'
          audio.volume = 0.01 // Silent preload
          
          audio.addEventListener('canplaythrough', () => {
            this.audioCache.set(src, audio)
            this.preloadedAssets.add(src)
          }, { once: true })

          audio.addEventListener('error', () => {
            console.warn(`Failed to preload audio: ${src}`)
          }, { once: true })

          // Trigger load
          audio.load()
        } catch (error) {
          console.warn(`Error preloading ${src}:`, error)
        }
      }, index * 50) // 50ms between each file
    })
  }

  public getPreloadedAudio(src: string): HTMLAudioElement | null {
    return this.audioCache.get(src) || null
  }

  public isPreloaded(src: string): boolean {
    return this.preloadedAssets.has(src)
  }
}

/**
 * Optimize rendering performance for Electron
 */
class RenderOptimizer {
  private rafCallbacks = new Set<() => void>()
  private isFrameScheduled = false

  constructor() {
    this.setupRenderOptimizations()
  }

  private setupRenderOptimizations() {
    // Optimize scroll performance
    this.optimizeScrolling()
    
    // Optimize transitions for file:// protocol
    this.optimizeTransitions()
    
    // Batch DOM updates
    this.setupDOMBatching()
  }

  private optimizeScrolling() {
    let scrollTimeout: NodeJS.Timeout | null = null
    
    document.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      
      scrollTimeout = setTimeout(() => {
        // Force GPU acceleration for smooth scrolling
        document.body.style.transform = 'translateZ(0)'
        setTimeout(() => {
          document.body.style.transform = ''
        }, 100)
      }, 100)
    }, { passive: true })
  }

  private optimizeTransitions() {
    // Add CSS optimizations for file:// protocol
    const style = document.createElement('style')
    style.textContent = `
      /* Optimize for Electron rendering */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Force GPU acceleration for animations */
      .animate-in, .animate-out, [data-state="open"], [data-state="closed"] {
        transform: translateZ(0);
        will-change: transform, opacity;
      }
      
      /* Optimize scrollable areas */
      .overflow-auto, .overflow-y-auto, .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
        contain: layout style paint;
      }
      
      /* Reduce layout thrashing */
      .transition-all {
        transition-property: transform, opacity;
      }
    `
    document.head.appendChild(style)
  }

  private setupDOMBatching() {
    // Override common DOM manipulation methods to batch updates
    const originalSetAttribute = Element.prototype.setAttribute
    const pendingUpdates = new Map<Element, { [key: string]: string }>()

    Element.prototype.setAttribute = function(name: string, value: string) {
      if (!pendingUpdates.has(this)) {
        pendingUpdates.set(this, {})
      }
      pendingUpdates.get(this)![name] = value

      if (!this.rafCallbacks) {
        requestAnimationFrame(() => {
          const updates = pendingUpdates.get(this)
          if (updates) {
            Object.entries(updates).forEach(([attr, val]) => {
              originalSetAttribute.call(this, attr, val)
            })
            pendingUpdates.delete(this)
          }
        })
      }
    }
  }

  public scheduleUpdate(callback: () => void) {
    this.rafCallbacks.add(callback)
    
    if (!this.isFrameScheduled) {
      this.isFrameScheduled = true
      requestAnimationFrame(() => {
        this.rafCallbacks.forEach(cb => cb())
        this.rafCallbacks.clear()
        this.isFrameScheduled = false
      })
    }
  }
}

/**
 * Main desktop optimization controller
 */
class DesktopOptimizations {
  private storage: DesktopStorage
  private assets: AssetOptimizer
  private renderer: RenderOptimizer
  private initialized = false

  constructor() {
    this.storage = new DesktopStorage()
    this.assets = new AssetOptimizer()
    this.renderer = new RenderOptimizer()
  }

  public initialize() {
    if (this.initialized) return
    
    console.log('🖥️ Initializing desktop optimizations...')
    
    // Setup cleanup on app close
    window.addEventListener('beforeunload', () => {
      this.storage.forceFlush()
    })

    // Monitor performance
    this.setupPerformanceMonitoring()
    
    this.initialized = true
    console.log('✅ Desktop optimizations active')
  }

  private setupPerformanceMonitoring() {
    // Monitor frame drops
    let lastTime = performance.now()
    let frameCount = 0
    
    const checkPerformance = () => {
      const currentTime = performance.now()
      frameCount++
      
      if (currentTime - lastTime > 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime))
        if (fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${fps}fps`)
        }
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(checkPerformance)
    }
    
    requestAnimationFrame(checkPerformance)
  }

  public getPreloadedAudio(src: string): HTMLAudioElement | null {
    return this.assets.getPreloadedAudio(src)
  }

  public scheduleRenderUpdate(callback: () => void) {
    this.renderer.scheduleUpdate(callback)
  }
}

// Global instance
let desktopOptimizations: DesktopOptimizations | null = null

export const initializeDesktopOptimizations = (): DesktopOptimizations | null => {
  if (!isDesktopApp()) {
    console.log('🌐 Running in web mode - desktop optimizations skipped')
    return null
  }

  if (!desktopOptimizations) {
    desktopOptimizations = new DesktopOptimizations()
  }
  
  desktopOptimizations.initialize()
  return desktopOptimizations
}

export const getDesktopOptimizations = (): DesktopOptimizations | null => {
  return desktopOptimizations
}

export { DesktopOptimizations }
