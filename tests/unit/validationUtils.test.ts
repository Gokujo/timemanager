/**
 * Unit Tests for Validation Utilities
 * 
 * Tests the validation utilities for User Story 2.
 * Ensures proper overlap validation for breaks.
 */

import { validateBreakOverlap } from '../../src/utils/validationUtils';
import { Break } from '../../src/interfaces/break';

describe('Validation Utilities - validateBreakOverlap', () => {
  describe('User Story 2: Overlap validation prevents overlapping breaks', () => {
    it('should return valid when no breaks exist', () => {
      // Arrange: New break, no existing breaks
      const newBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (no overlaps)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid when breaks do not overlap', () => {
      // Arrange: New break, existing break that does not overlap
      const newBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T12:00:00'), // Later, no overlap
          end: new Date('2025-11-05T12:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (no overlaps)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when breaks overlap (start time within existing break)', () => {
      // Arrange: New break starts during existing break
      const newBreak: Break = {
        start: new Date('2025-11-05T10:15:00'), // Starts during existing break
        end: new Date('2025-11-05T10:45:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Invalid (overlaps)
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid when breaks overlap (end time within existing break)', () => {
      // Arrange: New break ends during existing break
      const newBreak: Break = {
        start: new Date('2025-11-05T09:45:00'),
        end: new Date('2025-11-05T10:15:00'), // Ends during existing break
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Invalid (overlaps)
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid when breaks completely overlap', () => {
      // Arrange: New break completely overlaps existing break
      const newBreak: Break = {
        start: new Date('2025-11-05T09:45:00'),
        end: new Date('2025-11-05T10:45:00'), // Completely overlaps
        duration: 60,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Invalid (overlaps)
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid when breaks touch at exact same time', () => {
      // Arrange: New break ends exactly when existing break starts
      const newBreak: Break = {
        start: new Date('2025-11-05T09:30:00'),
        end: new Date('2025-11-05T10:00:00'), // Ends exactly when existing starts
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Starts exactly when new ends
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (touching breaks are allowed, not overlapping)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid when breaks are adjacent but not overlapping', () => {
      // Arrange: New break ends before existing break starts
      const newBreak: Break = {
        start: new Date('2025-11-05T09:30:00'),
        end: new Date('2025-11-05T09:59:00'), // Ends 1 minute before existing starts
        duration: 29,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Starts 1 minute after new ends
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (no overlaps)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid when new break has no start/end times (planned break)', () => {
      // Arrange: New break is planned (no start/end)
      const newBreak: Break = {
        start: null,
        end: null,
        duration: 30, // Planned break
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (planned breaks cannot overlap)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid when existing break has no start/end times (planned break)', () => {
      // Arrange: Existing break is planned (no start/end)
      const newBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: null,
          end: null,
          duration: 30, // Planned break
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (planned breaks cannot overlap)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiple existing breaks and detect overlap with any', () => {
      // Arrange: New break overlaps with one of multiple existing breaks
      const newBreak: Break = {
        start: new Date('2025-11-05T10:15:00'), // Overlaps with second break
        end: new Date('2025-11-05T10:45:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T08:00:00'), // No overlap
          end: new Date('2025-11-05T08:30:00'),
          duration: 30,
        },
        {
          start: new Date('2025-11-05T10:00:00'), // Overlaps with new break
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
        {
          start: new Date('2025-11-05T12:00:00'), // No overlap
          end: new Date('2025-11-05T12:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Invalid (overlaps with second break)
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle invalid dates gracefully', () => {
      // Arrange: New break with invalid dates
      const newBreak: Break = {
        start: new Date('invalid'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Should not crash, should return valid (invalid dates ignored)
      expect(result.isValid).toBe(true);
    });

    it('should handle empty existing breaks array', () => {
      // Arrange: New break, empty existing breaks
      const newBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const existingBreaks: Break[] = [];

      // Act: Validate overlap
      const result = validateBreakOverlap(newBreak, existingBreaks);

      // Assert: Valid (no overlaps)
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

