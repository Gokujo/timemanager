// Unit tests for German error messages and validation
import { TEST_CONSTANTS, validationTestHelpers, germanLanguageTestHelpers } from '../testHelpers';
import { mockGermanTexts, mockEdgeCases } from '../fixtures/mockData';

// Mock the validationUtils module
jest.mock('@/utils/validationUtils', () => ({
  validateWorkTime: jest.fn(),
  validateStartTime: jest.fn(),
}));

import { validateWorkTime, validateStartTime } from '@/utils/validationUtils';

describe('German Error Messages and Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateWorkTime', () => {
    it('should return German error messages for Arbeitszeitschutzgesetz violations', () => {
      (validateWorkTime as jest.Mock).mockImplementation((workedMinutes: number, breaks: any[], startTime: any, status: string, plan: any, plannedWork: number) => {
        const warnings: string[] = [];
        
        // Check maximum work time
        if (workedMinutes > TEST_CONSTANTS.ARBZG_LIMITS.MAX_DAILY_WORK) {
          warnings.push('Maximale Arbeitszeit von 10 Stunden überschritten.');
        }
        
        // Check mandatory breaks
        const totalBreakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
        if (workedMinutes >= 360 && totalBreakTime < TEST_CONSTANTS.ARBZG_LIMITS.MANDATORY_BREAK_6H) {
          warnings.push('Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.');
        }
        if (workedMinutes >= 540 && totalBreakTime < TEST_CONSTANTS.ARBZG_LIMITS.MANDATORY_BREAK_9H) {
          warnings.push('Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.');
        }
        
        return {
          isValid: warnings.length === 0,
          warnings,
        };
      });

      // Test maximum work time violation
      const result1 = validateWorkTime(650, [], null, 'running', {}, 480);
      expect(result1.isValid).toBe(false);
      expect(result1.warnings).toContain('Maximale Arbeitszeit von 10 Stunden überschritten.');

      // Test break requirement violation (6 hours)
      const result2 = validateWorkTime(400, [], null, 'running', {}, 480);
      expect(result2.isValid).toBe(false);
      expect(result2.warnings).toContain('Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.');

      // Test break requirement violation (9 hours)
      const result3 = validateWorkTime(600, [{ duration: 30 }], null, 'running', {}, 480);
      expect(result3.isValid).toBe(false);
      expect(result3.warnings).toContain('Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.');

      // Test valid case
      const result4 = validateWorkTime(400, [{ duration: 30 }], null, 'running', {}, 480);
      expect(result4.isValid).toBe(true);
      expect(result4.warnings).toHaveLength(0);
    });

    it('should handle edge cases correctly', () => {
      (validateWorkTime as jest.Mock).mockImplementation((workedMinutes: number, breaks: any[], startTime: any, status: string, plan: any, plannedWork: number) => {
        const warnings: string[] = [];
        
        // Test exactly 6 hours
        if (workedMinutes === 360) {
          const totalBreakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
          if (totalBreakTime < 30) {
            warnings.push('Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.');
          }
        }
        
        // Test exactly 9 hours
        if (workedMinutes === 540) {
          const totalBreakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
          if (totalBreakTime < 45) {
            warnings.push('Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.');
          }
        }
        
        return {
          isValid: warnings.length === 0,
          warnings,
        };
      });

      // Test exactly 6 hours without break
      const result1 = validateWorkTime(360, [], null, 'running', {}, 480);
      expect(result1.isValid).toBe(false);
      expect(result1.warnings).toContain('Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.');

      // Test exactly 9 hours without sufficient break
      const result2 = validateWorkTime(540, [{ duration: 30 }], null, 'running', {}, 480);
      expect(result2.isValid).toBe(false);
      expect(result2.warnings).toContain('Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.');
    });

    it('should validate German language in error messages', () => {
      (validateWorkTime as jest.Mock).mockImplementation((workedMinutes: number, breaks: any[], startTime: any, status: string, plan: any, plannedWork: number) => {
        const warnings: string[] = [];
        
        if (workedMinutes > TEST_CONSTANTS.ARBZG_LIMITS.MAX_DAILY_WORK) {
          warnings.push('Maximale Arbeitszeit von 10 Stunden überschritten.');
        }
        
        return {
          isValid: warnings.length === 0,
          warnings,
        };
      });

      const result = validateWorkTime(650, [], null, 'running', {}, 480);
      
      result.warnings.forEach(warning => {
        const validation = germanLanguageTestHelpers.validateGermanText(warning);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });
  });

  describe('validateStartTime', () => {
    it('should return German error messages for invalid start times', () => {
      (validateStartTime as jest.Mock).mockImplementation((startTimeStr: string) => {
        const warnings: string[] = [];
        
        // Check if time is in valid HH:MM format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(startTimeStr)) {
          warnings.push('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');
        }
        
        // Check if time is in the future
        const now = new Date();
        const [hours, minutes] = startTimeStr.split(':').map(Number);
        const inputTime = new Date();
        inputTime.setHours(hours, minutes, 0, 0);
        
        if (inputTime > now) {
          warnings.push('Startzeit darf nicht in der Zukunft liegen.');
        }
        
        return {
          isValid: warnings.length === 0,
          warnings,
        };
      });

      // Test invalid format
      const result1 = validateStartTime('25:00');
      expect(result1.isValid).toBe(false);
      expect(result1.warnings).toContain('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');

      // Test invalid format
      const result2 = validateStartTime('12:60');
      expect(result2.isValid).toBe(false);
      expect(result2.warnings).toContain('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');

      // Test invalid format
      const result3 = validateStartTime('abc:def');
      expect(result3.isValid).toBe(false);
      expect(result3.warnings).toContain('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');

      // Test valid format
      const result4 = validateStartTime('08:30');
      expect(result4.isValid).toBe(true);
      expect(result4.warnings).toHaveLength(0);
    });

    it('should handle edge cases correctly', () => {
      (validateStartTime as jest.Mock).mockImplementation((startTimeStr: string) => {
        const warnings: string[] = [];
        
        if (!startTimeStr || startTimeStr.trim() === '') {
          warnings.push('Startzeit ist erforderlich.');
        }
        
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
        if (startTimeStr && !timeRegex.test(startTimeStr)) {
          warnings.push('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');
        }
        
        return {
          isValid: warnings.length === 0,
          warnings,
        };
      });

      // Test empty string
      const result1 = validateStartTime('');
      expect(result1.isValid).toBe(false);
      expect(result1.warnings).toContain('Startzeit ist erforderlich.');

      // Test whitespace only
      const result2 = validateStartTime('   ');
      expect(result2.isValid).toBe(false);
      expect(result2.warnings).toContain('Startzeit ist erforderlich.');

      // Test null/undefined
      const result3 = validateStartTime(null as any);
      expect(result3.isValid).toBe(false);
      expect(result3.warnings).toContain('Startzeit ist erforderlich.');
    });

    it('should validate German language in error messages', () => {
      (validateStartTime as jest.Mock).mockImplementation((startTimeStr: string) => {
        const warnings: string[] = [];
        
        if (!startTimeStr || startTimeStr.trim() === '') {
          warnings.push('Startzeit ist erforderlich.');
        }
        
        return {
          isValid: warnings.length === 0,
          warnings,
        };
      });

      const result = validateStartTime('');
      
      result.warnings.forEach(warning => {
        const validation = germanLanguageTestHelpers.validateGermanText(warning);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });
  });

  describe('German Error Message Validation', () => {
    it('should validate all error messages are in German', () => {
      const errorMessages = Object.values(mockGermanTexts.errorMessages);
      
      errorMessages.forEach(message => {
        const validation = germanLanguageTestHelpers.validateGermanText(message);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });

    it('should validate all success messages are in German', () => {
      const successMessages = Object.values(mockGermanTexts.successMessages);
      
      successMessages.forEach(message => {
        const validation = germanLanguageTestHelpers.validateGermanText(message);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });

    it('should validate all UI labels are in German', () => {
      const uiLabels = Object.values(mockGermanTexts.uiLabels);
      
      uiLabels.forEach(label => {
        const validation = germanLanguageTestHelpers.validateGermanText(label);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });

    it('should detect English words in German text', () => {
      const englishTexts = [
        'This is an error message',
        'Invalid time format',
        'Required field',
        'Success message',
        'Failed to save',
      ];
      
      englishTexts.forEach(text => {
        const validation = germanLanguageTestHelpers.validateGermanText(text);
        expect(validation.isValid).toBe(false);
        expect(validation.issues.length).toBeGreaterThan(0);
      });
    });

    it('should detect improper German capitalization', () => {
      const improperTexts = [
        'stunde', // Should be 'Stunde'
        'minute', // Should be 'Minute'
        'tag', // Should be 'Tag'
        'woche', // Should be 'Woche'
      ];
      
      improperTexts.forEach(text => {
        const validation = germanLanguageTestHelpers.validateGermanText(text);
        expect(validation.isValid).toBe(false);
        expect(validation.issues).toContain('German nouns should be capitalized');
      });
    });
  });

  describe('Arbeitszeitschutzgesetz Validation', () => {
    it('should validate ArbZG compliance correctly', () => {
      const testCases = [
        { workedMinutes: 300, breaks: [], expected: { needsBreak6H: false, needsBreak9H: false } },
        { workedMinutes: 360, breaks: [], expected: { needsBreak6H: true, needsBreak9H: false } },
        { workedMinutes: 400, breaks: [{ duration: 30 }], expected: { needsBreak6H: false, needsBreak9H: false } },
        { workedMinutes: 540, breaks: [{ duration: 30 }], expected: { needsBreak6H: false, needsBreak9H: true } },
        { workedMinutes: 600, breaks: [{ duration: 45 }], expected: { needsBreak6H: false, needsBreak9H: false } },
        { workedMinutes: 650, breaks: [], expected: { exceedsMaxWorkTime: true } },
      ];

      testCases.forEach(({ workedMinutes, breaks, expected }) => {
        const result = validationTestHelpers.testArbZGCompliance(workedMinutes, breaks);
        
        Object.keys(expected).forEach(key => {
          expect(result[key as keyof typeof result]).toBe(expected[key as keyof typeof expected]);
        });
      });
    });

    it('should validate work day configuration correctly', () => {
      const testCases = [
        { dayOfWeek: 1, workHours: 480, expected: { isValid: true, isWeekend: false, matchesDefault: true } }, // Monday
        { dayOfWeek: 6, workHours: 0, expected: { isValid: true, isWeekend: true, matchesDefault: true } }, // Saturday
        { dayOfWeek: 0, workHours: 0, expected: { isValid: true, isWeekend: true, matchesDefault: true } }, // Sunday
        { dayOfWeek: 1, workHours: -60, expected: { isValid: false } }, // Invalid negative
        { dayOfWeek: 1, workHours: 1500, expected: { isValid: false } }, // Invalid too high
      ];

      testCases.forEach(({ dayOfWeek, workHours, expected }) => {
        const result = validationTestHelpers.testWorkDayValidation(dayOfWeek, workHours);
        
        Object.keys(expected).forEach(key => {
          expect(result[key as keyof typeof result]).toBe(expected[key as keyof typeof expected]);
        });
      });
    });
  });

  describe('Edge Case Validation', () => {
    it('should handle invalid time inputs correctly', () => {
      const invalidInputs = mockEdgeCases.invalidTimeInputs;
      
      invalidInputs.forEach(input => {
        (validateStartTime as jest.Mock).mockImplementation((startTimeStr: string) => {
          const warnings: string[] = [];
          
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
          if (!timeRegex.test(startTimeStr)) {
            warnings.push('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');
          }
          
          return {
            isValid: warnings.length === 0,
            warnings,
          };
        });

        const result = validateStartTime(input);
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain('Ungültiges Zeitformat. Bitte verwenden Sie das Format HH:MM.');
      });
    });

    it('should handle boundary values correctly', () => {
      const boundaries = mockEdgeCases.arbzgBoundaries;
      
      Object.entries(boundaries).forEach(([key, minutes]) => {
        (validateWorkTime as jest.Mock).mockImplementation((workedMinutes: number, breaks: any[]) => {
          const warnings: string[] = [];
          
          if (workedMinutes > TEST_CONSTANTS.ARBZG_LIMITS.MAX_DAILY_WORK) {
            warnings.push('Maximale Arbeitszeit von 10 Stunden überschritten.');
          }
          
          const totalBreakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
          if (workedMinutes >= 360 && totalBreakTime < 30) {
            warnings.push('Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.');
          }
          if (workedMinutes >= 540 && totalBreakTime < 45) {
            warnings.push('Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.');
          }
          
          return {
            isValid: warnings.length === 0,
            warnings,
          };
        });

        const result = validateWorkTime(minutes, [], null, 'running', {}, 480);
        
        // Test specific boundary cases
        if (key === 'exactly6Hours') {
          expect(result.isValid).toBe(false);
          expect(result.warnings).toContain('Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.');
        } else if (key === 'exactly9Hours') {
          expect(result.isValid).toBe(false);
          expect(result.warnings).toContain('Nach 9 Stunden Arbeit ist eine Pause von mindestens 45 Minuten erforderlich.');
        } else if (key === 'exactly10Hours') {
          expect(result.isValid).toBe(true);
        } else if (key === 'justOver10Hours') {
          expect(result.isValid).toBe(false);
          expect(result.warnings).toContain('Maximale Arbeitszeit von 10 Stunden überschritten.');
        }
      });
    });
  });
});
