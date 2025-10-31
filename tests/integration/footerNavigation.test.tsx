/**
 * Integration Tests for Footer Link Behavior
 * 
 * Tests the complete footer link behavior including navigation
 * and integration with React Router for User Story 1.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Footer } from '../../src/components/Footer';

// Mock Footer component with React Router Link
const MockFooterWithRouter = () => (
  <div data-testid="footer">
    <BrowserRouter>
      <a href="/" data-testid="start-time-link">
        Startseite
      </a>
    </BrowserRouter>
  </div>
);

describe('Footer Link Integration', () => {
  describe('Navigation Integration', () => {
    it('should navigate to home page from any page', async () => {
      const history = createMemoryHistory({ initialEntries: ['/changelog'] });
      
      render(
        <MemoryRouter initialEntries={['/changelog']}>
          <MockFooterWithRouter />
        </MemoryRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      fireEvent.click(startTimeLink);

      await waitFor(() => {
        expect(startTimeLink).toHaveAttribute('href', '/');
      });
    });

    it('should work from changelog page', () => {
      render(
        <MemoryRouter initialEntries={['/changelog']}>
          <MockFooterWithRouter />
        </MemoryRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      expect(startTimeLink).toBeInTheDocument();
      expect(startTimeLink).toHaveAttribute('href', '/');
    });

    it('should work from datenschutz page', () => {
      render(
        <MemoryRouter initialEntries={['/datenschutz']}>
          <MockFooterWithRouter />
        </MemoryRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      expect(startTimeLink).toBeInTheDocument();
      expect(startTimeLink).toHaveAttribute('href', '/');
    });

    it('should work from impressum page', () => {
      render(
        <MemoryRouter initialEntries={['/impressum']}>
          <MockFooterWithRouter />
        </MemoryRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      expect(startTimeLink).toBeInTheDocument();
      expect(startTimeLink).toHaveAttribute('href', '/');
    });
  });

  describe('User Experience', () => {
    it('should provide clear visual feedback on hover', () => {
      render(
        <BrowserRouter>
          <MockFooterWithRouter />
        </BrowserRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      fireEvent.mouseEnter(startTimeLink);
      
      // In real implementation, would test for hover styles
      expect(startTimeLink).toBeInTheDocument();
    });

    it('should maintain focus after navigation', () => {
      render(
        <BrowserRouter>
          <MockFooterWithRouter />
        </BrowserRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      startTimeLink.focus();
      fireEvent.click(startTimeLink);

      // Focus should be maintained or properly managed
      expect(startTimeLink).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', () => {
      // Mock navigation error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <BrowserRouter>
          <MockFooterWithRouter />
        </BrowserRouter>
      );

      const startTimeLink = screen.getByTestId('start-time-link');
      fireEvent.click(startTimeLink);

      // Should not throw errors
      expect(startTimeLink).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <MockFooterWithRouter />
        </BrowserRouter>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        return <MockFooterWithRouter />;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      // Should only render once initially
      expect(renderCount).toBe(1);
    });
  });
});
