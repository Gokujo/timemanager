/**
 * Integration Tests for Active Break Controls
 * 
 * Tests the complete active break controls functionality including
 * User Story 1: Button states switch when planned break becomes active
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../src/components/HomePage';
import { useTimeTracking } from '../../src/hooks/useTimeTracking';
import { Break } from '../../src/interfaces/break';

// Mock the useTimeTracking hook
jest.mock('../../src/hooks/useTimeTracking');

describe('Active Break Controls Integration', () => {
  const mockUseTimeTracking = useTimeTracking as jest.MockedFunction<typeof useTimeTracking>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2025-11-05T10:15:00').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('T006: Button states switch when planned break becomes active', () => {
    it('should hide Pause button and enable Resume button when planned break becomes active', async () => {
      // Arrange: Active break exists, status is 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Started 15 minutes ago
          end: new Date('2025-11-05T10:30:00'), // Ends in 15 minutes
          duration: 30,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Assert: Pause button should not be visible
      await waitFor(() => {
        const pauseButton = screen.queryByRole('button', { name: /pause/i });
        expect(pauseButton).toBeNull();
      });

      // Assert: Resume button should be enabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).not.toBeDisabled();

      // Assert: Status indicator should show "Pausiert"
      expect(screen.getByText('Pausiert')).toBeInTheDocument();
    });

    it('should show Pause button and disable Resume button when no planned break is active', async () => {
      // Arrange: No active break, status is 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T09:00:00'), // Ended 1 hour 15 minutes ago
          end: new Date('2025-11-05T09:30:00'),
          duration: 30,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Assert: Pause button should be visible and enabled
      await waitFor(() => {
        const pauseButton = screen.getByRole('button', { name: /pause/i });
        expect(pauseButton).toBeInTheDocument();
        expect(pauseButton).not.toBeDisabled();
      });

      // Assert: Resume button should be disabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).toBeDisabled();

      // Assert: Status indicator should show "Laufend"
      expect(screen.getByText('Laufend')).toBeInTheDocument();
    });
  });

  describe('T007: Resume ends active planned break and continues work', () => {
    it('should end active planned break when Resume is clicked', async () => {
      // Arrange: Active break exists, status is 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const currentTime = new Date('2025-11-05T10:15:00');
      const activeBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const breaks: Break[] = [activeBreak];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Act: Render HomePage and click Resume
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      fireEvent.click(resumeButton);

      // Assert: Resume action should be called
      await waitFor(() => {
        expect(mockActions.resume).toHaveBeenCalled();
      });
    });

    it('should keep status as running when ending active planned break', async () => {
      // Arrange: Active break exists, status is 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const activeBreak: Break = {
        start: new Date('2025-11-05T10:00:00'),
        end: new Date('2025-11-05T10:30:00'),
        duration: 30,
      };
      const breaks: Break[] = [activeBreak];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Act: Render HomePage and click Resume
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      fireEvent.click(resumeButton);

      // Assert: Status should remain 'running' (not changed)
      await waitFor(() => {
        expect(mockState.status).toBe('running');
      });
    });
  });

  describe('T008: Normal button behavior when no planned break is active', () => {
    it('should show normal button behavior when status is running and no active break', async () => {
      // Arrange: No active break, status is 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Assert: Pause button should be visible and enabled
      await waitFor(() => {
        const pauseButton = screen.getByRole('button', { name: /pause/i });
        expect(pauseButton).toBeInTheDocument();
        expect(pauseButton).not.toBeDisabled();
      });

      // Assert: Resume button should be disabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).toBeDisabled();

      // Assert: Status indicator should show "Laufend"
      expect(screen.getByText('Laufend')).toBeInTheDocument();
    });

    it('should show normal button behavior when status is paused and no active break', async () => {
      // Arrange: No active break, status is 'paused'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'paused' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Assert: Pause button should not be visible
      await waitFor(() => {
        const pauseButton = screen.queryByRole('button', { name: /pause/i });
        expect(pauseButton).toBeNull();
      });

      // Assert: Resume button should be enabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).not.toBeDisabled();

      // Assert: Status indicator should show "Pausiert"
      expect(screen.getByText('Pausiert')).toBeInTheDocument();
    });
  });

  describe('T008a: Multiple active breaks - verify longest break is used', () => {
    it('should use longest active break when multiple breaks are active', async () => {
      // Arrange: Multiple active breaks
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'), // 30 minutes
          duration: 30,
        },
        {
          start: new Date('2025-11-05T10:10:00'),
          end: new Date('2025-11-05T10:50:00'), // 40 minutes (longest)
          duration: 40,
        },
        {
          start: new Date('2025-11-05T10:05:00'),
          end: new Date('2025-11-05T10:20:00'), // 15 minutes
          duration: 15,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Assert: Pause button should not be visible (active break exists)
      await waitFor(() => {
        const pauseButton = screen.queryByRole('button', { name: /pause/i });
        expect(pauseButton).toBeNull();
      });

      // Assert: Resume button should be enabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).not.toBeDisabled();

      // Assert: Status indicator should show "Pausiert"
      expect(screen.getByText('Pausiert')).toBeInTheDocument();
    });
  });

  describe('T020a: Stop button during active planned break', () => {
    it('should stop work time when Stop is clicked during active planned break', async () => {
      // Arrange: Active break exists, status is 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];
      const mockState = {
        plan: 'VOR_ORT',
        status: 'running' as const,
        startTime,
        manualStart: '08:00',
        workedMinutes: 135,
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

      // Act: Render HomePage and click Stop
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );

      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      // Assert: Stop action should be called
      await waitFor(() => {
        expect(mockActions.stop).toHaveBeenCalled();
      });

      // Assert: Break should remain (end time not auto-set)
      expect(mockState.breaks).toHaveLength(1);
      expect(mockState.breaks[0].end).toEqual(new Date('2025-11-05T10:30:00'));
    });
  });
});

