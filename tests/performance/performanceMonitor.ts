// Performance monitoring utilities for testing and production
import { TEST_CONSTANTS } from '../testConfig';

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number;
  realTimeUpdate: number;
  bundleSize: number;
  memoryUsage: number;
  timestamp: number;
}

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;
  
  constructor() {
    this.startTime = performance.now();
  }
  
  // Measure initial load time
  measureLoadTime(): number {
    const loadTime = performance.now() - this.startTime;
    this.recordMetric('loadTime', loadTime);
    return loadTime;
  }
  
  // Measure real-time update performance
  measureRealTimeUpdate<T>(fn: () => T): { result: T; executionTime: number } {
    const start = performance.now();
    const result = fn();
    const executionTime = performance.now() - start;
    
    this.recordMetric('realTimeUpdate', executionTime);
    return { result, executionTime };
  }
  
  // Measure async real-time update performance
  async measureRealTimeUpdateAsync<T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const start = performance.now();
    const result = await fn();
    const executionTime = performance.now() - start;
    
    this.recordMetric('realTimeUpdate', executionTime);
    return { result, executionTime };
  }
  
  // Measure memory usage
  measureMemoryUsage(): number {
    let memoryUsage = 0;
    
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    
    this.recordMetric('memoryUsage', memoryUsage);
    return memoryUsage;
  }
  
  // Measure bundle size (mock implementation)
  measureBundleSize(): number {
    // In a real implementation, this would analyze the actual bundle
    const mockBundleSize = 450; // KB
    this.recordMetric('bundleSize', mockBundleSize);
    return mockBundleSize;
  }
  
  // Record a performance metric
  private recordMetric(type: keyof Omit<PerformanceMetrics, 'timestamp'>, value: number): void {
    const metric: PerformanceMetrics = {
      loadTime: 0,
      realTimeUpdate: 0,
      bundleSize: 0,
      memoryUsage: 0,
      timestamp: Date.now(),
      [type]: value,
    };
    
    this.metrics.push(metric);
  }
  
  // Get all recorded metrics
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
  
  // Get latest metric of a specific type
  getLatestMetric(type: keyof Omit<PerformanceMetrics, 'timestamp'>): number | null {
    const latestMetric = this.metrics
      .filter(metric => metric[type] > 0)
      .pop();
    
    return latestMetric ? latestMetric[type] : null;
  }
  
  // Check if performance meets thresholds
  checkPerformanceThresholds(): {
    loadTime: { passed: boolean; value: number; threshold: number };
    realTimeUpdate: { passed: boolean; value: number; threshold: number };
    bundleSize: { passed: boolean; value: number; threshold: number };
    memoryUsage: { passed: boolean; value: number; threshold: number };
  } {
    const loadTime = this.getLatestMetric('loadTime') || 0;
    const realTimeUpdate = this.getLatestMetric('realTimeUpdate') || 0;
    const bundleSize = this.getLatestMetric('bundleSize') || 0;
    const memoryUsage = this.getLatestMetric('memoryUsage') || 0;
    
    return {
      loadTime: {
        passed: loadTime <= TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.INITIAL_LOAD_TIME,
        value: loadTime,
        threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.INITIAL_LOAD_TIME,
      },
      realTimeUpdate: {
        passed: realTimeUpdate <= TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.REAL_TIME_UPDATE,
        value: realTimeUpdate,
        threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.REAL_TIME_UPDATE,
      },
      bundleSize: {
        passed: bundleSize <= TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.BUNDLE_SIZE,
        value: bundleSize,
        threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.BUNDLE_SIZE,
      },
      memoryUsage: {
        passed: memoryUsage <= TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
        value: memoryUsage,
        threshold: TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
      },
    };
  }
  
  // Generate performance report
  generateReport(): string {
    const thresholds = this.checkPerformanceThresholds();
    const report = [
      '=== Performance Report ===',
      `Load Time: ${thresholds.loadTime.value.toFixed(2)}ms (${thresholds.loadTime.passed ? 'PASS' : 'FAIL'}) - Threshold: ${thresholds.loadTime.threshold}ms`,
      `Real-time Update: ${thresholds.realTimeUpdate.value.toFixed(2)}ms (${thresholds.realTimeUpdate.passed ? 'PASS' : 'FAIL'}) - Threshold: ${thresholds.realTimeUpdate.threshold}ms`,
      `Bundle Size: ${thresholds.bundleSize.value}KB (${thresholds.bundleSize.passed ? 'PASS' : 'FAIL'}) - Threshold: ${thresholds.bundleSize.threshold}KB`,
      `Memory Usage: ${thresholds.memoryUsage.value.toFixed(2)}MB (${thresholds.memoryUsage.passed ? 'PASS' : 'FAIL'}) - Threshold: ${thresholds.memoryUsage.threshold}MB`,
      '========================',
    ];
    
    return report.join('\n');
  }
  
  // Clear all metrics
  clear(): void {
    this.metrics = [];
    this.startTime = performance.now();
  }
}

// Utility functions for performance testing
export const performanceUtils = {
  // Create a performance monitor instance
  createMonitor: (): PerformanceMonitor => new PerformanceMonitor(),
  
  // Measure function execution time
  measureExecutionTime: <T>(fn: () => T): { result: T; executionTime: number } => {
    const start = performance.now();
    const result = fn();
    const executionTime = performance.now() - start;
    
    return { result, executionTime };
  },
  
  // Measure async function execution time
  measureExecutionTimeAsync: async <T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> => {
    const start = performance.now();
    const result = await fn();
    const executionTime = performance.now() - start;
    
    return { result, executionTime };
  },
  
  // Benchmark multiple function executions
  benchmark: <T>(fn: () => T, iterations: number = 1000): {
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  } => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      averageTime,
      minTime,
      maxTime,
      totalTime,
    };
  },
  
  // Test performance regression
  testRegression: (
    currentTime: number,
    baselineTime: number,
    tolerancePercent: number = 10
  ): { isRegression: boolean; percentChange: number; message: string } => {
    const percentChange = ((currentTime - baselineTime) / baselineTime) * 100;
    const isRegression = percentChange > tolerancePercent;
    
    const message = isRegression
      ? `Performance regression detected: ${percentChange.toFixed(2)}% slower than baseline`
      : `Performance within tolerance: ${percentChange.toFixed(2)}% change from baseline`;
    
    return {
      isRegression,
      percentChange,
      message,
    };
  },
  
  // Monitor memory leaks
  monitorMemoryLeaks: (fn: () => void, iterations: number = 100): {
    initialMemory: number;
    finalMemory: number;
    memoryIncrease: number;
    hasLeak: boolean;
  } => {
    const initialMemory = performanceUtils.measureExecutionTime(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return 0;
    }).result;
    
    // Execute function multiple times
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    const finalMemory = performanceUtils.measureExecutionTime(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
      return 0;
    }).result;
    
    const memoryIncrease = finalMemory - initialMemory;
    const hasLeak = memoryIncrease > 10; // More than 10MB increase indicates potential leak
    
    return {
      initialMemory,
      finalMemory,
      memoryIncrease,
      hasLeak,
    };
  },
};

// Export default monitor instance
export const performanceMonitor = new PerformanceMonitor();
