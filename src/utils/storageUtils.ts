/**
 * Storage Utilities
 * 
 * Provides error handling and utilities for localStorage operations.
 * Complies with DSGVO requirements for local data storage.
 */

/**
 * Storage error types
 */
export enum StorageErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INVALID_DATA = 'INVALID_DATA',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  DESERIALIZATION_ERROR = 'DESERIALIZATION_ERROR'
}

/**
 * Storage error interface
 */
export interface StorageError {
  type: StorageErrorType;
  message: string;
  key?: string;
  originalError?: Error;
}

/**
 * Storage operation result
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

/**
 * Safe localStorage get operation with error handling
 */
export function safeGetItem<T>(key: string): StorageResult<T> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage nicht verfügbar'
        }
      };
    }

    const item = window.localStorage.getItem(key);
    if (item === null) {
      return {
        success: true,
        data: undefined
      };
    }

    const parsed = JSON.parse(item);
    return {
      success: true,
      data: parsed
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: StorageErrorType.DESERIALIZATION_ERROR,
        message: `Fehler beim Lesen von localStorage: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        key,
        originalError: error instanceof Error ? error : new Error(String(error))
      }
    };
  }
}

/**
 * Safe localStorage set operation with error handling
 */
export function safeSetItem<T>(key: string, value: T): StorageResult<void> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage nicht verfügbar'
        }
      };
    }

    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    
    return {
      success: true
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      return {
        success: false,
        error: {
          type: StorageErrorType.QUOTA_EXCEEDED,
          message: 'localStorage Speicherplatz erschöpft',
          key,
          originalError: error
        }
      };
    }

    return {
      success: false,
      error: {
        type: StorageErrorType.SERIALIZATION_ERROR,
        message: `Fehler beim Speichern in localStorage: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        key,
        originalError: error instanceof Error ? error : new Error(String(error))
      }
    };
  }
}

/**
 * Safe localStorage remove operation with error handling
 */
export function safeRemoveItem(key: string): StorageResult<void> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage nicht verfügbar'
        }
      };
    }

    window.localStorage.removeItem(key);
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: StorageErrorType.ACCESS_DENIED,
        message: `Fehler beim Löschen aus localStorage: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        key,
        originalError: error instanceof Error ? error : new Error(String(error))
      }
    };
  }
}

/**
 * Clear all application data from localStorage (DSGVO compliance)
 */
export function clearAllAppData(): StorageResult<void> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage nicht verfügbar'
        }
      };
    }

    // List of application-specific keys to clear
    const appKeys = [
      'overrideSetting',
      'autoStopEvents',
      'userSettings',
      'timeTrackingData'
    ];

    appKeys.forEach(key => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Fehler beim Löschen von ${key}:`, error);
      }
    });

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: StorageErrorType.ACCESS_DENIED,
        message: `Fehler beim Löschen aller App-Daten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        originalError: error instanceof Error ? error : new Error(String(error))
      }
    };
  }
}

/**
 * Get localStorage usage information
 */
export function getStorageUsage(): StorageResult<{ used: number; available: number; percentage: number }> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        error: {
          type: StorageErrorType.ACCESS_DENIED,
          message: 'localStorage nicht verfügbar'
        }
      };
    }

    let used = 0;
    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        used += window.localStorage[key].length + key.length;
      }
    }

    // Estimate available space (most browsers have ~5-10MB limit)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    const available = Math.max(0, estimatedLimit - used);
    const percentage = (used / estimatedLimit) * 100;

    return {
      success: true,
      data: {
        used,
        available,
        percentage: Math.min(100, percentage)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: StorageErrorType.ACCESS_DENIED,
        message: `Fehler beim Abrufen der Speicher-Nutzung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        originalError: error instanceof Error ? error : new Error(String(error))
      }
    };
  }
}
