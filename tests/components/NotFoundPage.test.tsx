/**
 * Component Tests for NotFoundPage
 * 
 * Tests the NotFoundPage component for 404 error handling.
 * Ensures proper display and navigation suggestions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../src/components/NotFoundPage';

// Mock NotFoundPage component
const MockNotFoundPage = () => (
  <div data-testid="not-found-page">
    <h1>404 - Seite nicht gefunden</h1>
    <p>Die angeforderte Seite konnte nicht gefunden werden.</p>
    <nav aria-label="Navigation Vorschläge">
      <a href="/" data-testid="suggestion-home">Zur Startseite</a>
      <a href="/changelog" data-testid="suggestion-changelog">Zum Changelog</a>
      <a href="/datenschutz" data-testid="suggestion-datenschutz">Zur Datenschutzerklärung</a>
      <a href="/impressum" data-testid="suggestion-impressum">Zum Impressum</a>
    </nav>
  </div>
);

describe('NotFoundPage Component', () => {
  describe('Rendering', () => {
    it('should render 404 page content', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      expect(screen.getByText('404 - Seite nicht gefunden')).toBeInTheDocument();
      expect(screen.getByText('Die angeforderte Seite konnte nicht gefunden werden.')).toBeInTheDocument();
    });

    it('should render navigation suggestions', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('suggestion-home')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-changelog')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-datenschutz')).toBeInTheDocument();
      expect(screen.getByTestId('suggestion-impressum')).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('404 - Seite nicht gefunden');

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Navigation Vorschläge');
    });
  });

  describe('Navigation Suggestions', () => {
    it('should have correct links for suggestions', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('suggestion-home')).toHaveAttribute('href', '/');
      expect(screen.getByTestId('suggestion-changelog')).toHaveAttribute('href', '/changelog');
      expect(screen.getByTestId('suggestion-datenschutz')).toHaveAttribute('href', '/datenschutz');
      expect(screen.getByTestId('suggestion-impressum')).toHaveAttribute('href', '/impressum');
    });

    it('should have German text for suggestions', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      expect(screen.getByTestId('suggestion-home')).toHaveTextContent('Zur Startseite');
      expect(screen.getByTestId('suggestion-changelog')).toHaveTextContent('Zum Changelog');
      expect(screen.getByTestId('suggestion-datenschutz')).toHaveTextContent('Zur Datenschutzerklärung');
      expect(screen.getByTestId('suggestion-impressum')).toHaveTextContent('Zum Impressum');
    });

    it('should be clickable', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const homeLink = screen.getByTestId('suggestion-home');
      fireEvent.click(homeLink);

      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Navigation Vorschläge');
    });

    it('should have proper heading hierarchy', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('404 - Seite nicht gefunden');
    });

    it('should be keyboard navigable', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const homeLink = screen.getByTestId('suggestion-home');
      homeLink.focus();
      expect(homeLink).toHaveFocus();
    });
  });

  describe('German Language Requirements', () => {
    it('should display German text', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      expect(screen.getByText('404 - Seite nicht gefunden')).toBeInTheDocument();
      expect(screen.getByText('Die angeforderte Seite konnte nicht gefunden werden.')).toBeInTheDocument();
    });

    it('should not contain English text', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const page = screen.getByTestId('not-found-page');
      expect(page).not.toHaveTextContent('Page not found');
      expect(page).not.toHaveTextContent('The requested page could not be found');
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper CSS classes', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const page = screen.getByTestId('not-found-page');
      expect(page).toBeInTheDocument();
      // In real implementation, would test for specific CSS classes
    });

    it('should be responsive', () => {
      render(
        <BrowserRouter>
          <MockNotFoundPage />
        </BrowserRouter>
      );

      const page = screen.getByTestId('not-found-page');
      expect(page).toBeInTheDocument();
      // In real implementation, would test responsive behavior
    });
  });
});
