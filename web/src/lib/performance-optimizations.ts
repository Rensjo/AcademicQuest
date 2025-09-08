import { useState, useCallback, useRef, useEffect } from 'react'
import { debounce } from '@/lib/utils'

export const useOptimizedInput = (
  initialValue: string,
  onValueChange: (value: string) => void,
  debounceMs: number = 300
) => {
  const [localValue, setLocalValue] = useState(initialValue)
  const lastCommittedValue = useRef(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced commit function
  const commitValue = useCallback((value: string) => {
    const debouncedFn = debounce((val: string) => {
      if (val !== lastCommittedValue.current) {
        onValueChange(val)
        lastCommittedValue.current = val
      }
    }, debounceMs)
    debouncedFn(value)
  }, [onValueChange, debounceMs])

  // Handle immediate local changes
  const handleChange = useCallback((value: string) => {
    setLocalValue(value)
    commitValue(value)
  }, [commitValue])

  // Sync with external changes
  useEffect(() => {
    if (initialValue !== lastCommittedValue.current) {
      setLocalValue(initialValue)
      lastCommittedValue.current = initialValue
    }
  }, [initialValue])

  // Cleanup on unmount
  useEffect(() => {
    const currentTimeout = timeoutRef.current
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
    }
  }, [])

  return {
    value: localValue,
    onChange: handleChange,
    commit: () => {
      // Force immediate commit
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      commitValue(localValue)
    }
  }
}

// Navigation performance optimization
export const useOptimizedNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const startNavigation = useCallback(() => {
    setIsNavigating(true)
    
    // Clear existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }
    
    // End navigation state after animation completes
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false)
    }, 300)
  }, [])

  const optimizedNavigate = useCallback((to: string) => {
    startNavigation()
    
    // Use requestAnimationFrame for smooth navigation
    requestAnimationFrame(() => {
      window.location.hash = to
    })
  }, [startNavigation])

  return {
    isNavigating,
    optimizedNavigate,
    startNavigation
  }
}

// Panel state management with performance optimization
export const useOptimizedPanelState = () => {
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set())
  const animationFrameRef = useRef<number | undefined>(undefined)

  const togglePanel = useCallback((panelId: string) => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setOpenPanels(prev => {
        const newSet = new Set(prev)
        if (newSet.has(panelId)) {
          newSet.delete(panelId)
        } else {
          newSet.add(panelId)
        }
        return newSet
      })
    })
  }, [])

  const openPanel = useCallback((panelId: string) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setOpenPanels(prev => new Set(prev).add(panelId))
    })
  }, [])

  const closePanel = useCallback((panelId: string) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setOpenPanels(prev => {
        const newSet = new Set(prev)
        newSet.delete(panelId)
        return newSet
      })
    })
  }, [])

  const closeAllPanels = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      setOpenPanels(new Set())
    })
  }, [])

  const isPanelOpen = useCallback((panelId: string) => {
    return openPanels.has(panelId)
  }, [openPanels])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    openPanels,
    togglePanel,
    openPanel,
    closePanel,
    closeAllPanels,
    isPanelOpen
  }
}

// Resource allocation strategy
export const useResourceAllocation = () => {
  const [activeComponents, setActiveComponents] = useState<Set<string>>(new Set())
  const [resourcePriority, setResourcePriority] = useState<Map<string, number>>(new Map())

  const registerComponent = useCallback((componentId: string, priority: number = 1) => {
    setActiveComponents(prev => new Set(prev).add(componentId))
    setResourcePriority(prev => new Map(prev).set(componentId, priority))
  }, [])

  const unregisterComponent = useCallback((componentId: string) => {
    setActiveComponents(prev => {
      const newSet = new Set(prev)
      newSet.delete(componentId)
      return newSet
    })
    setResourcePriority(prev => {
      const newMap = new Map(prev)
      newMap.delete(componentId)
      return newMap
    })
  }, [])

  const shouldRender = useCallback((componentId: string) => {
    const priority = resourcePriority.get(componentId) || 1
    const totalComponents = activeComponents.size
    
    // High priority components always render
    if (priority >= 3) return true
    
    // Limit concurrent heavy components
    if (totalComponents > 5 && priority < 2) return false
    
    return true
  }, [activeComponents, resourcePriority])

  return {
    registerComponent,
    unregisterComponent,
    shouldRender,
    activeComponents: activeComponents.size
  }
}
