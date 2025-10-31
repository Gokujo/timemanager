// Base test utilities and helpers for unit tests
import { TEST_CONSTANTS, createMockDate, createMockBreak, createMockTimeTrackingState } from '../testConfig';

// Mock localStorage utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Time calculation test helpers
export const timeTestHelpers = {
  // Convert hours and minutes to total minutes
  hoursToMinutes: (hours: number, minutes: number = 0): number => hours * 60 + minutes,
  
  // Convert minutes to hours and minutes
  minutesToHours: (totalMinutes: number): { hours: number; minutes: number } => ({
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  }),
  
  // Create a date with specific time
  createTime: (hour: number, minute: number = 0): Date => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  },
  
  // Calculate time difference in minutes
  timeDifference: (start: Date, end: Date): number => {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  },
};

// Validation test helpers
export const validationTestHelpers = {
  // Test Arbeitszeitschutzgesetz compliance
  testArbZGCompliance: (workedMinutes: number, breaks: any[]) => {
    const totalBreakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
    const totalTime = workedMinutes + totalBreakTime;
    
    return {
      exceedsMaxWorkTime: workedMinutes > TEST_CONSTANTS.ARBZG_LIMITS.MAX_DAILY_WORK,
      needsBreak6H: workedMinutes >= 360 && totalBreakTime < TEST_CONSTANTS.ARBZG_LIMITS.MANDATORY_BREAK_6H,
      needsBreak9H: workedMinutes >= 540 && totalBreakTime < TEST_CONSTANTS.ARBZG_LIMITS.MANDATORY_BREAK_9H,
      totalTimeExceedsLimit: totalTime > TEST_CONSTANTS.ARBZG_LIMITS.MAX_DAILY_WORK,
    };
  },
  
  // Test work day validation
  testWorkDayValidation: (dayOfWeek: number, workHours: number) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const expectedHours = isWeekend ? 0 : TEST_CONSTANTS.DEFAULT_WORK_HOURS[dayName.toUpperCase() as keyof typeof TEST_CONSTANTS.DEFAULT_WORK_HOURS];
    
    return {
      isValid: workHours >= 0 && workHours <= 1440, // 0 to 24 hours
      isWeekend,
      expectedHours,
      matchesDefault: workHours === expectedHours,
    };
  },
};

// German language test helpers
export const germanLanguageTestHelpers = {
  // Test German number formatting
  testGermanNumberFormat: (number: number): boolean => {
    const germanFormat = number.toLocaleString('de-DE');
    return germanFormat.includes(',') || germanFormat.includes('.');
  },
  
  // Test German time formatting
  testGermanTimeFormat: (date: Date): boolean => {
    const germanTime = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return /^\d{2}:\d{2}$/.test(germanTime);
  },
  
  // Test German date formatting
  testGermanDateFormat: (date: Date): boolean => {
    const germanDate = date.toLocaleDateString('de-DE');
    return /^\d{2}\.\d{2}\.\d{4}$/.test(germanDate);
  },
  
  // Validate German text content
  validateGermanText: (text: string): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    // Check for English words that should be German
    const englishWords = ['error', 'warning', 'invalid', 'required', 'success', 'failed'];
    englishWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        issues.push(`Contains English word: ${word}`);
      }
    });
    
    // Check for proper German capitalization
    if (text.includes('stunde') || text.includes('minute')) {
      issues.push('German nouns should be capitalized');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  },
};

// Performance test helpers
export const performanceTestHelpers = {
  // Measure function execution time
  measureExecutionTime: async <T>(fn: () => T | Promise<T>): Promise<{ result: T; executionTime: number }> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    return {
      result,
      executionTime: end - start,
    };
  },
  
  // Test memory usage
  measureMemoryUsage: (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  },
  
  // Test bundle size (mock for now)
  testBundleSize: (): { size: number; threshold: number; passed: boolean } => {
    // This would be implemented with actual bundle analysis
    const mockSize = 450; // Mock size in KB
    const threshold = TEST_CONSTANTS.PERFORMANCE_THRESHOLDS.BUNDLE_SIZE;
    
    return {
      size: mockSize,
      threshold,
      passed: mockSize < threshold,
    };
  },
};

// Error handling test helpers
export const errorTestHelpers = {
  // Test error message format
  testErrorFormat: (error: Error): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    if (!error.message) {
      issues.push('Error message is empty');
    }
    
    if (error.message.length < 3) {
      issues.push('Error message too short');
    }
    
    // Check if error message is in German
    const germanValidation = germanLanguageTestHelpers.validateGermanText(error.message);
    if (!germanValidation.isValid) {
      issues.push(...germanValidation.issues);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  },
  
  // Test error handling in functions
  testErrorHandling: async <T>(
    fn: () => T | Promise<T>,
    expectedError?: string
  ): Promise<{ handled: boolean; error?: Error }> => {
    try {
      await fn();
      return { handled: false };
    } catch (error) {
      if (expectedError && error instanceof Error && error.message.includes(expectedError)) {
        return { handled: true, error };
      }
      return { handled: true, error: error as Error };
    }
  },
};

// Export all helpers
export {
  TEST_CONSTANTS,
  createMockDate,
  createMockBreak,
  createMockTimeTrackingState,
};
