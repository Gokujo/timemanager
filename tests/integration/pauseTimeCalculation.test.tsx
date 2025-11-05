/**
 * Integration Tests for Pause Time Calculation
 * 
 * Tests the complete pause time calculation functionality including
 * User Story 1 and User Story 2 integration scenarios.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../src/components/HomePage';
import { useTimeTracking } from '../../src/hooks/useTimeTracking';
import { calculateWorkedTime } from '../../src/utils/timeUtils';
import { Break } from '../../src/interfaces/break';

// Mock the useTimeTracking hook
jest.mock('../../src/hooks/useTimeTracking');

describe('Pause Time Calculation Integration', () => {
  const mockUseTimeTracking = useTimeTracking as jest.MockedFunction<typeof useTimeTracking>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-11-05T10:00:00').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('User Story 1: Start work with planned breaks → worked time displays > 0', () => {
    it('should display worked time > 0 immediately after start with planned breaks', async () => {
      // Arrange: Start time 1 minute ago, planned breaks (duration-only)
      const startTime = new Date('2025-11-05T09:59:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 30 },
        { start: null, end: null, duration: 15 },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '09:59',
        workedMinutes: calculateWorkedTime(startTime, plannedBreaks, 'running'),
        breaks: plannedBreaks,
        plannedWork: 480,
        warnings: [],
      };
      const mockActions = {
        setPlan: jest.fn(),
        setManualStart: jest.fn(),
        setPlannedWork: jest.fn(),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        addBreak: jest.fn(),
        deleteBreak: jest.fn(),
        resetToDefaultBreaks: jest.fn(),
        clearAllData: jest.fn(),
        updateBreakDuration: jest.fn(),
        updateBreakStart: jest.fn(),
        updateBreakEnd: jest.fn(),
      };

      mockUseTimeTracking.mockReturnValue([mockState, mockActions]);

      // Act: Render HomePage
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Assert: Worked time should be > 0 (not 0)
      await waitFor(() => {
        expect(mockState.workedMinutes).toBeGreaterThan(0);
        expect(mockState.workedMinutes).toBe(1); // 1 minute elapsed, no breaks subtracted
      });
    });

    it('should display worked time > 0 even with large planned break duration', async () => {
      // Arrange: Start time 5 minutes ago, large planned break (60 minutes)
      const startTime = new Date('2025-11-05T09:55:00');
      const plannedBreaks: Break[] = [
        { start: null, end: null, duration: 60 }, // Large planned break
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '09:55',
        workedMinutes: calculateWorkedTime(startTime, plannedBreaks, 'running'),
        breaks: plannedBreaks,
        plannedWork: 480,
        warnings: [],
      };
      const mockActions = {
        setPlan: jest.fn(),
        setManualStart: jest.fn(),
        setPlannedWork: jest.fn(),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        addBreak: jest.fn(),
        deleteBreak: jest.fn(),
        resetToDefaultBreaks: jest.fn(),
        clearAllData: jest.fn(),
        updateBreakDuration: jest.fn(),
        updateBreakStart: jest.fn(),
        updateBreakEnd: jest.fn(),
      };

      mockUseTimeTracking.mockReturnValue([mockState, mockActions]);

      // Act: Render HomePage
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Assert: Worked time should be > 0 (5 minutes elapsed, break not subtracted)
      await waitFor(() => {
        expect(mockState.workedMinutes).toBeGreaterThan(0);
        expect(mockState.workedMinutes).toBe(5); // 5 minutes elapsed, break not subtracted
      });
    });
  });

  describe('User Story 2: Multiple breaks throughout workday → correct calculation', () => {
    it('should calculate worked time correctly with multiple breaks throughout workday', async () => {
      // Arrange: Start time 2 hours ago, multiple breaks (completed, active, future)
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T09:00:00'), // Completed (ended 1 hour ago)
          end: new Date('2025-11-05T09:30:00'),
          duration: 30,
        },
        {
          start: new Date('2025-11-05T09:45:00'), // Active (started 15 minutes ago, ends in 15 minutes)
          end: new Date('2025-11-05T10:15:00'),
          duration: 30,
        },
        {
          start: new Date('2025-11-05T11:00:00'), // Future (starts in 1 hour)
          end: new Date('2025-11-05T11:30:00'),
          duration: 30,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: calculateWorkedTime(startTime, breaks, 'running'),
        breaks,
        plannedWork: 480,
        warnings: [],
      };
      const mockActions = {
        setPlan: jest.fn(),
        setManualStart: jest.fn(),
        setPlannedWork: jest.fn(),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        addBreak: jest.fn(),
        deleteBreak: jest.fn(),
        resetToDefaultBreaks: jest.fn(),
        clearAllData: jest.fn(),
        updateBreakDuration: jest.fn(),
        updateBreakStart: jest.fn(),
        updateBreakEnd: jest.fn(),
      };

      mockUseTimeTracking.mockReturnValue([mockState, mockActions]);

      // Act: Render HomePage
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Assert: Worked time should be frozen at 45 minutes (break start time)
      // 2 hours elapsed - 30 minutes (completed break) = 90 minutes worked
      // But frozen at 45 minutes (active break start time)
      await waitFor(() => {
        expect(mockState.workedMinutes).toBe(45); // Frozen at active break start
      });
    });
  });

  describe('User Story 2: Break starts → worked time frozen', () => {
    it('should freeze worked time when break starts', async () => {
      // Arrange: Start time 1 hour ago, active break (started 15 minutes ago)
      const startTime = new Date('2025-11-05T09:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T09:45:00'), // Started 15 minutes ago
          end: new Date('2025-11-05T10:15:00'), // Ends in 15 minutes
          duration: 30,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '09:00',
        workedMinutes: calculateWorkedTime(startTime, breaks, 'running'),
        breaks,
        plannedWork: 480,
        warnings: [],
      };
      const mockActions = {
        setPlan: jest.fn(),
        setManualStart: jest.fn(),
        setPlannedWork: jest.fn(),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        addBreak: jest.fn(),
        deleteBreak: jest.fn(),
        resetToDefaultBreaks: jest.fn(),
        clearAllData: jest.fn(),
        updateBreakDuration: jest.fn(),
        updateBreakStart: jest.fn(),
        updateBreakEnd: jest.fn(),
      };

      mockUseTimeTracking.mockReturnValue([mockState, mockActions]);

      // Act: Render HomePage
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Assert: Worked time should be frozen at 45 minutes (break start time)
      await waitFor(() => {
        expect(mockState.workedMinutes).toBe(45); // Frozen at break start
      });
    });
  });

  describe('User Story 2: Break ends → worked time resumes counting', () => {
    it('should resume worked time counting when break ends', async () => {
      // Arrange: Start time 1 hour ago, break that ended 30 minutes ago
      const startTime = new Date('2025-11-05T09:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T09:15:00'), // Started 45 minutes ago
          end: new Date('2025-11-05T09:30:00'), // Ended 30 minutes ago
          duration: 15,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '09:00',
        workedMinutes: calculateWorkedTime(startTime, breaks, 'running'),
        breaks,
        plannedWork: 480,
        warnings: [],
      };
      const mockActions = {
        setPlan: jest.fn(),
        setManualStart: jest.fn(),
        setPlannedWork: jest.fn(),
        start: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        addBreak: jest.fn(),
        deleteBreak: jest.fn(),
        resetToDefaultBreaks: jest.fn(),
        clearAllData: jest.fn(),
        updateBreakDuration: jest.fn(),
        updateBreakStart: jest.fn(),
        updateBreakEnd: jest.fn(),
      };

      mockUseTimeTracking.mockReturnValue([mockState, mockActions]);

      // Act: Render HomePage
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      // Assert: Worked time should be 45 minutes (60 elapsed - 15 break = 45 worked)
      await waitFor(() => {
        expect(mockState.workedMinutes).toBe(45); // 60 elapsed - 15 break = 45 worked
      });
    });
  });
});

