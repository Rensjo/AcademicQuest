/**
 * Chunked IPC utilities for Electron apps
 * Production optimization: Prevent main thread blocking on large JSON payloads
 */

interface ChunkHeader {
  id: string
  total: number
  index: number
  size: number
}

interface ChunkedMessage {
  header: ChunkHeader
  data: string
  isComplete: boolean
}

interface PendingTransfer {
  chunks: string[]
  received: number
  total: number
  startTime: number
}

class ChunkedIPC {
  private pendingTransfers = new Map<string, PendingTransfer>()
  private maxChunkSize: number
  private timeout: number

  constructor(maxChunkSize = 64 * 1024, timeout = 30000) { // 64KB chunks, 30s timeout
    this.maxChunkSize = maxChunkSize
    this.timeout = timeout
    
    // Clean up expired transfers every minute
    setInterval(() => this.cleanupExpiredTransfers(), 60000)
  }

  // Split large data into chunks
  createChunks<T>(data: T, transferId?: string): ChunkedMessage[] {
    const id = transferId || this.generateId()
    const serialized = JSON.stringify(data)
    const chunks: ChunkedMessage[] = []
    const totalChunks = Math.ceil(serialized.length / this.maxChunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.maxChunkSize
      const end = Math.min(start + this.maxChunkSize, serialized.length)
      const chunkData = serialized.slice(start, end)

      chunks.push({
        header: {
          id,
          total: totalChunks,
          index: i,
          size: chunkData.length
        },
        data: chunkData,
        isComplete: i === totalChunks - 1
      })
    }

    return chunks
  }

  // Process incoming chunk and return complete data if all chunks received
  processChunk<T>(chunk: ChunkedMessage): { isComplete: boolean; data?: T; progress: number } {
    const { id, total, index } = chunk.header
    
    if (!this.pendingTransfers.has(id)) {
      this.pendingTransfers.set(id, {
        chunks: new Array(total),
        received: 0,
        total,
        startTime: Date.now()
      })
    }

    const transfer = this.pendingTransfers.get(id)!
    
    // Store chunk at correct index
    if (!transfer.chunks[index]) {
      transfer.chunks[index] = chunk.data
      transfer.received++
    }

    const progress = (transfer.received / transfer.total) * 100

    // Check if all chunks received
    if (transfer.received === transfer.total) {
      try {
        const completeData = transfer.chunks.join('')
        const parsed = JSON.parse(completeData)
        
        // Cleanup
        this.pendingTransfers.delete(id)
        
        return { isComplete: true, data: parsed, progress: 100 }
      } catch (error) {
        console.error('Failed to parse chunked data:', error)
        this.pendingTransfers.delete(id)
        return { isComplete: false, progress }
      }
    }

    return { isComplete: false, progress }
  }

  // Send chunked data via IPC (browser context)
  async sendChunked<T>(channel: string, data: T): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const chunks = this.createChunks(data)
      
      for (const chunk of chunks) {
        const api = window.electronAPI as unknown as { send?: (channel: string, data: unknown) => Promise<void> }
        await api.send?.(`${channel}-chunk`, chunk)
        
        // Small delay between chunks to prevent overwhelming
        if (chunks.length > 10) {
          await new Promise(resolve => setTimeout(resolve, 1))
        }
      }
    }
  }

  // Receive chunked data via IPC (browser context)
  onChunkedReceive<T>(channel: string, callback: (data: T) => void): () => void {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const handler = (chunk: ChunkedMessage) => {
        const result = this.processChunk<T>(chunk)
        
        if (result.isComplete && result.data) {
          callback(result.data)
        }
      }

      const api = window.electronAPI as unknown as { on?: (channel: string, callback: (data: unknown) => void) => void }
      api.on?.(`${channel}-chunk`, handler)
      
      // Return cleanup function
      return () => {
        const apiCleanup = window.electronAPI as unknown as { removeListener?: (channel: string, callback: (data: unknown) => void) => void }
        apiCleanup.removeListener?.(`${channel}-chunk`, handler)
      }
    }
    
    return () => {} // No-op if not in Electron
  }

  // Get transfer progress
  getProgress(transferId: string): number {
    const transfer = this.pendingTransfers.get(transferId)
    return transfer ? (transfer.received / transfer.total) * 100 : 0
  }

  // Cancel transfer
  cancelTransfer(transferId: string): void {
    this.pendingTransfers.delete(transferId)
  }

  // Get pending transfer count
  getPendingCount(): number {
    return this.pendingTransfers.size
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  private cleanupExpiredTransfers(): void {
    const now = Date.now()
    
    for (const [id, transfer] of this.pendingTransfers.entries()) {
      if (now - transfer.startTime > this.timeout) {
        console.warn(`Cleaning up expired transfer: ${id}`)
        this.pendingTransfers.delete(id)
      }
    }
  }
}

// Singleton instance
export const chunkedIPC = new ChunkedIPC()

// Utility functions for common patterns
export const ipcUtils = {
  // Send large state data safely
  async sendLargeState<T>(channel: string, state: T): Promise<void> {
    const stateSize = JSON.stringify(state).length
    
    if (stateSize > 32 * 1024) { // 32KB threshold
      console.log(`📦 Sending large state (${(stateSize / 1024).toFixed(1)}KB) via chunked IPC`)
      await chunkedIPC.sendChunked(channel, state)
    } else {
      // Send normally for small data
      if (typeof window !== 'undefined' && window.electronAPI) {
        const api = window.electronAPI as unknown as { send?: (channel: string, data: unknown) => Promise<void> }
        await api.send?.(channel, state)
      }
    }
  },

  // Receive with automatic chunked handling
  onReceiveLarge<T>(channel: string, callback: (data: T) => void): () => void {
    const cleanupChunked = chunkedIPC.onChunkedReceive(channel, callback)
    
    // Also listen for regular messages
    let cleanupRegular = () => {}
    if (typeof window !== 'undefined' && window.electronAPI) {
      const regularHandler = (data: unknown) => callback(data as T)
      const api = window.electronAPI as unknown as { on?: (channel: string, callback: (data: unknown) => void) => void }
      api.on?.(channel, regularHandler)
      
      cleanupRegular = () => {
        const apiCleanup = window.electronAPI as unknown as { removeListener?: (channel: string, callback: (data: unknown) => void) => void }
        apiCleanup.removeListener?.(channel, regularHandler)
      }
    }

    // Return combined cleanup
    return () => {
      cleanupChunked()
      cleanupRegular()
    }
  },

  // Check if data should be chunked
  shouldChunk<T>(data: T): boolean {
    return JSON.stringify(data).length > 32 * 1024
  },

  // Get estimated transfer time
  estimateTransferTime<T>(data: T): number {
    const size = JSON.stringify(data).length
    const chunks = Math.ceil(size / (64 * 1024))
    return chunks * 2 // ~2ms per chunk estimate
  }
}

// Type augmentation for ElectronAPI to include IPC methods
declare global {
  interface ElectronAPI {
    send?: (channel: string, data: unknown) => Promise<void>
    on?: (channel: string, callback: (data: unknown) => void) => void
    removeListener?: (channel: string, callback: (data: unknown) => void) => void
  }
}

export default chunkedIPC
