/**
 * Storage cleanup utilities for managing localStorage usage and preventing memory bloat
 */

import { safeLocalStorage } from './utils';

interface StorageAnalysis {
  totalKeys: number;
  totalSize: number;
  largestKeys: Array<{ key: string; size: number }>;
  duplicateKeys: string[];
  corruptedKeys: string[];
}

/**
 * Analyze current localStorage usage
 */
export function analyzeStorage(): StorageAnalysis {
  const analysis: StorageAnalysis = {
    totalKeys: 0,
    totalSize: 0,
    largestKeys: [],
    duplicateKeys: [],
    corruptedKeys: []
  };

  try {
    const keyData: Array<{ key: string; size: number }> = [];
    const seenData = new Map<string, string[]>();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const value = localStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          keyData.push({ key, size });
          analysis.totalSize += size;

          // Check for duplicate data
          if (seenData.has(value)) {
            seenData.get(value)!.push(key);
          } else {
            seenData.set(value, [key]);
          }

          // Try to parse as JSON to detect corruption
          try {
            JSON.parse(value);
          } catch {
            analysis.corruptedKeys.push(key);
          }
        }
      } catch (error) {
        console.warn(`Error reading localStorage key: ${key}`, error);
        analysis.corruptedKeys.push(key);
      }
    }

    analysis.totalKeys = keyData.length;
    analysis.largestKeys = keyData
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Find duplicate data
    for (const [, keys] of seenData) {
      if (keys.length > 1) {
        analysis.duplicateKeys.push(...keys.slice(1));
      }
    }

  } catch (error) {
    console.error('Error analyzing storage:', error);
  }

  return analysis;
}

/**
 * Clean up old and unnecessary data
 */
export function cleanupStorage(options: {
  maxSizeBytes?: number;
  maxAge?: number; // in days
  removeDuplicates?: boolean;
  removeCorrupted?: boolean;
} = {}): { removedKeys: string[]; freedBytes: number } {
  const {
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
    maxAge = 30, // 30 days default
    removeDuplicates = true,
    removeCorrupted = true
  } = options;

  const result = { removedKeys: [] as string[], freedBytes: 0 };
  const analysis = analyzeStorage();

  try {
    // Remove corrupted data
    if (removeCorrupted) {
      for (const key of analysis.corruptedKeys) {
        const size = localStorage.getItem(key)?.length || 0;
        safeLocalStorage.remove(key);
        result.removedKeys.push(key);
        result.freedBytes += size;
      }
    }

    // Remove duplicates
    if (removeDuplicates) {
      for (const key of analysis.duplicateKeys) {
        const size = localStorage.getItem(key)?.length || 0;
        safeLocalStorage.remove(key);
        result.removedKeys.push(key);
        result.freedBytes += size;
      }
    }

    // Remove old data based on timestamps
    const cutoffTime = Date.now() - (maxAge * 24 * 60 * 60 * 1000);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const value = localStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value);
          
          // Check if data has timestamp and is old
          if (data.timestamp && data.timestamp < cutoffTime) {
            const size = value.length;
            safeLocalStorage.remove(key);
            result.removedKeys.push(key);
            result.freedBytes += size;
          }
          
          // Check for Zustand store data that might be stale
          if (key.startsWith('academic-quest-') && data.state) {
            const state = data.state;
            // Clean up empty arrays and unused data
            if (Array.isArray(state.tasks) && state.tasks.length === 0) {
              // Don't remove empty arrays, just clean them
              continue;
            }
          }
        }
      } catch {
        // Already handled corrupted data above
        continue;
      }
    }

    // If still over size limit, remove largest non-essential items
    if (analysis.totalSize > maxSizeBytes) {
      for (const { key, size } of analysis.largestKeys) {
        if (analysis.totalSize - result.freedBytes <= maxSizeBytes) break;
        
        // Don't remove essential app data
        if (key.includes('academic-quest-settings') || 
            key.includes('academic-quest-academic-plan')) {
          continue;
        }

        safeLocalStorage.remove(key);
        result.removedKeys.push(key);
        result.freedBytes += size;
      }
    }

  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }

  return result;
}

/**
 * Optimize Zustand store data
 */
export function optimizeStoreData(): { optimizedStores: string[]; savedBytes: number } {
  const result = { optimizedStores: [] as string[], savedBytes: 0 };

  try {
    // Find all Zustand store keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('academic-quest-')) continue;

      try {
        const value = localStorage.getItem(key);
        if (!value) continue;

        const originalSize = value.length;
        const data = JSON.parse(value);

        if (data.state) {
          let optimized = false;
          const state = { ...data.state };

          // Clean up task data
          if (Array.isArray(state.tasks)) {
            const before = state.tasks.length;
            state.tasks = state.tasks.filter((task: {
              id?: string;
              title?: string;
              courseId?: string;
            }) => 
              task && 
              typeof task === 'object' && 
              task.id && 
              (task.title?.trim() || task.courseId)
            );
            if (state.tasks.length !== before) optimized = true;
          }

          // Clean up course data
          if (Array.isArray(state.courses)) {
            const before = state.courses.length;
            state.courses = state.courses.filter((course: {
              id?: string;
              code?: string;
              name?: string;
            }) => 
              course && 
              typeof course === 'object' && 
              course.id && 
              (course.code?.trim() || course.name?.trim())
            );
            if (state.courses.length !== before) optimized = true;
          }

          // Remove undefined/null values
          const cleanState = JSON.parse(JSON.stringify(state, (key, value) => 
            value === undefined ? null : value
          ));

          if (optimized) {
            const optimizedData = { ...data, state: cleanState };
            const newValue = JSON.stringify(optimizedData);
            const newSize = newValue.length;

            safeLocalStorage.set(key, optimizedData);
            result.optimizedStores.push(key);
            result.savedBytes += (originalSize - newSize);
          }
        }
      } catch (error) {
        console.warn(`Error optimizing store ${key}:`, error);
      }
    }
  } catch (error) {
    console.error('Error optimizing store data:', error);
  }

  return result;
}

/**
 * Set up automatic cleanup on app start
 */
export function setupAutomaticCleanup(): void {
  try {
    // Run cleanup on app start
    const analysis = analyzeStorage();
    
    console.log('Storage Analysis:', {
      totalKeys: analysis.totalKeys,
      totalSizeMB: (analysis.totalSize / (1024 * 1024)).toFixed(2),
      corruptedKeys: analysis.corruptedKeys.length,
      duplicateKeys: analysis.duplicateKeys.length
    });

    // Clean up if storage is over 3MB or has issues
    if (analysis.totalSize > 3 * 1024 * 1024 || 
        analysis.corruptedKeys.length > 0 || 
        analysis.duplicateKeys.length > 0) {
      
      const cleanup = cleanupStorage({
        maxSizeBytes: 3 * 1024 * 1024,
        maxAge: 14,
        removeDuplicates: true,
        removeCorrupted: true
      });

      const optimize = optimizeStoreData();

      console.log('Storage cleanup completed:', {
        removedKeys: cleanup.removedKeys.length,
        freedMB: (cleanup.freedBytes / (1024 * 1024)).toFixed(2),
        optimizedStores: optimize.optimizedStores.length,
        savedMB: (optimize.savedBytes / (1024 * 1024)).toFixed(2)
      });
    }

    // Setup desktop-specific optimizations if running in Electron
    setupDesktopStorage()

    // Set up periodic cleanup (every 6 hours)
    setInterval(() => {
      const analysis = analyzeStorage();
      if (analysis.totalSize > 4 * 1024 * 1024) {
        cleanupStorage({ maxSizeBytes: 3 * 1024 * 1024 });
        optimizeStoreData();
      }
    }, 6 * 60 * 60 * 1000);

  } catch (error) {
    console.error('Error setting up automatic cleanup:', error);
  }
}

/**
 * Set up desktop-specific storage optimizations
 */
export function setupDesktopStorage(): void {
  const isDesktop = window.navigator.userAgent.toLowerCase().includes('electron') &&
                   window.location.protocol === 'file:'
  
  if (!isDesktop) return

  try {
    console.log('🖥️ Setting up desktop storage optimizations...')
    
    const desktopCleanup = () => {
      const analysis = analyzeStorage()
      
      console.log('Desktop Storage Analysis:', {
        totalKeys: analysis.totalKeys,
        totalSizeMB: (analysis.totalSize / (1024 * 1024)).toFixed(2),
        userDataPath: 'Electron userData directory'
      })

      // More aggressive limits for desktop (userData directory can be slower)
      if (analysis.totalSize > 2 * 1024 * 1024) { // 2MB limit for desktop
        const cleanup = cleanupStorage({
          maxSizeBytes: 1.5 * 1024 * 1024, // 1.5MB max
          maxAge: 7, // 7 days for desktop
          removeDuplicates: true,
          removeCorrupted: true
        })

        const optimize = optimizeStoreData()

        console.log('Desktop storage cleanup completed:', {
          removedKeys: cleanup.removedKeys.length,
          freedMB: (cleanup.freedBytes / (1024 * 1024)).toFixed(2),
          optimizedStores: optimize.optimizedStores.length,
          savedMB: (optimize.savedBytes / (1024 * 1024)).toFixed(2)
        })
      }
    }

    // Run cleanup after app fully loads
    setTimeout(desktopCleanup, 3000)

    // More frequent cleanup for desktop (every 2 hours instead of 6)
    setInterval(desktopCleanup, 2 * 60 * 60 * 1000)

    // Cleanup on app close (critical for desktop apps)
    window.addEventListener('beforeunload', () => {
      console.log('🖥️ Running cleanup on app close...')
      desktopCleanup()
    })

    // Also cleanup on visibility change (when minimizing/restoring)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App is being hidden, run a quick cleanup
        const analysis = analyzeStorage()
        if (analysis.totalSize > 3 * 1024 * 1024) {
          desktopCleanup()
        }
      }
    })

    console.log('✅ Desktop storage optimizations active')

  } catch (error) {
    console.error('Error setting up desktop storage:', error)
  }
}
