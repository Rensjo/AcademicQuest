/**
 * Performance monitoring and optimization utilities
 * Implements production-grade performance best practices
 */

interface PerformanceMetrics {
  platform: 'web' | 'desktop';
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  storageSize: number;
  fps: number;
  audioLoadTime: number;
  cores: number;
  deviceMemory: number;
}

interface FrameMetrics {
  fps: number
  memory: number
  timing: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private startTime: number
  private frameCount = 0
  private lastFrameTime = 0
  private lastTime = performance.now()
  private fps = 0
  private callbacks: Array<(metrics: FrameMetrics) => void> = []
  private scrollMetrics: Array<{ velocity: number; deltaTime: number; deltaY: number; timestamp: number; isFastScroll: boolean }> = []
  private isMonitoring = false
  private animationFrame?: number

  constructor() {
    this.startTime = performance.now()
    const navWithMem = navigator as Navigator & { deviceMemory?: number }
    this.metrics = {
      platform: this.detectPlatform(),
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      storageSize: 0,
      fps: 0,
      audioLoadTime: 0,
      cores: navigator.hardwareConcurrency || 4,
      deviceMemory: navWithMem.deviceMemory || 8
    }
    
    this.startMonitoring()
  }

  trackScrollPerformance(scrollData: { 
    velocity: number; 
    deltaTime: number; 
    deltaY: number; 
    isFastScroll: boolean 
  }) {
    this.scrollMetrics.push({
      ...scrollData,
      timestamp: performance.now()
    })
    
    // Keep only last 100 scroll events to prevent memory bloat
    if (this.scrollMetrics.length > 100) {
      this.scrollMetrics = this.scrollMetrics.slice(-100)
    }
    
    // Log performance warning if scroll velocity is extremely high
    if (scrollData.velocity > 5) {
      this.logWarning(`Very fast scrolling detected: ${scrollData.velocity.toFixed(2)} px/ms`)
    }
  }

  logWarning(message: string) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance Monitor] ${message}`)
    }
  }

  addCallback(callback: (metrics: FrameMetrics) => void) {
    this.callbacks.push(callback)
  }

  removeCallback(callback: (metrics: FrameMetrics) => void) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  start() {
    if (this.isMonitoring) return
    this.isMonitoring = true
    this.monitorFrames()
  }

  stop() {
    this.isMonitoring = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }

  private monitorFrames() {
    if (!this.isMonitoring) return

    const now = performance.now()
    this.frameCount++

    // Calculate FPS every second
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now

      // Get memory info if available
      const performanceWithMemory = performance as typeof performance & { 
        memory?: { usedJSHeapSize: number } 
      }
      const memory = performanceWithMemory.memory?.usedJSHeapSize || 0

      const frameMetrics: FrameMetrics = {
        fps: this.fps,
        memory: memory / 1024 / 1024, // Convert to MB
        timing: now
      }

      // Notify callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(frameMetrics)
        } catch (error) {
          console.warn('Performance callback error:', error)
        }
      })

      // Log warning if performance is poor
      if (this.fps < 20 && this.fps > 0) {
        console.warn(`[perf] Low FPS detected: ${this.fps}fps`)
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.monitorFrames())
  }

  onMetrics(callback: (metrics: FrameMetrics) => void) {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  getCurrentFPS() {
    return this.fps
  }

  private detectPlatform(): 'web' | 'desktop' {
    return window.navigator.userAgent.toLowerCase().includes('electron') ? 'desktop' : 'web'
  }

  private startMonitoring() {
    // Monitor page load
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now() - this.startTime
      console.log(`📊 Page Load Time: ${this.metrics.loadTime.toFixed(2)}ms`)
    })

    // Monitor DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.renderTime = performance.now() - this.startTime
      console.log(`📊 DOM Ready Time: ${this.metrics.renderTime.toFixed(2)}ms`)
    })

    // Start frame monitoring
    this.start()

    // Monitor storage usage
    this.monitorStorage()

    // Monitor memory usage (if available)
    this.monitorMemory()

    // Monitor audio loading
    this.monitorAudioLoading()
  }

  private monitorFPS() {
    const measureFPS = () => {
      const now = performance.now()
      this.frameCount++
      
      if (now - this.lastFrameTime >= 1000) {
        this.metrics.fps = this.frameCount
        this.frameCount = 0
        this.lastFrameTime = now
        
        if (this.metrics.fps < 30) {
          console.warn(`⚠️ Low FPS detected: ${this.metrics.fps}fps`)
        }
      }
      
      requestAnimationFrame(measureFPS)
    }
    
    requestAnimationFrame(measureFPS)
  }

  private monitorStorage() {
    try {
      let totalSize = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += new Blob([value]).size
          }
        }
      }
      this.metrics.storageSize = totalSize
      console.log(`📊 Storage Size: ${(totalSize / 1024).toFixed(2)} KB`)
    } catch (error) {
      console.warn('Failed to monitor storage:', error)
    }
  }

  private monitorMemory() {
    if ('memory' in performance) {
      const memory = (performance as typeof performance & { memory: { usedJSHeapSize: number, totalJSHeapSize: number, jsHeapSizeLimit: number } }).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize
      console.log(`📊 Memory Usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
    }
  }

  private monitorAudioLoading() {
    const audioStartTime = performance.now()
    const testAudio = new Audio('./sounds/hover-button-sound.mp3')
    
    testAudio.addEventListener('canplaythrough', () => {
      this.metrics.audioLoadTime = performance.now() - audioStartTime
      console.log(`📊 Audio Load Time: ${this.metrics.audioLoadTime.toFixed(2)}ms`)
    }, { once: true })

    testAudio.addEventListener('error', () => {
      console.warn('⚠️ Failed to load test audio')
    }, { once: true })

    testAudio.load()
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public logPerformanceReport() {
    const avgScrollVelocity = this.scrollMetrics.length > 0 
      ? this.scrollMetrics.reduce((sum, metric) => sum + metric.velocity, 0) / this.scrollMetrics.length
      : 0
    
    const fastScrollCount = this.scrollMetrics.filter(m => m.isFastScroll).length
    
    console.group(`📊 Performance Report - ${this.metrics.platform.toUpperCase()}`)
    console.log(`Platform: ${this.metrics.platform}`)
    console.log(`Load Time: ${this.metrics.loadTime.toFixed(2)}ms`)
    console.log(`Render Time: ${this.metrics.renderTime.toFixed(2)}ms`)
    console.log(`Current FPS: ${this.metrics.fps}`)
    console.log(`Memory Usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
    console.log(`Storage Size: ${(this.metrics.storageSize / 1024).toFixed(2)}KB`)
    console.log(`Audio Load Time: ${this.metrics.audioLoadTime.toFixed(2)}ms`)
    console.log(`Hardware Cores: ${this.metrics.cores}`)
    console.log(`Device Memory: ${this.metrics.deviceMemory}GB`)
    if (this.scrollMetrics.length > 0) {
      console.log(`Average Scroll Velocity: ${avgScrollVelocity.toFixed(2)} px/ms`)
      console.log(`Fast Scroll Events: ${fastScrollCount}/${this.scrollMetrics.length}`)
    }
    console.groupEnd()
  }

  public compareWithBaseline(baseline: PerformanceMetrics) {
    console.group('📈 Performance Comparison')
    console.log(`Load Time: ${this.metrics.loadTime.toFixed(2)}ms vs ${baseline.loadTime.toFixed(2)}ms (${this.metrics.loadTime < baseline.loadTime ? '✅ Better' : '⚠️ Slower'})`)
    console.log(`FPS: ${this.metrics.fps} vs ${baseline.fps} (${this.metrics.fps >= baseline.fps ? '✅ Better' : '⚠️ Worse'})`)
    console.log(`Memory: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB vs ${(baseline.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
    console.log(`Storage: ${(this.metrics.storageSize / 1024).toFixed(2)}KB vs ${(baseline.storageSize / 1024).toFixed(2)}KB`)
    console.groupEnd()
  }
}

// Global performance monitor
let performanceMonitor: PerformanceMonitor | null = null

export const initPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
    
    // Log report after 5 seconds
    setTimeout(() => {
      performanceMonitor?.logPerformanceReport()
    }, 5000)
  }
  
  return performanceMonitor
}

export const getPerformanceMonitor = (): PerformanceMonitor | null => {
  return performanceMonitor
}

// Auto-initialize if in development
if (process.env.NODE_ENV === 'development') {
  initPerformanceMonitor()
}
