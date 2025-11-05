/**
 * Unit Tests for Controls Component
 * 
 * Tests the Controls component for User Story 1: Active Break Controls
 * Ensures button states and status indicator work correctly with active breaks.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Controls from '../../src/components/Controls';
import { Break } from '../../src/interfaces/break';

describe('Controls Component - Active Break Controls', () => {
  const mockOnStart = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnResume = jest.fn();
  const mockOnStop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date to return consistent current time
    jest.spyOn(global, 'Date').mockImplementation(() => new Date('2025-11-05T10:15:00') as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('T001: Button states when active break exists', () => {
    it('should hide Pause button and enable Resume button when active break exists', () => {
      // Arrange: Active break (start in past, end in future)
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'), // Started 15 minutes ago
          end: new Date('2025-11-05T10:30:00'), // Ends in 15 minutes
          duration: 30,
        },
      ];

      // Act: Render Controls with active break
      render(
        <Controls
          status="running"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Pause button should not be visible
      const pauseButton = screen.queryByRole('button', { name: /pause/i });
      expect(pauseButton).toBeNull();

      // Assert: Resume button should be enabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).not.toBeDisabled();
    });

    it('should enable Resume button even when status is running if active break exists', () => {
      // Arrange: Active break with status 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Render Controls with active break and status 'running'
      render(
        <Controls
          status="running"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Resume button should be enabled (normally disabled when status is 'running')
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).not.toBeDisabled();
    });
  });

  describe('T002: Button states when no active break exists', () => {
    it('should show Pause button when status is running and no active break exists', () => {
      // Arrange: No active breaks, status 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T09:00:00'), // Ended 1 hour 15 minutes ago
          end: new Date('2025-11-05T09:30:00'),
          duration: 30,
        },
      ];

      // Act: Render Controls without active break
      render(
        <Controls
          status="running"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Pause button should be visible and enabled
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      expect(pauseButton).toBeInTheDocument();
      expect(pauseButton).not.toBeDisabled();

      // Assert: Resume button should be disabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).toBeDisabled();
    });

    it('should show Resume button when status is paused and no active break exists', () => {
      // Arrange: No active breaks, status 'paused'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [];

      // Act: Render Controls with status 'paused'
      render(
        <Controls
          status="paused"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Resume button should be enabled
      const resumeButton = screen.getByRole('button', { name: /fortsetzen/i });
      expect(resumeButton).not.toBeDisabled();

      // Assert: Pause button should not be visible
      const pauseButton = screen.queryByRole('button', { name: /pause/i });
      expect(pauseButton).toBeNull();
    });
  });

  describe('T003: Status indicator shows "Pausiert" when active break exists', () => {
    it('should display "Pausiert" (yellow) status indicator when active break exists even if status is running', () => {
      // Arrange: Active break with status 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [
        {
          start: new Date('2025-11-05T10:00:00'),
          end: new Date('2025-11-05T10:30:00'),
          duration: 30,
        },
      ];

      // Act: Render Controls with active break and status 'running'
      render(
        <Controls
          status="running"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Status indicator should show "Pausiert"
      const statusText = screen.getByText(/status:/i);
      expect(statusText).toBeInTheDocument();
      expect(screen.getByText('Pausiert')).toBeInTheDocument();

      // Assert: Status indicator should have yellow color (status-yellow class)
      const statusIndicator = screen.getByText('Pausiert');
      expect(statusIndicator).toHaveClass('status-yellow');
    });

    it('should display "Laufend" (green) status indicator when no active break and status is running', () => {
      // Arrange: No active breaks, status 'running'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [];

      // Act: Render Controls without active break and status 'running'
      render(
        <Controls
          status="running"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Status indicator should show "Laufend"
      expect(screen.getByText('Laufend')).toBeInTheDocument();

      // Assert: Status indicator should have green color (status-green class)
      const statusIndicator = screen.getByText('Laufend');
      expect(statusIndicator).toHaveClass('status-green');
    });

    it('should display "Pausiert" (yellow) status indicator when status is paused', () => {
      // Arrange: Status 'paused'
      const startTime = new Date('2025-11-05T08:00:00');
      const breaks: Break[] = [];

      // Act: Render Controls with status 'paused'
      render(
        <Controls
          status="paused"
          breaks={breaks}
          startTime={startTime}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onResume={mockOnResume}
          onStop={mockOnStop}
        />
      );

      // Assert: Status indicator should show "Pausiert"
      expect(screen.getByText('Pausiert')).toBeInTheDocument();

      // Assert: Status indicator should have yellow color (status-yellow class)
      const statusIndicator = screen.getByText('Pausiert');
      expect(statusIndicator).toHaveClass('status-yellow');
    });
  });
});

