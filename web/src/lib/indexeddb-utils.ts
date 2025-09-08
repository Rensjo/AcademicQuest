/**
 * IndexedDB utilities for efficient large data storage
 * Production optimization: Avoid localStorage blocking on large datasets
 */

interface DBConfig {
  name: string
  version: number
  stores: Array<{
    name: string
    keyPath?: string
    autoIncrement?: boolean
    indexes?: Array<{
      name: string
      keyPath: string | string[]
      unique?: boolean
    }>
  }>
}

class IndexedDBManager {
  private db: IDBDatabase | null = null
  private config: DBConfig

  constructor(config: DBConfig) {
    this.config = config
  }

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version)

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create stores and indexes
        this.config.stores.forEach(storeConfig => {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.autoIncrement
            })

            // Create indexes
            storeConfig.indexes?.forEach(indexConfig => {
              store.createIndex(indexConfig.name, indexConfig.keyPath, {
                unique: indexConfig.unique || false
              })
            })
          }
        })
      }
    })
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async set<T>(storeName: string, data: T, key?: IDBValidKey): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = key ? store.put(data, key) : store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async count(storeName: string): Promise<number> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Chunked operations for large datasets
  async setChunked<T>(storeName: string, items: T[], chunkSize = 100): Promise<void> {
    const db = await this.init()
    
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize)
      
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        
        chunk.forEach(item => {
          store.put(item)
        })
        
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
      
      // Allow other operations to run between chunks
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
}

// AcademicQuest specific database configuration
const AQ_DB_CONFIG: DBConfig = {
  name: 'AcademicQuestDB',
  version: 1,
  stores: [
    {
      name: 'tasks',
      keyPath: 'id',
      indexes: [
        { name: 'status', keyPath: 'status' },
        { name: 'courseId', keyPath: 'courseId' },
        { name: 'dueDate', keyPath: 'dueDate' },
        { name: 'termId', keyPath: 'termId' }
      ]
    },
    {
      name: 'courses',
      keyPath: 'id',
      indexes: [
        { name: 'termId', keyPath: 'termId' },
        { name: 'name', keyPath: 'name' }
      ]
    },
    {
      name: 'schedules',
      keyPath: 'id',
      indexes: [
        { name: 'date', keyPath: 'date' },
        { name: 'courseId', keyPath: 'courseId' }
      ]
    },
    {
      name: 'performance-cache',
      keyPath: 'key'
    }
  ]
}

// Singleton instance for the app
export const aqDB = new IndexedDBManager(AQ_DB_CONFIG)

// Utility functions for common operations
export const idbUtils = {
  async migrateFromLocalStorage(key: string, storeName: string): Promise<void> {
    try {
      const localData = localStorage.getItem(key)
      if (localData) {
        const parsed = JSON.parse(localData)
        await aqDB.set(storeName, parsed, key)
        
        // Remove from localStorage after successful migration
        localStorage.removeItem(key)
        console.log(`✅ Migrated ${key} from localStorage to IndexedDB`)
      }
    } catch (error) {
      console.warn(`Failed to migrate ${key} from localStorage:`, error)
    }
  },

  async getWithFallback<T>(storeName: string, key: string, fallbackValue: T): Promise<T> {
    try {
      const result = await aqDB.get<T>(storeName, key)
      return result !== undefined ? result : fallbackValue
    } catch (error) {
      console.warn(`IndexedDB read failed for ${key}, using fallback:`, error)
      return fallbackValue
    }
  },

  async setWithRetry<T>(storeName: string, data: T, key: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await aqDB.set(storeName, data, key)
        return
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
      }
    }
  }
}

export default aqDB
