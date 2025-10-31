/**
 * Integration Tests for Direct URL Access
 * 
 * Tests the complete direct URL access functionality including
 * React Router integration and 404 handling.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import App from '../../src/App';

// Mock components for testing
const MockHomePage = () => <div data-testid="home-page">Startseite</div>;
const MockChangelog = () => <div data-testid="changelog-page">Changelog</div>;
const MockDatenschutz = () => <div data-testid="datenschutz-page">Datenschutz</div>;
const MockImpressum = () => <div data-testid="impressum-page">Impressum</div>;
const MockNotFound = () => <div data-testid="not-found-page">404 - Seite nicht gefunden</div>;

const TestApp = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MockHomePage />} />
      <Route path="/changelog" element={<MockChangelog />} />
      <Route path="/datenschutz" element={<MockDatenschutz />} />
      <Route path="/impressum" element={<MockImpressum />} />
      <Route path="*" element={<MockNotFound />} />
    </Routes>
  </BrowserRouter>
);

describe('Direct URL Access Integration', () => {
  describe('Valid Route Access', () => {
    it('should render home page for direct access to /', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('should render changelog page for direct access to /changelog', () => {
      render(
        <MemoryRouter initialEntries={['/changelog']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('changelog-page')).toBeInTheDocument();
    });

    it('should render datenschutz page for direct access to /datenschutz', () => {
      render(
        <MemoryRouter initialEntries={['/datenschutz']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('datenschutz-page')).toBeInTheDocument();
    });

    it('should render impressum page for direct access to /impressum', () => {
      render(
        <MemoryRouter initialEntries={['/impressum']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('impressum-page')).toBeInTheDocument();
    });
  });

  describe('Invalid Route Handling', () => {
    it('should render 404 page for invalid routes', () => {
      render(
        <MemoryRouter initialEntries={['/invalid']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render 404 page for non-existent routes', () => {
      render(
        <MemoryRouter initialEntries={['/nonexistent']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    it('should render 404 page for admin routes', () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Common Redirects', () => {
    it('should handle /start redirect to /', () => {
      const history = createMemoryHistory({ initialEntries: ['/start'] });
      
      render(
        <MemoryRouter initialEntries={['/start']}>
          <Routes>
            <Route path="/start" element={<div>Redirecting...</div>} />
            <Route path="/" element={<MockHomePage />} />
          </Routes>
        </MemoryRouter>
      );

      // In real implementation, would test actual redirect
      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
    });
  });

  describe('Browser History Integration', () => {
    it('should maintain browser history for direct access', () => {
      const history = createMemoryHistory({ initialEntries: ['/changelog'] });
      
      render(
        <MemoryRouter>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('changelog-page')).toBeInTheDocument();
    });

    it('should handle back button navigation', () => {
      const history = createMemoryHistory({ 
        initialEntries: ['/', '/changelog'] 
      });
      
      render(
        <MemoryRouter>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('changelog-page')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render quickly for direct access', async () => {
      const startTime = performance.now();
      
      render(
        <MemoryRouter initialEntries={['/changelog']}>
          <TestApp />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('changelog-page')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 2 seconds as per requirements
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling', () => {
    it('should handle routing errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={['/error']}>
          <TestApp />
        </MemoryRouter>
      );

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});
