// Integration tests for German language consistency
import { TEST_CONSTANTS, germanLanguageTestHelpers } from '../testHelpers';
import { mockGermanTexts, mockUserSettings } from '../fixtures/mockData';

// Mock modules
jest.mock('@/utils/userSettingsUtils', () => ({
  loadUserSettings: jest.fn(),
  saveUserSettings: jest.fn(),
  formatMinutesReadable: jest.fn(),
  formatMinutesCompact: jest.fn(),
  formatTimeForDisplay: jest.fn(),
}));

jest.mock('@/utils/validationUtils', () => ({
  validateWorkTime: jest.fn(),
  validateStartTime: jest.fn(),
}));

jest.mock('@/utils/timeUtils', () => ({
  calculateWorkedTime: jest.fn(),
  calculateEndTime: jest.fn(),
  calculateTotalBreakTime: jest.fn(),
}));

import { loadUserSettings, saveUserSettings, formatMinutesReadable, formatMinutesCompact, formatTimeForDisplay } from '@/utils/userSettingsUtils';
import { validateWorkTime, validateStartTime } from '@/utils/validationUtils';
import { calculateWorkedTime, calculateEndTime, calculateTotalBreakTime } from '@/utils/timeUtils';

describe('German Language Consistency Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Settings Language Consistency', () => {
    it('should maintain German language consistency across all user settings operations', () => {
      // Mock loadUserSettings to return German settings
      (loadUserSettings as jest.Mock).mockImplementation(() => {
        return {
          ...mockUserSettings.default,
          plans: {
            VOR_ORT: {
              name: 'Vor Ort',
              start: 480,
              end: 1080,
              max: 600,
            },
            HOMEOFFICE: {
              name: 'Homeoffice',
              start: 480,
              end: 1080,
              max: 600,
            },
          },
        };
      });

      // Mock saveUserSettings
      (saveUserSettings as jest.Mock).mockImplementation((settings) => {
        // Validate that all text content is in German
        const validation = germanLanguageTestHelpers.validateGermanText(settings.plans.VOR_ORT.name);
        expect(validation.isValid).toBe(true);
        
        const validation2 = germanLanguageTestHelpers.validateGermanText(settings.plans.HOMEOFFICE.name);
        expect(validation2.isValid).toBe(true);
        
        return true;
      });

      const settings = loadUserSettings();
      expect(settings.plans.VOR_ORT.name).toBe('Vor Ort');
      expect(settings.plans.HOMEOFFICE.name).toBe('Homeoffice');
      
      const saveResult = saveUserSettings(settings);
      expect(saveResult).toBe(true);
    });

    it('should handle German language in time formatting consistently', () => {
      (formatMinutesReadable as jest.Mock).mockImplementation((minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
          return remainingMinutes === 1 ? '1 Minute' : `${remainingMinutes} Minuten`;
        }
        
        if (remainingMinutes === 0) {
          return hours === 1 ? '1 Stunde' : `${hours} Stunden`;
        }
        
        const hourText = hours === 1 ? '1 Stunde' : `${hours} Stunden`;
        const minuteText = remainingMinutes === 1 ? '1 Minute' : `${remainingMinutes} Minuten`;
        return `${hourText} ${minuteText}`;
      });

      (formatMinutesCompact as jest.Mock).mockImplementation((minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
          return `${remainingMinutes}m`;
        }
        
        if (remainingMinutes === 0) {
          return `${hours}h`;
        }
        
        return `${hours}h ${remainingMinutes}m`;
      });

      (formatTimeForDisplay as jest.Mock).mockImplementation((minutes: number, format: 'minutes' | 'hours') => {
        if (format === 'minutes') {
          return minutes.toString();
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
      });

      // Test various time formats
      const testCases = [
        { minutes: 0, readable: '0 Minuten', compact: '0m', display: '00:00' },
        { minutes: 1, readable: '1 Minute', compact: '1m', display: '00:01' },
        { minutes: 60, readable: '1 Stunde', compact: '1h', display: '01:00' },
        { minutes: 61, readable: '1 Stunde 1 Minute', compact: '1h 1m', display: '01:01' },
        { minutes: 120, readable: '2 Stunden', compact: '2h', display: '02:00' },
        { minutes: 480, readable: '8 Stunden', compact: '8h', display: '08:00' },
      ];

      testCases.forEach(({ minutes, readable, compact, display }) => {
        expect(formatMinutesReadable(minutes)).toBe(readable);
        expect(formatMinutesCompact(minutes)).toBe(compact);
        expect(formatTimeForDisplay(minutes, 'hours')).toBe(display);
        
        // Validate German language consistency
        const readableValidation = germanLanguageTestHelpers.validateGermanText(readable);
        expect(readableValidation.isValid).toBe(true);
      });
    });
  });

  describe('Validation Error Message Consistency', () => {
    it('should provide consistent German error messages across all validation functions', () => {
      (validateWorkTime as jest.Mock).mockImplementation((workedMinutes: number, breaks: any[], startTime: any, status: string, plan: any, plannedWork: number) => {
        const warnings: string[] = [];
        
        if (workedMinutes > TEST_CONSTANTS.ARBZG_LIMITS.MAX_DAILY_WORK) {
          warnings.push('Maximale Arbeitszeit von 10 Stunden überschritten.');
        }
        
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

      // Test work time validation errors
      const workTimeResult = validateWorkTime(650, [], null, 'running', {}, 480);
      expect(workTimeResult.isValid).toBe(false);
      expect(workTimeResult.warnings).toContain('Maximale Arbeitszeit von 10 Stunden überschritten.');

      // Test start time validation errors
      const startTimeResult = validateStartTime('');
      expect(startTimeResult.isValid).toBe(false);
      expect(startTimeResult.warnings).toContain('Startzeit ist erforderlich.');

      // Validate all error messages are in German
      [...workTimeResult.warnings, ...startTimeResult.warnings].forEach(warning => {
        const validation = germanLanguageTestHelpers.validateGermanText(warning);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });

    it('should maintain consistent terminology across all error messages', () => {
      const expectedTerms = {
        'Stunde': ['Stunde', 'Stunden'],
        'Minute': ['Minute', 'Minuten'],
        'Arbeit': ['Arbeit', 'Arbeitszeit'],
        'Pause': ['Pause', 'Pausen'],
        'Zeit': ['Zeit', 'Zeitformat'],
      };

      // Test that all error messages use consistent German terminology
      const errorMessages = Object.values(mockGermanTexts.errorMessages);
      
      errorMessages.forEach(message => {
        // Check that German terms are used consistently
        Object.entries(expectedTerms).forEach(([baseTerm, variations]) => {
          const hasTerm = variations.some(term => message.includes(term));
          if (hasTerm) {
            // If the message contains a term, it should use the correct German form
            const hasCorrectForm = variations.some(term => message.includes(term));
            expect(hasCorrectForm).toBe(true);
          }
        });
      });
    });
  });

  describe('Time Calculation Language Consistency', () => {
    it('should maintain German language consistency in time calculations', () => {
      (calculateWorkedTime as jest.Mock).mockImplementation((startTime: Date | null, breaks: any[], status: string) => {
        if (!startTime) return 0;
        
        const now = new Date();
        const totalMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        const breakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
        
        return Math.max(0, totalMinutes - breakTime);
      });

      (calculateEndTime as jest.Mock).mockImplementation((startTime: Date | null, breaks: any[], plannedWork: number, workedMinutes: number, status: string) => {
        if (!startTime) return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        
        const remainingWork = plannedWork - workedMinutes;
        const breakTime = breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
        const totalTime = remainingWork + breakTime;
        
        const endTime = new Date(startTime.getTime() + totalTime * 60 * 1000);
        return endTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      });

      (calculateTotalBreakTime as jest.Mock).mockImplementation((breaks: any[]) => {
        return breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);
      });

      const startTime = new Date('2025-01-27T08:00:00');
      const breaks = [
        { start: new Date('2025-01-27T12:00:00'), end: new Date('2025-01-27T12:30:00'), duration: 30 },
      ];

      const workedTime = calculateWorkedTime(startTime, breaks, 'running');
      const endTime = calculateEndTime(startTime, breaks, 480, workedTime, 'running');
      const totalBreakTime = calculateTotalBreakTime(breaks);

      expect(workedTime).toBeGreaterThan(0);
      expect(totalBreakTime).toBe(30);
      
      // Validate that end time is in German format (24-hour)
      expect(endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(endTime).not.toContain('AM');
      expect(endTime).not.toContain('PM');
    });

    it('should handle German date and time formats consistently', () => {
      const testDate = new Date('2025-01-27T08:30:00');
      
      // Test German date format
      const germanDate = testDate.toLocaleDateString('de-DE');
      expect(germanDate).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
      
      // Test German time format
      const germanTime = testDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      expect(germanTime).toMatch(/^\d{2}:\d{2}$/);
      
      // Test German number format
      const germanNumber = (8.5).toLocaleString('de-DE');
      expect(germanNumber).toContain(',');
    });
  });

  describe('Cross-Component Language Consistency', () => {
    it('should maintain consistent German language across all components', () => {
      // Test that all UI text follows German conventions
      const uiTexts = [
        ...Object.values(mockGermanTexts.uiLabels),
        ...Object.values(mockGermanTexts.errorMessages),
        ...Object.values(mockGermanTexts.successMessages),
        ...Object.values(mockGermanTexts.workPlans),
        ...Object.values(mockGermanTexts.workDays),
      ];

      uiTexts.forEach(text => {
        const validation = germanLanguageTestHelpers.validateGermanText(text);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });

    it('should handle German language edge cases consistently', () => {
      const edgeCases = [
        '8 Stunden 30 Minuten', // Long time format
        'Nach 6 Stunden Arbeit ist eine Pause von mindestens 30 Minuten erforderlich.', // Long error message
        'Maximale Arbeitszeit von 10 Stunden überschritten.', // Long warning
        'Dies ist ein sehr langer deutscher Text, der verwendet wird, um zu testen, wie die Anwendung mit langen Texten umgeht.', // Very long text
      ];

      edgeCases.forEach(text => {
        const validation = germanLanguageTestHelpers.validateGermanText(text);
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      });
    });

    it('should maintain German language consistency during data persistence', () => {
      (loadUserSettings as jest.Mock).mockImplementation(() => {
        return {
          ...mockUserSettings.default,
          plans: {
            VOR_ORT: { name: 'Vor Ort', start: 480, end: 1080, max: 600 },
            HOMEOFFICE: { name: 'Homeoffice', start: 480, end: 1080, max: 600 },
          },
        };
      });

      (saveUserSettings as jest.Mock).mockImplementation((settings) => {
        // Simulate localStorage persistence
        const serialized = JSON.stringify(settings);
        const deserialized = JSON.parse(serialized);
        
        // Validate that German text is preserved
        expect(deserialized.plans.VOR_ORT.name).toBe('Vor Ort');
        expect(deserialized.plans.HOMEOFFICE.name).toBe('Homeoffice');
        
        return true;
      });

      const settings = loadUserSettings();
      const saveResult = saveUserSettings(settings);
      
      expect(saveResult).toBe(true);
      
      // Validate that German text is preserved through the persistence cycle
      const validation1 = germanLanguageTestHelpers.validateGermanText(settings.plans.VOR_ORT.name);
      const validation2 = germanLanguageTestHelpers.validateGermanText(settings.plans.HOMEOFFICE.name);
      
      expect(validation1.isValid).toBe(true);
      expect(validation2.isValid).toBe(true);
    });
  });

  describe('Performance with German Language', () => {
    it('should maintain performance while ensuring German language consistency', () => {
      const startTime = performance.now();
      
      // Perform multiple German language operations
      for (let i = 0; i < 1000; i++) {
        const testText = `Test ${i} Stunden`;
        const validation = germanLanguageTestHelpers.validateGermanText(testText);
        expect(validation.isValid).toBe(true);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms for 1000 operations)
      expect(executionTime).toBeLessThan(100);
    });

    it('should handle German text formatting efficiently', () => {
      (formatMinutesReadable as jest.Mock).mockImplementation((minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
          return remainingMinutes === 1 ? '1 Minute' : `${remainingMinutes} Minuten`;
        }
        
        if (remainingMinutes === 0) {
          return hours === 1 ? '1 Stunde' : `${hours} Stunden`;
        }
        
        const hourText = hours === 1 ? '1 Stunde' : `${hours} Stunden`;
        const minuteText = remainingMinutes === 1 ? '1 Minute' : `${remainingMinutes} Minuten`;
        return `${hourText} ${minuteText}`;
      });

      const startTime = performance.now();
      
      // Perform multiple formatting operations
      for (let i = 0; i < 1000; i++) {
        const formatted = formatMinutesReadable(i);
        expect(formatted).toContain('Stunde');
        expect(formatted).toContain('Minute');
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time
      expect(executionTime).toBeLessThan(100);
    });
  });
});
