/**
 * Unit Tests for Break Utilities
 * 
 * Tests the break utilities for User Story 2.
 * Ensures proper handling of active breaks, longest break selection, and break state management.
 */

import { getActiveBreak, getDisplayMode } from '../../src/utils/breakUtils';
import { Break } from '../../src/interfaces/break';

describe('Break Utilities', () => {
  describe('getActiveBreak', () => {
    it('should return null when no breaks are active', () => {
      // Arrange: Current time, no active breaks
      const currentTime = new Date('2025-11-05T10:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T08:00:00'),
          end: new Date('2025-11-05T09:00:00'), // Ended 1 hour ago
          duration: 60,
        },
        {
          start: new Date('2025-11-05T11:00:00'), // Starts in 1 hour
          end: new Date('2025-11-05T11:30:00'),
          duration: 30,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: No active break
      expect(activeBreak).toBeNull();
    });

    it('should return the active break when one break is active', () => {
      // Arrange: Current time, one active break
      const currentTime = new Date('2025-11-05T10:15:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Started 15 minutes ago
          end: new Date('2025-11-05T10:30:00'), // Ends in 15 minutes
          duration: 30,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: Active break returned
      expect(activeBreak).not.toBeNull();
      expect(activeBreak?.start).toEqual(new Date('2025-11-05T10:00:00'));
      expect(activeBreak?.end).toEqual(new Date('2025-11-05T10:30:00'));
    });

    it('should return the longest active break when multiple breaks are active (User Story 2)', () => {
      // Arrange: Current time, multiple active breaks
      const currentTime = new Date('2025-11-05T10:15:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'), // 30 minutes
          duration: 30,
        },
        {
          start: new Date('2025-11-05T10:10:00'),
          end: new Date('2025-11-05T10:45:00'), // 35 minutes (longest)
          duration: 35,
        },
        {
          start: new Date('2025-11-05T10:05:00'),
          end: new Date('2025-11-05T10:20:00'), // 15 minutes
          duration: 15,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: Longest active break returned (35 minutes)
      expect(activeBreak).not.toBeNull();
      expect(activeBreak?.start).toEqual(new Date('2025-11-05T10:10:00'));
      expect(activeBreak?.end).toEqual(new Date('2025-11-05T10:45:00'));
      expect(activeBreak?.duration).toBe(35);
    });

    it('should return the longest active break when multiple breaks have same start time', () => {
      // Arrange: Current time, multiple active breaks with same start time
      const currentTime = new Date('2025-11-05T10:15:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'), // 30 minutes
          duration: 30,
        },
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:45:00'), // 45 minutes (longest)
          duration: 45,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: Longest active break returned (45 minutes)
      expect(activeBreak).not.toBeNull();
      expect(activeBreak?.end).toEqual(new Date('2025-11-05T10:45:00'));
      expect(activeBreak?.duration).toBe(45);
    });

    it('should ignore breaks without start/end times', () => {
      // Arrange: Current time, breaks without start/end (planned breaks)
      const currentTime = new Date('2025-11-05T10:00:00');
      const breaks: Break[] = [
        {
          start: null,
          end: null,
          duration: 30, // Planned break
        },
        {
          start: new Date('2025-11-05T09:00:00'),
          end: new Date('2025-11-05T09:30:00'), // Ended 30 minutes ago
          duration: 30,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: No active break (planned break ignored, completed break not active)
      expect(activeBreak).toBeNull();
    });

    it('should ignore breaks with invalid dates', () => {
      // Arrange: Current time, breaks with invalid dates
      const currentTime = new Date('2025-11-05T10:00:00');
      const breaks: Break[] = [
        {
          start: new Date('invalid'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
        {
          start: new Date('2025-11-05T09:00:00'),
          end: new Date('invalid'),
          duration: 30,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: No active break (invalid dates ignored)
      expect(activeBreak).toBeNull();
    });

    it('should handle breaks exactly at current time', () => {
      // Arrange: Current time exactly at break start
      const currentTime = new Date('2025-11-05T10:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Exactly now
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: Active break returned (break starts exactly now)
      expect(activeBreak).not.toBeNull();
      expect(activeBreak?.start).toEqual(new Date('2025-11-05T10:00:00'));
    });

    it('should not return break when current time equals break end time', () => {
      // Arrange: Current time exactly at break end
      const currentTime = new Date('2025-11-05T10:30:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'), // Exactly now
          duration: 30,
        },
      ];

      // Act: Get active break
      const activeBreak = getActiveBreak(breaks, currentTime);

      // Assert: No active break (break ended exactly now)
      expect(activeBreak).toBeNull();
    });
  });

  describe('getDisplayMode', () => {
    it('should return "break" when active break is present', () => {
      // Arrange: Active break
      const activeBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };

      // Act: Get display mode
      const displayMode = getDisplayMode(activeBreak);

      // Assert: Display mode is "break"
      expect(displayMode).toBe('break');
    });

    it('should return "work" when no active break is present', () => {
      // Arrange: No active break
      const activeBreak = null;

      // Act: Get display mode
      const displayMode = getDisplayMode(activeBreak);

      // Assert: Display mode is "work"
      expect(displayMode).toBe('work');
    });
  });
});

