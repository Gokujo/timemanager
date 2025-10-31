// Error handling utilities for the application
// This file provides centralized error handling with German language support

// Error types enum
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom error class with German messages
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly timestamp: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code: string = 'UNKNOWN',
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.timestamp = Date.now();
    this.context = context;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// German error messages
export const ERROR_MESSAGES = {
  // Validation errors
  INVALID_TIME_FORMAT: 'Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.',
  INVALID_WORK_HOURS: 'Ungültige Arbeitsstunden. Bitte geben Sie einen Wert zwischen 0 und 24 Stunden ein.',
  INVALID_BREAK_TIME: 'Ungültige Pausenzeit. Die Pause muss mindestens 1 Minute dauern.',
  REQUIRED_FIELD: 'Dieses Feld ist erforderlich.',
  INVALID_DATE: 'Ungültiges Datum. Bitte verwenden Sie das Format DD.MM.YYYY.',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'Speicherplatz überschritten. Bitte löschen Sie alte Daten.',
  STORAGE_ACCESS_DENIED: 'Zugriff auf lokalen Speicher verweigert.',
  STORAGE_NOT_AVAILABLE: 'Lokaler Speicher nicht verfügbar.',
  STORAGE_CORRUPTED: 'Gespeicherte Daten sind beschädigt. Einstellungen werden zurückgesetzt.',
  
  // Calculation errors
  CALCULATION_OVERFLOW: 'Berechnungsfehler: Wert zu groß.',
  CALCULATION_UNDERFLOW: 'Berechnungsfehler: Wert zu klein.',
  INVALID_TIME_RANGE: 'Ungültiger Zeitbereich. Endzeit muss nach der Startzeit liegen.',
  BREAK_OVERLAP: 'Pausen überschneiden sich. Bitte korrigieren Sie die Zeiten.',
  
  // Arbeitszeitschutzgesetz errors
  ARBZG_MAX_WORK_TIME_EXCEEDED: 'Maximale Arbeitszeit von 10 Stunden überschritten.',
  ARBZG_BREAK_REQUIRED_6H: 'Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.',
  ARBZG_BREAK_REQUIRED_9H: 'Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.',
  ARBZG_INVALID_WORK_PLAN: 'Ungültiger Arbeitsplan. Maximale Arbeitszeit überschritten.',
  
  // Network errors (for future use)
  NETWORK_TIMEOUT: 'Netzwerkverbindung unterbrochen.',
  NETWORK_UNAVAILABLE: 'Netzwerk nicht verfügbar.',
  
  // Unknown errors
  UNKNOWN_ERROR: 'Ein unbekannter Fehler ist aufgetreten.',
  UNEXPECTED_ERROR: 'Ein unerwarteter Fehler ist aufgetreten.',
} as const;

// Error factory functions
export const createValidationError = (
  message: string,
  code: string,
  context?: Record<string, any>
): AppError => {
  return new AppError(
    message,
    ErrorType.VALIDATION_ERROR,
    ErrorSeverity.MEDIUM,
    code,
    context
  );
};

export const createStorageError = (
  message: string,
  code: string,
  context?: Record<string, any>
): AppError => {
  return new AppError(
    message,
    ErrorType.STORAGE_ERROR,
    ErrorSeverity.HIGH,
    code,
    context
  );
};

export const createCalculationError = (
  message: string,
  code: string,
  context?: Record<string, any>
): AppError => {
  return new AppError(
    message,
    ErrorType.CALCULATION_ERROR,
    ErrorSeverity.HIGH,
    code,
    context
  );
};

export const createArbZGError = (
  message: string,
  code: string,
  context?: Record<string, any>
): AppError => {
  return new AppError(
    message,
    ErrorType.VALIDATION_ERROR,
    ErrorSeverity.CRITICAL,
    code,
    context
  );
};

// Error handling utilities
export const errorUtils = {
  // Check if error is an AppError
  isAppError: (error: unknown): error is AppError => {
    return error instanceof AppError;
  },

  // Get error message in German
  getErrorMessage: (error: unknown): string => {
    if (errorUtils.isAppError(error)) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  // Get error severity
  getErrorSeverity: (error: unknown): ErrorSeverity => {
    if (errorUtils.isAppError(error)) {
      return error.severity;
    }
    
    return ErrorSeverity.MEDIUM;
  },

  // Check if error is critical
  isCriticalError: (error: unknown): boolean => {
    return errorUtils.getErrorSeverity(error) === ErrorSeverity.CRITICAL;
  },

  // Log error with context
  logError: (error: unknown, context?: Record<string, any>): void => {
    const errorMessage = errorUtils.getErrorMessage(error);
    const severity = errorUtils.getErrorSeverity(error);
    
    const logData = {
      message: errorMessage,
      severity,
      timestamp: new Date().toISOString(),
      context: errorUtils.isAppError(error) ? error.context : context,
    };
    
    // Log to console with appropriate level
    switch (severity) {
      case ErrorSeverity.LOW:
        console.info('App Error (Low):', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('App Error (Medium):', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('App Error (High):', logData);
        break;
      case ErrorSeverity.CRITICAL:
        console.error('App Error (Critical):', logData);
        break;
    }
  },

  // Handle error gracefully
  handleError: (error: unknown, fallbackValue?: any): any => {
    errorUtils.logError(error);
    
    if (errorUtils.isCriticalError(error)) {
      // For critical errors, we might want to show a user notification
      // or take other recovery actions
      return fallbackValue;
    }
    
    return fallbackValue;
  },

  // Wrap function with error handling
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => R,
    fallbackValue?: R,
    errorContext?: Record<string, any>
  ) => {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        errorUtils.logError(error, errorContext);
        return fallbackValue as R;
      }
    };
  },

  // Wrap async function with error handling
  withAsyncErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    fallbackValue?: R,
    errorContext?: Record<string, any>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        errorUtils.logError(error, errorContext);
        return fallbackValue as R;
      }
    };
  },

  // Validate error message is in German
  validateGermanError: (message: string): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    // Check for English words that should be German
    const englishWords = ['error', 'warning', 'invalid', 'required', 'success', 'failed'];
    englishWords.forEach(word => {
      if (message.toLowerCase().includes(word)) {
        issues.push(`Contains English word: ${word}`);
      }
    });
    
    // Check for proper German capitalization
    if (message.includes('stunde') || message.includes('minute')) {
      issues.push('German nouns should be capitalized');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  },
};

// Specific error handlers for common scenarios
export const specificErrorHandlers = {
  // Handle localStorage errors
  handleLocalStorageError: (error: unknown): AppError => {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'QuotaExceededError':
          return createStorageError(
            ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED,
            'STORAGE_QUOTA_EXCEEDED',
            { originalError: error.name }
          );
        case 'SecurityError':
          return createStorageError(
            ERROR_MESSAGES.STORAGE_ACCESS_DENIED,
            'STORAGE_ACCESS_DENIED',
            { originalError: error.name }
          );
        default:
          return createStorageError(
            ERROR_MESSAGES.STORAGE_NOT_AVAILABLE,
            'STORAGE_NOT_AVAILABLE',
            { originalError: error.name }
          );
      }
    }
    
    return createStorageError(
      ERROR_MESSAGES.STORAGE_NOT_AVAILABLE,
      'STORAGE_UNKNOWN_ERROR',
      { originalError: error }
    );
  },

  // Handle time calculation errors
  handleTimeCalculationError: (error: unknown, context?: Record<string, any>): AppError => {
    if (error instanceof RangeError) {
      return createCalculationError(
        ERROR_MESSAGES.CALCULATION_OVERFLOW,
        'CALCULATION_OVERFLOW',
        { ...context, originalError: error.message }
      );
    }
    
    return createCalculationError(
      ERROR_MESSAGES.CALCULATION_OVERFLOW,
      'CALCULATION_UNKNOWN_ERROR',
      { ...context, originalError: error }
    );
  },

  // Handle Arbeitszeitschutzgesetz validation errors
  handleArbZGError: (violationType: string, context?: Record<string, any>): AppError => {
    switch (violationType) {
      case 'MAX_WORK_TIME':
        return createArbZGError(
          ERROR_MESSAGES.ARBZG_MAX_WORK_TIME_EXCEEDED,
          'ARBZG_MAX_WORK_TIME_EXCEEDED',
          context
        );
      case 'BREAK_REQUIRED_6H':
        return createArbZGError(
          ERROR_MESSAGES.ARBZG_BREAK_REQUIRED_6H,
          'ARBZG_BREAK_REQUIRED_6H',
          context
        );
      case 'BREAK_REQUIRED_9H':
        return createArbZGError(
          ERROR_MESSAGES.ARBZG_BREAK_REQUIRED_9H,
          'ARBZG_BREAK_REQUIRED_9H',
          context
        );
      case 'INVALID_WORK_PLAN':
        return createArbZGError(
          ERROR_MESSAGES.ARBZG_INVALID_WORK_PLAN,
          'ARBZG_INVALID_WORK_PLAN',
          context
        );
      default:
        return createArbZGError(
          ERROR_MESSAGES.ARBZG_MAX_WORK_TIME_EXCEEDED,
          'ARBZG_UNKNOWN_ERROR',
          { ...context, violationType }
        );
    }
  },
};

// Export all error types and utilities
export default {
  AppError,
  ErrorType,
  ErrorSeverity,
  ERROR_MESSAGES,
  errorUtils,
  specificErrorHandlers,
  createValidationError,
  createStorageError,
  createCalculationError,
  createArbZGError,
};
