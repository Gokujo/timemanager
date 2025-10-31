/**
 * Routing Utilities
 * 
 * Provides utilities for routing fixes and direct URL access.
 * Handles route validation, redirects, and 404 error handling.
 */

import { NavigateFunction } from 'react-router-dom';
import { VALID_ROUTES, ValidRoute, ROUTE_LABELS } from '../interfaces/navigation';

/**
 * Routing utility class for direct URL access and route handling
 */
export class RoutingUtils {
  /**
   * Validate if a route is valid
   */
  static isValidRoute(path: string): path is ValidRoute {
    return VALID_ROUTES.includes(path as ValidRoute);
  }

  /**
   * Handle direct URL access with validation and redirects
   */
  static handleDirectAccess(pathname: string): {
    isValid: boolean;
    redirectPath?: string;
    error?: string;
  } {
    // Check if route is valid
    if (this.isValidRoute(pathname)) {
      return { isValid: true };
    }

    // Handle common redirects
    const redirects: Record<string, string> = {
      '/start': '/',
      '/home': '/',
      '/index': '/',
      '/index.html': '/',
      '/einstellungen': '/benutzereinstellungen'
    };

    if (redirects[pathname]) {
      return {
        isValid: false,
        redirectPath: redirects[pathname]
      };
    }

    return {
      isValid: false,
      error: `Ungültige Route: ${pathname}`
    };
  }

  /**
   * Get route label in German
   */
  static getRouteLabel(path: string): string {
    if (this.isValidRoute(path)) {
      return ROUTE_LABELS[path];
    }
    return 'Unbekannte Seite';
  }

  /**
   * Create breadcrumb navigation
   */
  static createBreadcrumb(currentPath: string): Array<{ path: string; label: string }> {
    const breadcrumb = [];
    
    // Always include home
    breadcrumb.push({ path: '/', label: 'Startseite' });
    
    // Add current page if not home
    if (currentPath !== '/') {
      breadcrumb.push({ 
        path: currentPath, 
        label: this.getRouteLabel(currentPath) 
      });
    }
    
    return breadcrumb;
  }

  /**
   * Get navigation suggestions for 404 pages
   */
  static getNavigationSuggestions(): Array<{ path: string; label: string; description: string }> {
    return [
      {
        path: '/',
        label: 'Startseite',
        description: 'Zurück zur Arbeitszeiterfassung'
      },
      {
        path: '/changelog',
        label: 'Changelog',
        description: 'Neueste Änderungen anzeigen'
      },
      {
        path: '/datenschutz',
        label: 'Datenschutz',
        description: 'Datenschutzerklärung lesen'
      },
      {
        path: '/impressum',
        label: 'Impressum',
        description: 'Impressum und Kontakt'
      }
    ];
  }

  /**
   * Navigate to a route with error handling
   */
  static navigateToRoute(
    navigate: NavigateFunction, 
    path: string, 
    options?: { replace?: boolean; state?: any }
  ): boolean {
    try {
      if (this.isValidRoute(path)) {
        navigate(path, options || {});
        return true;
      } else {
        console.warn(`Ungültige Route: ${path}`);
        return false;
      }
    } catch (error) {
      console.error('Fehler bei Navigation:', error);
      return false;
    }
  }

  /**
   * Get route information for current path
   */
  static getRouteInfo(pathname: string): {
    isValid: boolean;
    label: string;
    breadcrumb: Array<{ path: string; label: string }>;
    suggestions?: Array<{ path: string; label: string; description: string }>;
  } {
    const isValid = this.isValidRoute(pathname);
    const label = this.getRouteLabel(pathname);
    const breadcrumb = this.createBreadcrumb(pathname);
    
    const result: any = {
      isValid,
      label,
      breadcrumb
    };

    // Add suggestions for invalid routes
    if (!isValid) {
      result.suggestions = this.getNavigationSuggestions();
    }

    return result;
  }

  /**
   * Handle route errors gracefully
   */
  static handleRouteError(error: Error, pathname: string): {
    message: string;
    suggestions: Array<{ path: string; label: string; description: string }>;
  } {
    console.error('Routing error:', error);
    
    return {
      message: `Fehler beim Laden der Seite ${pathname}`,
      suggestions: this.getNavigationSuggestions()
    };
  }

  /**
   * Check if route requires authentication (for future use)
   */
  static requiresAuthentication(path: string): boolean {
    // Currently all routes are public
    // This method is prepared for future authentication requirements
    return false;
  }

  /**
   * Get route metadata
   */
  static getRouteMetadata(path: string): {
    title: string;
    description: string;
    keywords: string[];
  } {
    const metadata: Record<string, { title: string; description: string; keywords: string[] }> = {
      '/': {
        title: 'Arbeitszeiterfassung - Startseite',
        description: 'Arbeitszeiterfassung und Zeitverfolgung',
        keywords: ['Arbeitszeit', 'Zeiterfassung', 'Zeitverfolgung']
      },
      '/changelog': {
        title: 'Changelog - Arbeitszeiterfassung',
        description: 'Neueste Änderungen und Updates',
        keywords: ['Changelog', 'Updates', 'Änderungen']
      },
      '/datenschutz': {
        title: 'Datenschutz - Arbeitszeiterfassung',
        description: 'Datenschutzerklärung und Datenschutzbestimmungen',
        keywords: ['Datenschutz', 'DSGVO', 'Privatsphäre']
      },
      '/impressum': {
        title: 'Impressum - Arbeitszeiterfassung',
        description: 'Impressum und Kontaktinformationen',
        keywords: ['Impressum', 'Kontakt', 'Anbieter']
      }
    };

    return metadata[path] || {
      title: 'Arbeitszeiterfassung',
      description: 'Arbeitszeiterfassung und Zeitverfolgung',
      keywords: ['Arbeitszeit', 'Zeiterfassung']
    };
  }
}

/**
 * Hook for routing utilities
 */
export function useRoutingUtils() {
  return {
    isValidRoute: RoutingUtils.isValidRoute,
    handleDirectAccess: RoutingUtils.handleDirectAccess,
    getRouteLabel: RoutingUtils.getRouteLabel,
    createBreadcrumb: RoutingUtils.createBreadcrumb,
    getNavigationSuggestions: RoutingUtils.getNavigationSuggestions,
    navigateToRoute: RoutingUtils.navigateToRoute,
    getRouteInfo: RoutingUtils.getRouteInfo,
    handleRouteError: RoutingUtils.handleRouteError,
    requiresAuthentication: RoutingUtils.requiresAuthentication,
    getRouteMetadata: RoutingUtils.getRouteMetadata
  };
}

/**
 * Constants for routing
 */
export const ROUTING_CONSTANTS = {
  NOT_FOUND_PATH: '*',
  HOME_PATH: '/',
  CHANGELOG_PATH: '/changelog',
  DATENSCHUTZ_PATH: '/datenschutz',
  IMPRESSUM_PATH: '/impressum',
  NUTZUNGSBEDINGUNGEN_PATH: '/nutzungsbedingungen',
  BENUTZEREINSTELLUNGEN_PATH: '/benutzereinstellungen',
  MAX_BREADCRUMB_ITEMS: 5,
  DEFAULT_ERROR_MESSAGE: 'Seite nicht gefunden'
} as const;
