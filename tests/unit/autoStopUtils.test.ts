/**
 * Unit Tests for Auto-Stop Utilities
 * 
 * Tests the auto-stop utilities for User Story 3.
 * Ensures proper ArbZG compliance and automatic stopping logic.
 */

import { AutoStopUtils } from '../../src/utils/autoStopUtils';
import { AutoStopReason, AUTO_STOP_REASON_LABELS } from '../../src/interfaces/autoStop';

// Mock data for testing
const mockWorkTime = {
  startTime: new Date('2025-10-17T08:00:00'),
  endTime: null,
  breaks: [
    { start: new Date('2025-10-17T12:00:00'), end: new Date('2025-10-17T12:30:00') }
  ],
  totalWorkTime: 4 * 60, // 4 hours in minutes
  totalBreakTime: 30 // 30 minutes
};

const mockPlan = {
  name: 'Standard Plan',
  maxPresenceTime: 8 * 60, // 8 hours in minutes
  maxWorkTime: 8 * 60 // 8 hours in minutes
};

describe('Auto-Stop Utilities', () => {
  describe('ArbZG Compliance Validation', () => {
    it('should validate maximum work time (10 hours per ArbZG)', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 10 * 60 // 10 hours
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      expect(result.shouldStop).toBe(true);
      expect(result.reason).toBe(AutoStopReason.MAX_HOURS);
      expect(result.message).toContain('Maximale Arbeitszeit');
    });

    it('should validate break requirements (30min after 6h)', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 6 * 60, // 6 hours
        totalBreakTime: 25 // 25 minutes (insufficient)
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      expect(result.shouldStop).toBe(true);
      expect(result.reason).toBe(AutoStopReason.MAX_HOURS);
      expect(result.message).toContain('Pausenzeit');
    });

    it('should validate break requirements (45min after 9h)', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 9 * 60, // 9 hours
        totalBreakTime: 40 // 40 minutes (insufficient)
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      expect(result.shouldStop).toBe(true);
      expect(result.reason).toBe(AutoStopReason.MAX_HOURS);
      expect(result.message).toContain('Pausenzeit');
    });

    it('should not stop if work time is within limits', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 4 * 60, // 4 hours
        totalBreakTime: 30 // 30 minutes
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      expect(result.shouldStop).toBe(false);
    });
  });

  describe('Plan Compliance Validation', () => {
    it('should stop when plan max presence time is reached', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 6 * 60, // 6 hours
        totalBreakTime: 30 // 30 minutes
      };

      const plan = {
        ...mockPlan,
        maxPresenceTime: 6 * 60 // 6 hours
      };

      const result = AutoStopUtils.checkPlanCompliance(workTime, plan);
      expect(result.shouldStop).toBe(true);
      expect(result.reason).toBe(AutoStopReason.MAX_PRESENCE);
      expect(result.message).toContain('Anwesenheitszeit');
    });

    it('should stop when plan max work time is reached', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 8 * 60, // 8 hours
        totalBreakTime: 30 // 30 minutes
      };

      const plan = {
        ...mockPlan,
        maxWorkTime: 8 * 60 // 8 hours
      };

      const result = AutoStopUtils.checkPlanCompliance(workTime, plan);
      expect(result.shouldStop).toBe(true);
      expect(result.reason).toBe(AutoStopReason.MAX_HOURS);
      expect(result.message).toContain('Arbeitszeit');
    });

    it('should not stop if within plan limits', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 4 * 60, // 4 hours
        totalBreakTime: 30 // 30 minutes
      };

      const result = AutoStopUtils.checkPlanCompliance(workTime, mockPlan);
      expect(result.shouldStop).toBe(false);
    });
  });

  describe('Auto-Stop Event Creation', () => {
    it('should create valid auto-stop event', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 10 * 60 // 10 hours
      };

      const event = AutoStopUtils.createAutoStopEvent(
        AutoStopReason.MAX_HOURS,
        workTime,
        mockPlan,
        false // override not active
      );

      expect(event.id).toBeDefined();
      expect(event.reason).toBe(AutoStopReason.MAX_HOURS);
      expect(event.workTime).toBe(10 * 60);
      expect(event.planName).toBe('Standard Plan');
      expect(event.userAcknowledged).toBe(false);
      expect(event.overrideActive).toBe(false);
      expect(event.timestamp).toBeGreaterThan(0);
    });

    it('should generate unique IDs for events', () => {
      const event1 = AutoStopUtils.createAutoStopEvent(
        AutoStopReason.MAX_HOURS,
        mockWorkTime,
        mockPlan,
        false
      );

      const event2 = AutoStopUtils.createAutoStopEvent(
        AutoStopReason.MAX_PRESENCE,
        mockWorkTime,
        mockPlan,
        false
      );

      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('Timer Management', () => {
    it('should calculate next check interval', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 5 * 60 // 5 hours
      };

      const interval = AutoStopUtils.calculateNextCheckInterval(workTime);
      expect(interval).toBeGreaterThan(0);
      expect(interval).toBeLessThanOrEqual(60000); // Max 1 minute
    });

    it('should return shorter intervals when approaching limits', () => {
      const workTimeNearLimit = {
        ...mockWorkTime,
        totalWorkTime: 9.5 * 60 // 9.5 hours
      };

      const workTimeFarFromLimit = {
        ...mockWorkTime,
        totalWorkTime: 2 * 60 // 2 hours
      };

      const intervalNear = AutoStopUtils.calculateNextCheckInterval(workTimeNearLimit);
      const intervalFar = AutoStopUtils.calculateNextCheckInterval(workTimeFarFromLimit);

      expect(intervalNear).toBeLessThan(intervalFar);
    });
  });

  describe('German Language Requirements', () => {
    it('should provide German error messages', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 10 * 60 // 10 hours
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      expect(result.message).toMatch(/[äöüßÄÖÜ]/);
      expect(result.message).toContain('Arbeitszeit');
    });

    it('should use German labels for reasons', () => {
      expect(AUTO_STOP_REASON_LABELS[AutoStopReason.MAX_HOURS]).toBe('Maximale Arbeitszeit erreicht');
      expect(AUTO_STOP_REASON_LABELS[AutoStopReason.MAX_PRESENCE]).toBe('Maximale Anwesenheitszeit erreicht');
    });
  });

  describe('Edge Cases', () => {
    it('should handle midnight time boundary', () => {
      const workTime = {
        ...mockWorkTime,
        startTime: new Date('2025-10-17T22:00:00'), // 10 PM
        totalWorkTime: 2 * 60 // 2 hours (would cross midnight)
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      expect(result).toBeDefined();
      // Should handle day boundary correctly
    });

    it('should handle multiple browser tabs scenario', () => {
      // Simulate multiple tabs with different work times
      const workTime1 = {
        ...mockWorkTime,
        totalWorkTime: 4 * 60
      };

      const workTime2 = {
        ...mockWorkTime,
        totalWorkTime: 6 * 60
      };

      const result1 = AutoStopUtils.checkArbzgCompliance(workTime1);
      const result2 = AutoStopUtils.checkArbzgCompliance(workTime2);

      expect(result1.shouldStop).toBe(false);
      expect(result2.shouldStop).toBe(true);
    });

    it('should handle auto-stop during break periods', () => {
      const workTime = {
        ...mockWorkTime,
        totalWorkTime: 10 * 60, // 10 hours
        totalBreakTime: 30,
        isOnBreak: true // Currently on break
      };

      const result = AutoStopUtils.checkArbzgCompliance(workTime);
      // Should still stop even during break
      expect(result.shouldStop).toBe(true);
    });
  });
});
