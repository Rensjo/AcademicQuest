import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPerformanceMonitor } from '@/lib/performance-monitor'
import { isDesktopApp } from '@/lib/desktop-optimizations'

interface TestResult {
  name: string
  duration: number
  fps: number
  memory: number
  status: 'pass' | 'warning' | 'fail'
}

interface PerformanceMetrics {
  platform: 'web' | 'desktop'
  loadTime: number
  renderTime: number
  memoryUsage: number
  storageSize: number
  fps: number
  audioLoadTime: number
}

export default function PerformanceTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null)

  const monitor = getPerformanceMonitor()
  const platform = isDesktopApp() ? 'Desktop' : 'Web'

  useEffect(() => {
    const interval = setInterval(() => {
      if (monitor) {
        setCurrentMetrics(monitor.getMetrics())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [monitor])

  const runStressTest = useCallback(async (testName: string, duration: number, iterations: number) => {
    return new Promise<TestResult>((resolve) => {
      const startTime = performance.now()
      const performanceWithMemory = performance as typeof performance & { memory?: { usedJSHeapSize: number } }
      const startMemory = performanceWithMemory.memory?.usedJSHeapSize || 0
      let frameCount = 0
      
      const stressLoop = () => {
        // Simulate heavy DOM manipulation
        const elements = []
        for (let i = 0; i < iterations; i++) {
          const div = document.createElement('div')
          div.textContent = `Test element ${i}`
          div.style.transform = `translateX(${Math.random() * 100}px)`
          elements.push(div)
        }
        
        // Cleanup
        elements.forEach(el => el.remove())
        
        frameCount++
        const now = performance.now()
        
        if (now - startTime < duration) {
          requestAnimationFrame(stressLoop)
        } else {
          const endTime = performance.now()
          const endMemory = performanceWithMemory.memory?.usedJSHeapSize || 0
          const avgFps = frameCount / (duration / 1000)
          const memoryIncrease = (endMemory - startMemory) / 1024 / 1024
          
          const status: 'pass' | 'warning' | 'fail' = 
            avgFps >= 45 && memoryIncrease < 10 ? 'pass' :
            avgFps >= 30 || memoryIncrease < 20 ? 'warning' : 'fail'
          
          resolve({
            name: testName,
            duration: endTime - startTime,
            fps: avgFps,
            memory: memoryIncrease,
            status
          })
        }
      }
      
      requestAnimationFrame(stressLoop)
    })
  }, [])

  const runAllTests = useCallback(async () => {
    setIsRunning(true)
    setResults([])
    
    const tests = [
      { name: 'Light Load (100 elements)', duration: 2000, iterations: 100 },
      { name: 'Medium Load (500 elements)', duration: 3000, iterations: 500 },
      { name: 'Heavy Load (1000 elements)', duration: 5000, iterations: 1000 },
    ]
    
    for (const test of tests) {
      const result = await runStressTest(test.name, test.duration, test.iterations)
      setResults(prev => [...prev, result])
    }
    
    setIsRunning(false)
  }, [runStressTest])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'fail': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Testing</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {platform} Platform
        </Badge>
      </div>

      {/* Current Metrics */}
      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Live Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentMetrics.fps || 0}
                </div>
                <div className="text-sm text-gray-600">FPS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(currentMetrics.memoryUsage / 1024 / 1024).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Memory (MB)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(currentMetrics.storageSize / 1024).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Storage (KB)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentMetrics.loadTime?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-gray-600">Load Time (ms)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Stress Tests
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="ml-4"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 && !isRunning && (
            <div className="text-center py-8 text-gray-500">
              Click "Run All Tests" to start performance testing
            </div>
          )}
          
          {isRunning && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Running performance tests...</p>
            </div>
          )}
          
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{result.name}</h3>
                <Badge className={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-mono">{result.duration.toFixed(0)}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg FPS:</span>
                  <span className="ml-2 font-mono">{result.fps.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Memory Δ:</span>
                  <span className="ml-2 font-mono">{result.memory.toFixed(1)}MB</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span><strong>Good:</strong> FPS ≥ 45, Memory increase &lt; 10MB</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span><strong>Acceptable:</strong> FPS ≥ 30, Memory increase &lt; 20MB</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span><strong>Poor:</strong> FPS &lt; 30, Memory increase ≥ 20MB</span>
            </div>
          </div>
          
          {platform === 'Desktop' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Desktop Optimizations Active:</strong> Batched localStorage, 
                audio preloading, GPU acceleration, and DOM optimization are enabled.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
