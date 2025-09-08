import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe localStorage utilities to prevent corruption issues
export const safeLocalStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key)
      if (!item) return fallback
      
      const parsed = JSON.parse(item)
      
      // Validate the parsed data structure
      if (typeof parsed === 'object' && parsed !== null) {
        // Deep merge with fallback to ensure all expected properties exist
        return typeof fallback === 'object' && fallback !== null
          ? { ...fallback, ...parsed }
          : parsed
      }
      
      return fallback
    } catch (error) {
      console.warn(`Failed to parse localStorage key "${key}":`, error)
      localStorage.removeItem(key) // Remove corrupted data
      return fallback
    }
  },

  set(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value)
      
      // Check if the serialized string is too large (5MB limit for localStorage)
      if (serialized.length > 5 * 1024 * 1024) {
        console.warn(`localStorage key "${key}" exceeds size limit, not saving`)
        return
      }
      
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.warn(`Failed to save to localStorage key "${key}":`, error)
      
      // If quota exceeded, try to clear some space
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          localStorage.removeItem(key) // Remove this key if it existed
          console.warn('localStorage quota exceeded, cleared key:', key)
        } catch (clearError) {
          console.error('Failed to clear localStorage:', clearError)
        }
      }
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error)
    }
  }
}

// Array validation utility to prevent React error #185
export const validateArray = <T>(
  arr: unknown, 
  itemValidator?: (item: unknown) => item is T
): T[] => {
  if (!Array.isArray(arr)) {
    console.warn('validateArray: Expected array but got:', typeof arr)
    return []
  }
  
  if (!itemValidator) {
    // Basic validation - filter out null, undefined, and non-object values
    return arr.filter(item => {
      if (item === null || item === undefined) return false
      if (typeof item === 'object' && 'id' in item && item.id) return true
      return false
    }) as T[]
  }
  
  return arr.filter(itemValidator)
}

// Object validation utility
export const validateObject = <T extends Record<string, unknown>>(
  obj: unknown,
  requiredKeys: (keyof T)[]
): obj is T => {
  if (typeof obj !== 'object' || obj === null) return false
  
  return requiredKeys.every(key => key in obj)
}

// Safe array map that filters out invalid elements
export const safeMap = <T, R>(
  arr: T[],
  mapFn: (item: T, index: number) => R | null,
  validator?: (item: T) => boolean
): R[] => {
  const validArray = validator ? arr.filter(validator) : validateArray(arr)
  
  return validArray
    .map(mapFn)
    .filter((item): item is R => item !== null && item !== undefined)
}

// Debounce utility for performance optimization
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }) as T
}
