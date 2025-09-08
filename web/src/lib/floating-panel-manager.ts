/**
 * Floating Panel Position Manager
 * Fixes positioning issues and improves performance of floating components
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export type FloatingPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

interface FloatingPanelHook {
  position: FloatingPosition
  setPosition: (pos: FloatingPosition) => void
  style: React.CSSProperties
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

export const useFloatingPanel = (
  defaultPosition: FloatingPosition = 'bottom-right',
  zIndex: number = 50
): FloatingPanelHook => {
  const [position, setPosition] = useState<FloatingPosition>(defaultPosition)
  const [isVisible, setIsVisible] = useState(false)
  
  const style: React.CSSProperties = useCallback(() => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex,
      transform: 'translateZ(0)', // Force GPU layer
      willChange: isVisible ? 'transform' : 'auto',
      transition: 'all 0.2s ease-out',
    }

    const offset = 16 // Standard offset from edges

    switch (position) {
      case 'top-left':
        return {
          ...baseStyle,
          top: offset,
          left: offset,
        }
      case 'top-right':
        return {
          ...baseStyle,
          top: offset,
          right: offset,
        }
      case 'bottom-left':
        return {
          ...baseStyle,
          bottom: offset,
          left: offset,
        }
      case 'bottom-right':
        return {
          ...baseStyle,
          bottom: offset,
          right: offset,
        }
      case 'center':
        return {
          ...baseStyle,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateZ(0)',
        }
      default:
        return {
          ...baseStyle,
          bottom: offset,
          right: offset,
        }
    }
  }, [position, zIndex, isVisible])()

  return {
    position,
    setPosition,
    style,
    isVisible,
    setIsVisible
  }
}

// Optimized modal/dialog positioning
export const useOptimizedModal = (isOpen: boolean) => {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      setMounted(true)
    } else {
      document.body.style.overflow = 'unset'
      // Delay unmount for smooth animation
      const timeoutId = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(timeoutId)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    transform: 'translateZ(0)', // Force GPU layer
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease-out, visibility 0.2s ease-out'
  }

  const contentStyle: React.CSSProperties = {
    transform: isOpen ? 'scale(1) translateZ(0)' : 'scale(0.95) translateZ(0)',
    transition: 'transform 0.2s ease-out',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto'
  }

  return {
    mounted,
    containerRef,
    overlayStyle,
    contentStyle
  }
}

// Performance-aware component that only renders when in viewport
export const useViewportAware = (threshold = 0.1) => {
  const [isInViewport, setIsInViewport] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { isInViewport, elementRef }
}
