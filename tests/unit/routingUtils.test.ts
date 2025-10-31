/**
 * Unit Tests for Route Validation
 * 
 * Tests the routing utilities for direct URL access validation.
 * Ensures proper route validation and error handling.
 */

import { NavigationUtils } from '../../src/utils/navigationUtils';
import { VALID_ROUTES } from '../../src/interfaces/navigation';

describe('Route Validation', () => {
  describe('isValidRoute', () => {
    it('should validate valid routes', () => {
      VALID_ROUTES.forEach(route => {
        expect(NavigationUtils.isValidRoute(route)).toBe(true);
      });
    });

    it('should reject invalid routes', () => {
      const invalidRoutes = [
        '/invalid',
        '/nonexistent',
        '/admin',
        '/api/test',
        '/test/123',
        ''
      ];

      invalidRoutes.forEach(route => {
        expect(NavigationUtils.isValidRoute(route)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(NavigationUtils.isValidRoute('/')).toBe(true);
      expect(NavigationUtils.isValidRoute('/changelog')).toBe(true);
      expect(NavigationUtils.isValidRoute('/datenschutz')).toBe(true);
      expect(NavigationUtils.isValidRoute('/impressum')).toBe(true);
    });
  });

  describe('getRouteLabel', () => {
    it('should return correct German labels for valid routes', () => {
      expect(NavigationUtils.getRouteLabel('/')).toBe('Startseite');
      expect(NavigationUtils.getRouteLabel('/changelog')).toBe('Changelog');
      expect(NavigationUtils.getRouteLabel('/datenschutz')).toBe('Datenschutz');
      expect(NavigationUtils.getRouteLabel('/impressum')).toBe('Impressum');
      expect(NavigationUtils.getRouteLabel('/nutzungsbedingungen')).toBe('Nutzungsbedingungen');
      expect(NavigationUtils.getRouteLabel('/benutzereinstellungen')).toBe('Benutzereinstellungen');
    });

    it('should return fallback label for invalid routes', () => {
      expect(NavigationUtils.getRouteLabel('/invalid')).toBe('Unbekannte Seite');
      expect(NavigationUtils.getRouteLabel('/nonexistent')).toBe('Unbekannte Seite');
    });
  });

  describe('handleDirectAccess', () => {
    it('should validate direct access to valid routes', () => {
      VALID_ROUTES.forEach(route => {
        const result = NavigationUtils.handleDirectAccess(route);
        expect(result.isValid).toBe(true);
        expect(result.redirectPath).toBeUndefined();
        expect(result.error).toBeUndefined();
      });
    });

    it('should handle common redirects', () => {
      const redirects = [
        { from: '/start', to: '/' },
        { from: '/home', to: '/' },
        { from: '/index', to: '/' },
        { from: '/index.html', to: '/' }
      ];

      redirects.forEach(({ from, to }) => {
        const result = NavigationUtils.handleDirectAccess(from);
        expect(result.isValid).toBe(false);
        expect(result.redirectPath).toBe(to);
        expect(result.error).toBeUndefined();
      });
    });

    it('should return error for invalid routes', () => {
      const invalidRoutes = ['/invalid', '/admin', '/api/test'];

      invalidRoutes.forEach(route => {
        const result = NavigationUtils.handleDirectAccess(route);
        expect(result.isValid).toBe(false);
        expect(result.redirectPath).toBeUndefined();
        expect(result.error).toBe(`Ungültige Route: ${route}`);
      });
    });
  });

  describe('createBreadcrumb', () => {
    it('should create breadcrumb for home page', () => {
      const breadcrumb = NavigationUtils.createBreadcrumb('/');
      expect(breadcrumb).toHaveLength(1);
      expect(breadcrumb[0]).toEqual({ path: '/', label: 'Startseite' });
    });

    it('should create breadcrumb for other pages', () => {
      const breadcrumb = NavigationUtils.createBreadcrumb('/changelog');
      expect(breadcrumb).toHaveLength(2);
      expect(breadcrumb[0]).toEqual({ path: '/', label: 'Startseite' });
      expect(breadcrumb[1]).toEqual({ path: '/changelog', label: 'Changelog' });
    });

    it('should handle invalid routes in breadcrumb', () => {
      const breadcrumb = NavigationUtils.createBreadcrumb('/invalid');
      expect(breadcrumb).toHaveLength(2);
      expect(breadcrumb[0]).toEqual({ path: '/', label: 'Startseite' });
      expect(breadcrumb[1]).toEqual({ path: '/invalid', label: 'Unbekannte Seite' });
    });
  });

  describe('getNavigationSuggestions', () => {
    it('should return navigation suggestions', () => {
      const suggestions = NavigationUtils.getNavigationSuggestions();
      expect(suggestions).toHaveLength(4);
      
      expect(suggestions[0]).toEqual({
        path: '/',
        label: 'Startseite',
        description: 'Zurück zur Arbeitszeiterfassung'
      });
      
      expect(suggestions[1]).toEqual({
        path: '/changelog',
        label: 'Changelog',
        description: 'Neueste Änderungen anzeigen'
      });
    });

    it('should have German descriptions', () => {
      const suggestions = NavigationUtils.getNavigationSuggestions();
      suggestions.forEach(suggestion => {
        expect(suggestion.description).toMatch(/[äöüßÄÖÜ]/);
      });
    });
  });
});
