/**
 * Timer Utilities
 * 
 * Provides cleanup utilities for timers and intervals.
 * Ensures proper memory management and prevents memory leaks.
 */

/**
 * Timer reference interface
 */
export interface TimerReference {
  id: number | NodeJS.Timeout;
  type: 'timeout' | 'interval' | 'animationFrame';
  callback: () => void;
  createdAt: number;
}

/**
 * Timer manager class for cleanup and memory management
 */
export class TimerManager {
  private timers: Map<string, TimerReference> = new Map();
  private isCleanedUp = false;

  /**
   * Create a timeout timer
   */
  setTimeout(callback: () => void, delay: number, key?: string): string {
    if (this.isCleanedUp) {
      console.warn('TimerManager wurde bereits bereinigt, Timer wird nicht erstellt');
      return '';
    }

    const timerKey = key || `timeout_${Date.now()}_${Math.random()}`;
    const id = window.setTimeout(() => {
      this.timers.delete(timerKey);
      callback();
    }, delay);

    this.timers.set(timerKey, {
      id,
      type: 'timeout',
      callback,
      createdAt: Date.now()
    });

    return timerKey;
  }

  /**
   * Create an interval timer
   */
  setInterval(callback: () => void, delay: number, key?: string): string {
    if (this.isCleanedUp) {
      console.warn('TimerManager wurde bereits bereinigt, Timer wird nicht erstellt');
      return '';
    }

    const timerKey = key || `interval_${Date.now()}_${Math.random()}`;
    const id = window.setInterval(callback, delay);

    this.timers.set(timerKey, {
      id,
      type: 'interval',
      callback,
      createdAt: Date.now()
    });

    return timerKey;
  }

  /**
   * Create an animation frame timer
   */
  requestAnimationFrame(callback: () => void, key?: string): string {
    if (this.isCleanedUp) {
      console.warn('TimerManager wurde bereits bereinigt, Timer wird nicht erstellt');
      return '';
    }

    const timerKey = key || `animationFrame_${Date.now()}_${Math.random()}`;
    const id = window.requestAnimationFrame(() => {
      this.timers.delete(timerKey);
      callback();
    });

    this.timers.set(timerKey, {
      id,
      type: 'animationFrame',
      callback,
      createdAt: Date.now()
    });

    return timerKey;
  }

  /**
   * Clear a specific timer
   */
  clearTimer(key: string): boolean {
    const timer = this.timers.get(key);
    if (!timer) {
      return false;
    }

    try {
      switch (timer.type) {
        case 'timeout':
          window.clearTimeout(timer.id as number);
          break;
        case 'interval':
          window.clearInterval(timer.id as number);
          break;
        case 'animationFrame':
          window.cancelAnimationFrame(timer.id as number);
          break;
      }
    } catch (error) {
      console.warn(`Fehler beim Löschen des Timers ${key}:`, error);
    }

    this.timers.delete(key);
    return true;
  }

  /**
   * Clear all timers
   */
  clearAllTimers(): void {
    const keys = Array.from(this.timers.keys());
    keys.forEach(key => this.clearTimer(key));
  }

  /**
   * Cleanup all timers and mark manager as cleaned up
   */
  cleanup(): void {
    this.clearAllTimers();
    this.isCleanedUp = true;
  }

  /**
   * Get timer count
   */
  getTimerCount(): number {
    return this.timers.size;
  }

  /**
   * Get timer information
   */
  getTimerInfo(key: string): TimerReference | undefined {
    return this.timers.get(key);
  }

  /**
   * Get all active timer keys
   */
  getActiveTimerKeys(): string[] {
    return Array.from(this.timers.keys());
  }
}

/**
 * Global timer manager instance
 */
export const globalTimerManager = new TimerManager();

/**
 * Utility functions for timer management
 */

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  timerManager: TimerManager = globalTimerManager
): (...args: Parameters<T>) => void {
  let timeoutKey: string | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutKey) {
      timerManager.clearTimer(timeoutKey);
    }

    timeoutKey = timerManager.setTimeout(() => {
      func(...args);
      timeoutKey = null;
    }, delay);
  };
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  timerManager: TimerManager = globalTimerManager
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutKey: string | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else if (!timeoutKey) {
      timeoutKey = timerManager.setTimeout(() => {
        lastCall = Date.now();
        func(...args);
        timeoutKey = null;
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Create a polling function
 */
export function createPolling(
  callback: () => void,
  interval: number,
  timerManager: TimerManager = globalTimerManager
): {
  start: () => string;
  stop: () => boolean;
  isRunning: () => boolean;
} {
  let intervalKey: string | null = null;

  return {
    start: () => {
      if (intervalKey) {
        timerManager.clearTimer(intervalKey);
      }
      intervalKey = timerManager.setInterval(callback, interval);
      return intervalKey;
    },
    stop: () => {
      if (intervalKey) {
        const result = timerManager.clearTimer(intervalKey);
        intervalKey = null;
        return result;
      }
      return false;
    },
    isRunning: () => intervalKey !== null
  };
}

/**
 * Cleanup function for React components
 */
export function createCleanupFunction(timerManager: TimerManager = globalTimerManager) {
  return () => {
    timerManager.cleanup();
  };
}

/**
 * Hook for automatic timer cleanup in React components
 */
export function useTimerCleanup(timerManager: TimerManager = globalTimerManager) {
  return () => {
    timerManager.cleanup();
  };
}
