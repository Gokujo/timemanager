/**
 * Unit Tests for Time Utilities
 * 
 * Tests the time calculation utilities for User Story 1 and User Story 2.
 * Ensures proper calculation of worked time, handling of breaks, and ArbZG compliance.
 */

import { calculateWorkedTime } from '../../src/utils/timeUtils';
import { Break } from '../../src/interfaces/break';

describe('Time Utilities - calculateWorkedTime', () => {
  // Mock Date.now() for consistent testing
  const mockNow = new Date('2025-11-05T10:00:00');
  const originalDateNow = Date.now;
  const originalDateConstructor = Date;

  beforeEach(() => {
    // Mock Date.now() to return a fixed time
    global.Date.now = jest.fn(() => mockNow.getTime());
    // Mock Date constructor to return mockNow when called without arguments
    global.Date = jest.fn((...args: any[]) => {
      if (args.length === 0) {
        return mockNow;
      }
      return new originalDateConstructor(...args);
    }) as any;
    // Preserve Date static methods
    Object.setPrototypeOf(global.Date, originalDateConstructor);
    Object.getOwnPropertyNames(originalDateConstructor).forEach((name) => {
      if (name !== 'now' && name !== 'prototype') {
        (global.Date as any)[name] = (originalDateConstructor as any)[name];
      }
    });
  });

  afterEach(() => {
    global.Date = originalDateConstructor;
    global.Date.now = originalDateNow;
  });

  describe('User Story 1: Worked time > 0 immediately after start with planned breaks', () => {
    it('should return worked time > 0 immediately after start with planned breaks (duration-only)', () => {
      // Arrange: Start time 1 minute ago, planned breaks (duration-only, no start/end)
      const startTime = new Date('2025-11-05T09:59:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 30 }, // Planned break (30 minutes)
        { start: null, end: null, duration: 15 }, // Planned break (15 minutes)
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, plannedBreaks, status);

      // Assert: Worked time should be > 0 (1 minute elapsed, no breaks subtracted yet)
      expect(workedTime).toBeGreaterThan(0);
      expect(workedTime).toBe(1); // 1 minute elapsed, no breaks subtracted
    });

    it('should return worked time > 0 immediately after start with multiple planned breaks', () => {
      // Arrange: Start time 5 minutes ago, multiple planned breaks
      const startTime = new Date('2025-11-05T09:55:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 30 },
        { start: null, end: null, duration: 15 },
        { start: null, end: null, duration: 20 },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, plannedBreaks, status);

      // Assert: Worked time should be > 0 (5 minutes elapsed, no breaks subtracted yet)
      expect(workedTime).toBeGreaterThan(0);
      expect(workedTime).toBe(5); // 5 minutes elapsed, no breaks subtracted
    });

    it('should return worked time > 0 even with large planned break duration', () => {
      // Arrange: Start time 2 minutes ago, large planned break (60 minutes)
      const startTime = new Date('2025-11-05T09:58:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 60 }, // Large planned break
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, plannedBreaks, status);

      // Assert: Worked time should be > 0 (2 minutes elapsed, break not subtracted yet)
      expect(workedTime).toBeGreaterThan(0);
      expect(workedTime).toBe(2); // 2 minutes elapsed, break not subtracted
    });
  });

  describe('User Story 1: Planned breaks not subtracted from worked time', () => {
    it('should not subtract planned breaks (duration-only) from worked time', () => {
      // Arrange: Start time 10 minutes ago, planned breaks
      const startTime = new Date('2025-11-05T09:50:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 30 }, // Planned break (30 minutes)
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, plannedBreaks, status);

      // Assert: Worked time should be 10 minutes (not 10 - 30 = -20)
      expect(workedTime).toBe(10); // 10 minutes elapsed, planned break not subtracted
    });

    it('should not subtract multiple planned breaks from worked time', () => {
      // Arrange: Start time 15 minutes ago, multiple planned breaks
      const startTime = new Date('2025-11-05T09:45:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 30 },
        { start: null, end: null, duration: 15 },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, plannedBreaks, status);

      // Assert: Worked time should be 15 minutes (not 15 - 45 = -30)
      expect(workedTime).toBe(15); // 15 minutes elapsed, planned breaks not subtracted
    });

    it('should handle empty breaks array correctly', () => {
      // Arrange: Start time 20 minutes ago, no breaks
      const startTime = new Date('2025-11-05T09:40:00');
      const plannedBreaks: Break[] = [];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, plannedBreaks, status);

      // Assert: Worked time should be 20 minutes
      expect(workedTime).toBe(20);
    });
  });

  describe('User Story 2: Only completed breaks subtracted from worked time', () => {
    it('should subtract only completed breaks from worked time', () => {
      // Arrange: Start time 1 hour ago, completed break (30 minutes, ended 30 minutes ago)
      const startTime = new Date('2025-11-05T09:00:00');
      const completedBreaks: Break[] = [
        {
          start: new Date('2025-11-05T09:30:00'),
          end: new Date('2025-11-05T09:30:00'), // Ended 30 minutes ago
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, completedBreaks, status);

      // Assert: Worked time should be 60 - 30 = 30 minutes
      expect(workedTime).toBe(30);
    });

    it('should not subtract active breaks from worked time', () => {
      // Arrange: Start time 1 hour ago, active break (started 15 minutes ago, ends in 15 minutes)
      const startTime = new Date('2025-11-05T09:00:00');
      const activeBreaks: Break[] = [
        {
          start: new Date('2025-11-05T09:45:00'),
          end: new Date('2025-11-05T10:15:00'), // Ends in 15 minutes
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, activeBreaks, status);

      // Assert: Worked time should be frozen at 45 minutes (break start time)
      expect(workedTime).toBe(45); // Time frozen at break start
    });

    it('should not subtract future breaks from worked time', () => {
      // Arrange: Start time 30 minutes ago, future break (starts in 30 minutes)
      const startTime = new Date('2025-11-05T09:30:00');
      const futureBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:30:00'), // Starts in 30 minutes
          end: new Date('2025-11-05T11:00:00'),
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, futureBreaks, status);

      // Assert: Worked time should be 30 minutes (future break not subtracted)
      expect(workedTime).toBe(30);
    });
  });

  describe('User Story 2: Worked time frozen during active breaks', () => {
    it('should freeze worked time during active break', () => {
      // Arrange: Start time 1 hour ago, active break (started 15 minutes ago, ends in 15 minutes)
      const startTime = new Date('2025-11-05T09:00:00');
      const activeBreaks: Break[] = [
        {
          start: new Date('2025-11-05T09:45:00'),
          end: new Date('2025-11-05T10:15:00'),
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, activeBreaks, status);

      // Assert: Worked time should be frozen at 45 minutes (break start time), not 60 minutes
      expect(workedTime).toBe(45); // Frozen at break start
    });

    it('should freeze worked time at break start time, not current time', () => {
      // Arrange: Start time 2 hours ago, active break (started 1 hour ago, ends in 1 hour)
      const startTime = new Date('2025-11-05T08:00:00');
      const activeBreaks: Break[] = [
        {
          start: new Date('2025-11-05T09:00:00'), // Started 1 hour ago
          end: new Date('2025-11-05T11:00:00'), // Ends in 1 hour
          duration: 120,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, activeBreaks, status);

      // Assert: Worked time should be frozen at 60 minutes (break start time), not 120 minutes
      expect(workedTime).toBe(60); // Frozen at break start (1 hour elapsed)
    });
  });

  describe('User Story 2: Past breaks ignored (before start time)', () => {
    it('should ignore breaks that ended before work started', () => {
      // Arrange: Start time 1 hour ago, break that ended before start time
      const startTime = new Date('2025-11-05T09:00:00');
      const pastBreaks: Break[] = [
        {
          start: new Date('2025-11-05T08:30:00'), // Started before work started
          end: new Date('2025-11-05T08:45:00'), // Ended before work started
          duration: 15,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, pastBreaks, status);

      // Assert: Worked time should be 60 minutes (past break ignored)
      expect(workedTime).toBe(60);
    });

    it('should ignore breaks that started and ended before work started', () => {
      // Arrange: Start time 30 minutes ago, break that ended before start time
      const startTime = new Date('2025-11-05T09:30:00');
      const pastBreaks: Break[] = [
        {
          start: new Date('2025-11-05T08:00:00'),
          end: new Date('2025-11-05T08:30:00'), // Ended before work started
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, pastBreaks, status);

      // Assert: Worked time should be 30 minutes (past break ignored)
      expect(workedTime).toBe(30);
    });
  });

  describe('User Story 2: Future breaks not subtracted', () => {
    it('should not subtract future breaks from worked time', () => {
      // Arrange: Start time 30 minutes ago, future break (starts in 30 minutes)
      const startTime = new Date('2025-11-05T09:30:00');
      const futureBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:30:00'), // Starts in 30 minutes
          end: new Date('2025-11-05T11:00:00'),
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, futureBreaks, status);

      // Assert: Worked time should be 30 minutes (future break not subtracted)
      expect(workedTime).toBe(30);
    });

    it('should not subtract multiple future breaks from worked time', () => {
      // Arrange: Start time 1 hour ago, multiple future breaks
      const startTime = new Date('2025-11-05T09:00:00');
      const futureBreaks: Break[] = [
        {
          start: new Date('2025-11-05T11:00:00'), // Starts in 2 hours
          end: new Date('2025-11-05T11:30:00'),
          duration: 30,
        },
        {
          start: new Date('2025-11-05T12:00:00'), // Starts in 3 hours
          end: new Date('2025-11-05T12:15:00'),
          duration: 15,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, futureBreaks, status);

      // Assert: Worked time should be 60 minutes (future breaks not subtracted)
      expect(workedTime).toBe(60);
    });
  });

  describe('User Story 2: Edge cases - exact start/end time', () => {
    it('should freeze worked time correctly when break starts exactly at current time', () => {
      // Arrange: Start time 30 minutes ago, break starts exactly now
      const startTime = new Date('2025-11-05T09:30:00');
      const exactStartBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Starts exactly now
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, exactStartBreaks, status);

      // Assert: Worked time should be frozen at 30 minutes (break start time)
      expect(workedTime).toBe(30);
    });

    it('should resume worked time correctly when break ends exactly at current time', () => {
      // Arrange: Start time 1 hour ago, break that ended exactly now
      const startTime = new Date('2025-11-05T09:00:00');
      const exactEndBreaks: Break[] = [
        {
          start: new Date('2025-11-05T09:30:00'),
          end: new Date('2025-11-05T10:00:00'), // Ends exactly now
          duration: 30,
        },
      ];
      const status = 'running';

      // Act: Calculate worked time
      const workedTime = calculateWorkedTime(startTime, exactEndBreaks, status);

      // Assert: Worked time should be 30 minutes (60 elapsed - 30 break = 30 worked)
      expect(workedTime).toBe(30);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should return 0 when status is stopped', () => {
      const startTime = new Date('2025-11-05T09:00:00');
      const breaks: Break[] = [];
      const status = 'stopped';

      const workedTime = calculateWorkedTime(startTime, breaks, status);

      expect(workedTime).toBe(0);
    });

    it('should return 0 when startTime is null', () => {
      const startTime = null;
      const breaks: Break[] = [];
      const status = 'running';

      const workedTime = calculateWorkedTime(startTime, breaks, status);

      expect(workedTime).toBe(0);
    });

    it('should handle breaks with invalid dates', () => {
      const startTime = new Date('2025-11-05T09:00:00');
      const breaks: Break[] = [
        {
          start: new Date('invalid'),
          end: new Date('2025-11-05T09:30:00'),
          duration: 30,
        },
      ];
      const status = 'running';

      const workedTime = calculateWorkedTime(startTime, breaks, status);

      // Should not crash, should return worked time without invalid break
      expect(workedTime).toBeGreaterThanOrEqual(0);
    });
  });
});

