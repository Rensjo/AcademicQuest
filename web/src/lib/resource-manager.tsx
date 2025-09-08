/**
 * Application Resource Manager
 * Strategic resource allocation across components to prevent lag and improve performance
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'

interface ResourceState {
  activePages: Set<string>
  heavyComponents: Map<string, { priority: number; lastUsed: number }>
  renderBudget: number
  availableResources: number
}

interface ResourceManagerContextType {
  registerPage: (pageId: string) => void
  unregisterPage: (pageId: string) => void
  registerHeavyComponent: (componentId: string, priority: number) => void
  unregisterHeavyComponent: (componentId: string) => void
  shouldRenderHeavyComponent: (componentId: string) => boolean
  requestRender: (componentId: string) => Promise<void>
  getPerformanceMode: () => 'high' | 'medium' | 'low'
}

const ResourceManagerContext = createContext<ResourceManagerContextType | null>(null)

// Performance-aware render queue
class RenderQueue {
  private queue: Array<{ id: string; priority: number; resolve: () => void }> = []
  private processing = false
  private frameId: number | null = null

  enqueue(id: string, priority: number): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push({ id, priority, resolve })
      this.queue.sort((a, b) => b.priority - a.priority) // Higher priority first
      this.processQueue()
    })
  }

  private processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
    }

    this.frameId = requestAnimationFrame(() => {
      const startTime = performance.now()
      const maxFrameTime = 16.67 // ~60fps

      while (this.queue.length > 0 && (performance.now() - startTime) < maxFrameTime) {
        const item = this.queue.shift()
        if (item) {
          item.resolve()
        }
      }

      this.processing = false
      
      // Continue processing if there are more items
      if (this.queue.length > 0) {
        this.processQueue()
      }
    })
  }
}

export function ResourceManagerProvider({ children }: { children: ReactNode }) {
  const [resourceState, setResourceState] = useState<ResourceState>({
    activePages: new Set(),
    heavyComponents: new Map(),
    renderBudget: 60, // Target FPS
    availableResources: 100
  })

  const renderQueue = useRef(new RenderQueue())
  const performanceMetrics = useRef({ averageFPS: 60, memoryUsage: 0 })

  // Monitor performance and adjust resources
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount
        performanceMetrics.current.averageFPS = fps
        frameCount = 0
        lastTime = currentTime

        // Adjust available resources based on performance
        setResourceState(prev => ({
          ...prev,
          availableResources: fps >= 50 ? 100 : fps >= 30 ? 70 : 40
        }))
      }
      
      requestAnimationFrame(measurePerformance)
    }
    
    requestAnimationFrame(measurePerformance)
  }, [])

  const registerPage = useCallback((pageId: string) => {
    setResourceState(prev => ({
      ...prev,
      activePages: new Set(prev.activePages).add(pageId)
    }))
  }, [])

  const unregisterPage = useCallback((pageId: string) => {
    setResourceState(prev => {
      const newPages = new Set(prev.activePages)
      newPages.delete(pageId)
      return { ...prev, activePages: newPages }
    })
  }, [])

  const registerHeavyComponent = useCallback((componentId: string, priority: number) => {
    setResourceState(prev => {
      const newHeavyComponents = new Map(prev.heavyComponents)
      newHeavyComponents.set(componentId, { priority, lastUsed: Date.now() })
      return { ...prev, heavyComponents: newHeavyComponents }
    })
  }, [])

  const unregisterHeavyComponent = useCallback((componentId: string) => {
    setResourceState(prev => {
      const newHeavyComponents = new Map(prev.heavyComponents)
      newHeavyComponents.delete(componentId)
      return { ...prev, heavyComponents: newHeavyComponents }
    })
  }, [])

  const shouldRenderHeavyComponent = useCallback((componentId: string) => {
    const component = resourceState.heavyComponents.get(componentId)
    if (!component) return true

    const { priority } = component
    const { availableResources, activePages } = resourceState

    // Always render high priority components
    if (priority >= 9) return true

    // Limit rendering when resources are low
    if (availableResources < 50) {
      return priority >= 7
    }

    // Limit concurrent heavy components when multiple pages are active
    if (activePages.size > 1) {
      const activeHeavyComponents = Array.from(resourceState.heavyComponents.values())
        .filter(comp => comp.priority >= 5).length
      
      if (activeHeavyComponents > 3 && priority < 8) {
        return false
      }
    }

    return true
  }, [resourceState])

  const requestRender = useCallback((componentId: string): Promise<void> => {
    const component = resourceState.heavyComponents.get(componentId)
    const priority = component?.priority || 1
    
    return renderQueue.current.enqueue(componentId, priority)
  }, [resourceState])

  const getPerformanceMode = useCallback(() => {
    const fps = performanceMetrics.current.averageFPS
    if (fps >= 50) return 'high'
    if (fps >= 30) return 'medium'
    return 'low'
  }, [])

  const contextValue: ResourceManagerContextType = {
    registerPage,
    unregisterPage,
    registerHeavyComponent,
    unregisterHeavyComponent,
    shouldRenderHeavyComponent,
    requestRender,
    getPerformanceMode
  }

  return (
    <ResourceManagerContext.Provider value={contextValue}>
      {children}
    </ResourceManagerContext.Provider>
  )
}

export function useResourceManager() {
  const context = useContext(ResourceManagerContext)
  if (!context) {
    throw new Error('useResourceManager must be used within ResourceManagerProvider')
  }
  return context
}

// Hook for page-level resource management
export function usePageResource(pageId: string) {
  const { registerPage, unregisterPage, getPerformanceMode } = useResourceManager()

  useEffect(() => {
    registerPage(pageId)
    return () => unregisterPage(pageId)
  }, [pageId, registerPage, unregisterPage])

  return {
    performanceMode: getPerformanceMode()
  }
}

// Hook for heavy component management
export function useHeavyComponent(componentId: string, priority: number = 5) {
  const { 
    registerHeavyComponent, 
    unregisterHeavyComponent, 
    shouldRenderHeavyComponent,
    requestRender 
  } = useResourceManager()

  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    registerHeavyComponent(componentId, priority)
    return () => unregisterHeavyComponent(componentId)
  }, [componentId, priority, registerHeavyComponent, unregisterHeavyComponent])

  useEffect(() => {
    const checkRender = async () => {
      if (shouldRenderHeavyComponent(componentId)) {
        await requestRender(componentId)
        setCanRender(true)
      } else {
        setCanRender(false)
      }
    }

    checkRender()
  }, [componentId, shouldRenderHeavyComponent, requestRender])

  return canRender
}

// Hook for optimized form inputs with resource awareness
export function useOptimizedFormInput(
  initialValue: string,
  onValueChange: (value: string) => void,
  componentId: string
) {
  const [localValue, setLocalValue] = useState(initialValue)
  const { getPerformanceMode, requestRender } = useResourceManager()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleChange = useCallback(async (value: string) => {
    setLocalValue(value)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const performanceMode = getPerformanceMode()
    const debounceTime = performanceMode === 'high' ? 150 : performanceMode === 'medium' ? 300 : 500

    timeoutRef.current = setTimeout(async () => {
      await requestRender(`${componentId}-input`)
      onValueChange(value)
    }, debounceTime)
  }, [onValueChange, getPerformanceMode, requestRender, componentId])

  // Sync with external changes
  useEffect(() => {
    setLocalValue(initialValue)
  }, [initialValue])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    value: localValue,
    onChange: handleChange
  }
}
