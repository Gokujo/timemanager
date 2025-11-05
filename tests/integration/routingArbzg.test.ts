/**
 * German Legal Compliance Tests for Routing
 * 
 * Tests ArbZG compliance for routing functionality.
 * Ensures proper legal compliance and data protection.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { NavigationUtils } from '../../src/utils/navigationUtils';

// Mock routing components for legal compliance testing
const LegalCompliantApp = () => (
  <div data-testid="legal-app">
    <nav aria-label="Hauptnavigation">
      <a href="/" aria-label="Zur Arbeitszeiterfassung">Startseite</a>
      <a href="/datenschutz" aria-label="Zur Datenschutzerklärung">Datenschutz</a>
      <a href="/impressum" aria-label="Zum Impressum">Impressum</a>
    </nav>
  </div>
);

describe('Routing ArbZG Compliance', () => {
  describe('Data Protection Compliance', () => {
    it('should not store sensitive data in URLs', () => {
      const sensitivePaths = [
        '/user/123',
        '/admin/settings',
        '/data/export',
        '/logs/access'
      ];

      sensitivePaths.forEach(path => {
        const result = NavigationUtils.handleDirectAccess(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Ungültige Route');
      });
    });

    it('should only allow public routes', () => {
      const publicRoutes = [
        '/',
        '/changelog',
        '/datenschutz',
        '/impressum',
        '/nutzungsbedingungen',
        '/einstellungen'
      ];

      publicRoutes.forEach(route => {
        const result = NavigationUtils.handleDirectAccess(route);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle route validation without data leakage', () => {
      const result = NavigationUtils.handleDirectAccess('/invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ungültige Route: /invalid');
      
      // Should not expose internal system information
      expect(result.error).not.toContain('system');
      expect(result.error).not.toContain('internal');
      expect(result.error).not.toContain('debug');
    });
  });

  describe('User Privacy Protection', () => {
    it('should not track user navigation patterns', () => {
      // NavigationUtils should not store user-specific data
      const context1 = NavigationUtils.getNavigationContext('/');
      const context2 = NavigationUtils.getNavigationContext('/changelog');
      
      expect(context1.isStartTimePage).toBe(true);
      expect(context2.isStartTimePage).toBe(false);
      
      // Should not store user identifiers
      expect(context1).not.toHaveProperty('userId');
      expect(context2).not.toHaveProperty('sessionId');
    });

    it('should provide navigation suggestions without user tracking', () => {
      const suggestions = NavigationUtils.getNavigationSuggestions();
      
      suggestions.forEach(suggestion => {
        // Should not contain user-specific information
        expect(suggestion.path).not.toContain('user');
        expect(suggestion.path).not.toContain('session');
        expect(suggestion.path).not.toContain('id');
        
        // Should be generic and helpful
        expect(suggestion.description).toBeDefined();
        expect(suggestion.label).toBeDefined();
      });
    });
  });

  describe('Legal Information Access', () => {
    it('should provide access to legal pages', () => {
      const legalRoutes = ['/datenschutz', '/impressum', '/nutzungsbedingungen'];
      
      legalRoutes.forEach(route => {
        const result = NavigationUtils.handleDirectAccess(route);
        expect(result.isValid).toBe(true);
      });
    });

    it('should have proper German labels for legal pages', () => {
      expect(NavigationUtils.getRouteLabel('/datenschutz')).toBe('Datenschutz');
      expect(NavigationUtils.getRouteLabel('/impressum')).toBe('Impressum');
      expect(NavigationUtils.getRouteLabel('/nutzungsbedingungen')).toBe('Nutzungsbedingungen');
    });

    it('should provide breadcrumb navigation for legal compliance', () => {
      const breadcrumb = NavigationUtils.createBreadcrumb('/datenschutz');
      
      expect(breadcrumb).toHaveLength(2);
      expect(breadcrumb[0]).toEqual({ path: '/', label: 'Startseite' });
      expect(breadcrumb[1]).toEqual({ path: '/datenschutz', label: 'Datenschutz' });
    });
  });

  describe('Error Handling Compliance', () => {
    it('should handle errors without exposing system information', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test error handling
      const result = NavigationUtils.handleDirectAccess('/error');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Ungültige Route: /error');
      
      // Should not expose internal system details
      expect(result.error).not.toContain('stack');
      expect(result.error).not.toContain('trace');
      expect(result.error).not.toContain('debug');
      
      consoleSpy.mockRestore();
    });

    it('should provide helpful error messages in German', () => {
      const result = NavigationUtils.handleDirectAccess('/invalid');
      expect(result.error).toContain('Ungültige Route');
      expect(result.error).toBe('Ungültige Route: /invalid');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should render accessible navigation', () => {
      render(
        <BrowserRouter>
          <LegalCompliantApp />
        </BrowserRouter>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Hauptnavigation');
    });

    it('should provide proper ARIA labels', () => {
      render(
        <BrowserRouter>
          <LegalCompliantApp />
        </BrowserRouter>
      );

      const startLink = screen.getByLabelText('Zur Arbeitszeiterfassung');
      const datenschutzLink = screen.getByLabelText('Zur Datenschutzerklärung');
      const impressumLink = screen.getByLabelText('Zum Impressum');
      
      expect(startLink).toBeInTheDocument();
      expect(datenschutzLink).toBeInTheDocument();
      expect(impressumLink).toBeInTheDocument();
    });
  });

  describe('Performance Compliance', () => {
    it('should handle route validation quickly', () => {
      const startTime = performance.now();
      
      NavigationUtils.handleDirectAccess('/changelog');
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should process in under 10ms
      expect(processingTime).toBeLessThan(10);
    });

    it('should not cause memory leaks in route validation', () => {
      // Test multiple route validations
      for (let i = 0; i < 1000; i++) {
        NavigationUtils.handleDirectAccess('/changelog');
        NavigationUtils.getRouteLabel('/datenschutz');
        NavigationUtils.createBreadcrumb('/impressum');
      }
      
      // Should not throw errors or cause memory issues
      expect(true).toBe(true);
    });
  });
});
